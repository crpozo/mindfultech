"""
API del dashboard. Todas las rutas de aquí pasan por el authorizer JWT de
Cognito del HTTP API — si el token no es válido, API Gateway responde 401 y
esta lambda ni se ejecuta.

  GET    /summary?months=6
  GET    /transactions?month=YYYY-MM
  POST   /transactions              alta manual (efectivo, transferencia, ingreso)
  PATCH  /transactions/{month}/{sk} categoría, notas, excluir
  DELETE /transactions/{month}/{sk}
  GET    /insights                  último diagnóstico guardado
  POST   /insights/refresh          regenerar ahora (async)
  GET    /rules   POST /rules   DELETE /rules/{pattern}
  GET    /settings  POST /settings
  POST   /sync                      correr la ingesta ahora  (body: {days})
  GET    /status                    ¿Outlook conectado? ¿última sync?
  POST   /oauth/url                 URL de consentimiento de Microsoft (firmada)
"""

from __future__ import annotations

import json
import logging
import os
import time
import urllib.parse
from datetime import datetime

import boto3

from finance import graph, store
from finance.analytics import build_summary, default_months
from finance.categories import CATEGORIES, INCOME_CATEGORIES, is_valid
from finance.util import EC, money, month_key, now_ec, respond, sign_state, txn_id

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("api")

_lambda = boto3.client("lambda")


def _origin(event: dict) -> str:
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    return headers.get("origin", "")


def _body(event: dict) -> dict:
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        import base64

        raw = base64.b64decode(raw).decode()
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        return {}


def _invoke_async(function_env: str, payload: dict) -> bool:
    name = os.environ.get(function_env)
    if not name:
        return False
    _lambda.invoke(FunctionName=name, InvocationType="Event", Payload=json.dumps(payload).encode())
    return True


def _redirect_uri(event: dict) -> str:
    """El callback registrado en Azure: el mismo API, ruta /oauth/callback."""
    ctx = event.get("requestContext", {})
    domain = ctx.get("domainName", "")
    stage = ctx.get("stage", "")
    prefix = f"/{stage}" if stage and stage != "$default" else ""
    return f"https://{domain}{prefix}/oauth/callback"


# ------------------------------------------------------------------- rutas --


def get_summary(event: dict) -> tuple[int, dict]:
    qs = event.get("queryStringParameters") or {}
    try:
        count = max(1, min(24, int(qs.get("months", 6))))
    except (TypeError, ValueError):
        count = 6
    months = default_months(count)
    data = store.list_months(months)
    settings = store.get_settings()
    summary = build_summary(data, settings)
    summary["settings"] = settings
    summary["categories"] = {"expense": CATEGORIES, "income": INCOME_CATEGORIES}
    return 200, summary


def get_transactions(event: dict) -> tuple[int, dict]:
    qs = event.get("queryStringParameters") or {}
    month = qs.get("month") or month_key(now_ec())
    items = store.list_transactions(month)
    items.sort(key=lambda t: t.get("date", ""), reverse=True)
    return 200, {"month": month, "transactions": [_public(t) for t in items]}


def _public(t: dict) -> dict:
    out = {k: v for k, v in t.items() if k != "pk"}
    out["sk"] = t.get("sk", "")
    return out


def create_transaction(event: dict) -> tuple[int, dict]:
    body = _body(event)
    amount = money(body.get("amount"))
    merchant = str(body.get("merchant") or "").strip()[:80]
    if amount <= 0 or not merchant:
        return 400, {"error": "amount y merchant son obligatorios"}

    kind = "income" if body.get("kind") == "income" else "expense"
    raw_date = str(body.get("date") or "").strip()
    try:
        when = (
            datetime.fromisoformat(raw_date.replace("Z", "+00:00")).astimezone(EC)
            if raw_date
            else now_ec()
        )
    except ValueError:
        when = now_ec()

    category = str(body.get("category") or ("otros_ingresos" if kind == "income" else "otros"))
    if not is_valid(category, kind):
        category = "otros_ingresos" if kind == "income" else "otros"

    txn = {
        "id": txn_id("", f"{merchant}{amount}{time.time()}"),
        "month": when.strftime("%Y-%m"),
        "date": when.isoformat(),
        "amount": amount,
        "currency": str(body.get("currency") or "USD")[:4],
        "merchant": merchant,
        "card": str(body.get("card") or "")[:4],
        "kind": kind,
        "category": category,
        "source": "manual",
        "bank": "",
        "messageId": "",
        "subject": "",
        "excluded": False,
        "notes": str(body.get("notes") or "")[:400],
        "createdAt": now_ec().isoformat(),
    }
    store.put_transaction(txn)
    return 201, {"transaction": txn}


def patch_transaction(event: dict, month: str, sk: str) -> tuple[int, dict]:
    body = _body(event)
    changes: dict = {}
    if "category" in body:
        kind = str(body.get("kind") or "expense")
        if not is_valid(str(body["category"]), kind):
            return 400, {"error": "categoría inválida"}
        changes["category"] = body["category"]
    if "notes" in body:
        changes["notes"] = str(body["notes"])[:400]
    if "excluded" in body:
        changes["excluded"] = bool(body["excluded"])
    if "merchant" in body:
        changes["merchant"] = str(body["merchant"])[:80]
    if "amount" in body:
        amount = money(body["amount"])
        if amount <= 0:
            return 400, {"error": "amount debe ser mayor a cero"}
        changes["amount"] = amount
    if not changes:
        return 400, {"error": "nada que actualizar"}

    updated = store.update_transaction(month, urllib.parse.unquote(sk), changes)
    if not updated:
        return 404, {"error": "transacción no encontrada"}

    # Aprender del usuario: si recategoriza a mano, la próxima vez sale sola.
    if "category" in changes and updated.get("merchant"):
        pattern = str(updated["merchant"]).lower()[:60]
        if len(pattern) >= 3:
            store.put_rule(pattern, changes["category"])
    return 200, {"transaction": _public(updated)}


def delete_transaction(month: str, sk: str) -> tuple[int, dict]:
    store.delete_transaction(month, urllib.parse.unquote(sk))
    return 200, {"ok": True}


def get_insights() -> tuple[int, dict]:
    return 200, {"insight": store.latest_insight()}


def refresh_insights() -> tuple[int, dict]:
    queued = _invoke_async("INSIGHTS_FUNCTION", {})
    return (202, {"queued": True}) if queued else (503, {"error": "no configurado"})


def get_rules() -> tuple[int, dict]:
    return 200, {"rules": store.list_rules()}


def post_rule(event: dict) -> tuple[int, dict]:
    body = _body(event)
    pattern = str(body.get("pattern") or "").strip().lower()
    category = str(body.get("category") or "")
    if len(pattern) < 3 or not (is_valid(category, "expense") or is_valid(category, "income")):
        return 400, {"error": "pattern (3+ caracteres) y category válida son obligatorios"}
    store.put_rule(pattern, category)
    return 200, {"ok": True}


def delete_rule(pattern: str) -> tuple[int, dict]:
    store.delete_rule(urllib.parse.unquote(pattern))
    return 200, {"ok": True}


def get_settings() -> tuple[int, dict]:
    return 200, {"settings": store.get_settings()}


def post_settings(event: dict) -> tuple[int, dict]:
    return 200, {"settings": store.put_settings(_body(event))}


def post_sync(event: dict) -> tuple[int, dict]:
    body = _body(event)
    payload: dict = {}
    try:
        if body.get("days"):
            payload["days"] = max(1, min(365, int(body["days"])))
    except (TypeError, ValueError):
        pass
    queued = _invoke_async("INGEST_FUNCTION", payload)
    return (202, {"queued": True, **payload}) if queued else (503, {"error": "no configurado"})


def get_status() -> tuple[int, dict]:
    state = store.get_state("ingest")
    connected = graph.is_connected()
    return 200, {
        "outlookConnected": connected,
        "mailbox": graph.mailbox_address() if connected else "",
        "senders": [s for s in os.environ.get("MAIL_SENDERS", "").split(",") if s],
        "lastSyncAt": state.get("ranAt", ""),
        "lastMessageAt": state.get("lastReceived", ""),
        "model": os.environ.get("BEDROCK_MODEL_ID", ""),
    }


def post_oauth_url(event: dict) -> tuple[int, dict]:
    """
    Devuelve la URL de consentimiento de Microsoft. El `state` va firmado con
    HMAC porque el callback (que el navegador abre por redirección) no puede
    llevar cabecera Authorization: la firma es lo que prueba que ese callback
    corresponde a una sesión autenticada de este dashboard.
    """
    try:
        key = graph.ensure_state_key()
        redirect = _redirect_uri(event)
        state = sign_state(key, {"ts": time.time(), "redirect": redirect})
        return 200, {"url": graph.authorize_url(redirect, state), "redirectUri": redirect}
    except graph.NotConnected as e:
        return 409, {"error": str(e), "hint": "falta poner client_id/client_secret en Secrets Manager"}
    except Exception:
        log.exception("no se pudo construir la URL de OAuth")
        return 500, {"error": "no se pudo construir la URL de OAuth"}


# ----------------------------------------------------------------- router ---

ROUTES_NO_ARGS = {
    ("GET", "/insights"): lambda e: get_insights(),
    ("POST", "/insights/refresh"): lambda e: refresh_insights(),
    ("GET", "/rules"): lambda e: get_rules(),
    ("POST", "/rules"): post_rule,
    ("GET", "/settings"): lambda e: get_settings(),
    ("POST", "/settings"): post_settings,
    ("POST", "/sync"): post_sync,
    ("GET", "/status"): lambda e: get_status(),
    ("POST", "/oauth/url"): post_oauth_url,
    ("GET", "/summary"): get_summary,
    ("GET", "/transactions"): get_transactions,
    ("POST", "/transactions"): create_transaction,
}


def handler(event, context):  # noqa: ARG001
    origin = _origin(event)
    method = (event.get("requestContext", {}).get("http", {}) or {}).get("method", "GET")
    path = "/" + (event.get("rawPath", "/") or "/").lstrip("/")
    stage = event.get("requestContext", {}).get("stage", "")
    if stage and path.startswith(f"/{stage}/"):
        path = path[len(stage) + 1 :]
    path = path.rstrip("/") or "/"

    if method == "OPTIONS":
        return respond(204, {}, origin)

    try:
        fn = ROUTES_NO_ARGS.get((method, path))
        if fn:
            status, body = fn(event)
            return respond(status, body, origin)

        parts = [p for p in path.split("/") if p]
        if len(parts) == 3 and parts[0] == "transactions":
            month, sk = parts[1], parts[2]
            if method == "PATCH":
                status, body = patch_transaction(event, month, sk)
                return respond(status, body, origin)
            if method == "DELETE":
                status, body = delete_transaction(month, sk)
                return respond(status, body, origin)
        if len(parts) == 2 and parts[0] == "rules" and method == "DELETE":
            status, body = delete_rule(parts[1])
            return respond(status, body, origin)

        return respond(404, {"error": f"ruta desconocida: {method} {path}"}, origin)
    except Exception:
        log.exception("error en %s %s", method, path)
        return respond(500, {"error": "error interno"}, origin)
