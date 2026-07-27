"""
Callback público del consentimiento de Microsoft.

Es la única ruta sin authorizer JWT — tiene que serlo, porque quien la abre es
el navegador siguiendo una redirección de Microsoft y ahí no hay forma de mandar
la cabecera Authorization. Lo que la protege es el `state` firmado con HMAC que
emitió `POST /oauth/url` (ruta sí autenticada): sin esa firma, y sin haber sido
emitida en los últimos 15 minutos, el callback no canjea nada.
"""

from __future__ import annotations

import html
import logging
import os

from finance import graph
from finance.util import verify_state

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("oauth")


def _page(title: str, message: str, ok: bool) -> dict:
    back = os.environ.get("SITE_ORIGIN", "https://mindfultech.ec") + "/finance/"
    accent = "#69c7b9" if ok else "#d97362"
    body = f"""<!doctype html><html lang="es"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<body style="margin:0;font-family:system-ui,sans-serif;background:#eef2fa;display:flex;
min-height:100vh;align-items:center;justify-content:center;padding:24px">
<div style="max-width:420px;background:#fff;border-radius:18px;padding:34px 30px;text-align:center;
border:1px solid rgba(14,13,18,.08);box-shadow:0 30px 70px -34px rgba(14,13,18,.4)">
  <div style="width:44px;height:44px;border-radius:12px;background:{accent};margin:0 auto 16px"></div>
  <h1 style="font-size:21px;font-weight:500;margin:0 0 8px;color:#0e0d12">{html.escape(title)}</h1>
  <p style="font-size:14px;line-height:1.55;color:#6c6a75;margin:0 0 22px">{html.escape(message)}</p>
  <a href="{html.escape(back)}" style="display:inline-block;background:#0e0d12;color:#fff;
  text-decoration:none;padding:11px 20px;border-radius:9px;font-size:14px">Volver al dashboard</a>
</div></body></html>"""
    return {
        "statusCode": 200 if ok else 400,
        "headers": {"content-type": "text/html; charset=utf-8", "cache-control": "no-store"},
        "body": body,
    }


def handler(event, context):  # noqa: ARG001
    qs = event.get("queryStringParameters") or {}

    if qs.get("error"):
        return _page(
            "Microsoft canceló la conexión",
            f"{qs.get('error')}: {qs.get('error_description', '')}",
            ok=False,
        )

    code, state = qs.get("code"), qs.get("state")
    if not code or not state:
        return _page("Falta información", "Microsoft no envió el código de autorización.", ok=False)

    try:
        key = graph.ensure_state_key()
    except Exception:
        log.exception("no se pudo leer el secreto")
        return _page("Error de configuración", "No se pudo leer el secreto de Microsoft Graph.", ok=False)

    payload = verify_state(key, state)
    if not payload:
        return _page(
            "Enlace inválido o vencido",
            "Vuelve al dashboard y presiona “Conectar Outlook” otra vez.",
            ok=False,
        )

    try:
        graph.exchange_code(code, payload["redirect"])
    except Exception as e:
        log.exception("falló el canje del código")
        return _page("No se pudo conectar", str(e)[:200], ok=False)

    return _page(
        "Outlook conectado",
        "Desde ahora tus consumos de Diners entran solos al dashboard, cada 15 minutos.",
        ok=True,
    )
