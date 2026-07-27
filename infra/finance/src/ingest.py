"""
Ingesta: Outlook → transacciones categorizadas.

Corre cada 15 minutos por EventBridge, y también a pedido desde el dashboard
(botón "Sincronizar" / backfill de N días).

Flujo por correo:
  1. ¿Ya lo procesamos? (marca MSG en DynamoDB, condicional → sin duplicados)
  2. Parser determinístico de plantillas de banco.
  3. Si falla, extractor con Claude — así un banco nuevo funciona sin código.
  4. Categoría: reglas del usuario → reglas base → Claude (y la respuesta de
     Claude se guarda como regla, para no volver a pagar por el mismo comercio).
"""

from __future__ import annotations

import logging
import os
from datetime import timedelta

from finance import ai, graph, parsers, store
from finance.categories import match_rules, normalize
from finance.parsers import looks_like_transaction
from finance.util import EC, money, now_ec, strip_html, txn_id

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("ingest")

# Cuánto retroceder la primera vez (o cuando el estado se pierde).
FIRST_RUN_DAYS = 90
# Solapamiento al releer: los correos pueden llegar desordenados por unos
# minutos. El dedupe por message-id hace que releer sea inofensivo.
OVERLAP_MINUTES = 30


def senders() -> list[str]:
    return [s.strip().lower() for s in os.environ.get("MAIL_SENDERS", "").split(",") if s.strip()]


def _since(explicit_days: int | None) -> str:
    if explicit_days:
        start = now_ec() - timedelta(days=explicit_days)
        return start.astimezone(EC).strftime("%Y-%m-%dT%H:%M:%SZ")
    state = store.get_state("ingest")
    last = state.get("lastReceived")
    if not last:
        start = now_ec() - timedelta(days=FIRST_RUN_DAYS)
    else:
        from datetime import datetime

        start = datetime.fromisoformat(last) - timedelta(minutes=OVERLAP_MINUTES)
    return start.strftime("%Y-%m-%dT%H:%M:%SZ")


def _to_transaction(msg: dict, parsed: dict, source: str) -> dict:
    from datetime import datetime

    when = datetime.fromisoformat(str(parsed["date"]).replace("Z", "+00:00"))
    if when.tzinfo is None:
        when = when.replace(tzinfo=EC)
    when = when.astimezone(EC)
    return {
        "id": txn_id(msg.get("id", ""), parsed.get("merchant", "")),
        "month": when.strftime("%Y-%m"),
        "date": when.isoformat(),
        "amount": money(parsed["amount"]),
        "currency": parsed.get("currency") or "USD",
        "merchant": parsed.get("merchant", "")[:80],
        "card": str(parsed.get("card") or "")[:4],
        "kind": parsed.get("kind") or "expense",
        "category": "otros",
        "source": source,
        "bank": parsed.get("bank") or msg.get("from", ""),
        "messageId": msg.get("id", ""),
        "subject": msg.get("subject", "")[:160],
        "excluded": False,
        "notes": "",
        "createdAt": now_ec().isoformat(),
    }


def _assign_categories(txns: list[dict], rules: list[dict]) -> None:
    """Reglas primero; lo que quede sin categoría va (en un solo lote) a Claude."""
    pending_expense: list[str] = []
    pending_income: list[str] = []
    for t in txns:
        cat = match_rules(t["merchant"], rules) if t["kind"] == "expense" else None
        if cat:
            t["category"] = cat
            continue
        (pending_income if t["kind"] == "income" else pending_expense).append(t["merchant"])

    for kind, pending in (("expense", pending_expense), ("income", pending_income)):
        if not pending:
            continue
        unique = sorted(set(pending))
        guesses = ai.categorize(unique, kind=kind)
        if not guesses:
            continue
        for t in txns:
            if t["kind"] != kind or t["category"] != "otros":
                continue
            g = guesses.get(t["merchant"])
            if g:
                t["category"] = g["category"]
        # Memorizar: la próxima vez este comercio se resuelve sin llamar al modelo.
        for merchant, g in guesses.items():
            pattern = (g.get("rule") or normalize(merchant))[:60].strip()
            if len(pattern) >= 3 and g.get("category"):
                try:
                    store.put_rule(pattern, g["category"])
                except Exception:
                    log.exception("no se pudo guardar la regla %s", pattern)


def run(days: int | None = None) -> dict:
    if not graph.is_connected():
        return {"ok": False, "reason": "outlook_not_connected", "imported": 0}

    since = _since(days)
    log.info("leyendo correo desde %s", since)
    messages = graph.fetch_messages(since, senders())
    log.info("%d correos de remitentes conocidos", len(messages))

    new_txns: list[dict] = []
    skipped, latest_received = 0, None

    for msg in messages:
        received = msg.get("receivedDateTime") or ""
        if received and (latest_received is None or received > latest_received):
            latest_received = received

        if not store.claim_message(msg["id"]):
            skipped += 1
            continue

        body_text = strip_html(msg.get("body", ""))
        if not looks_like_transaction(msg.get("subject", ""), body_text):
            continue

        parsed = parsers.parse_email(msg.get("subject", ""), msg.get("body", ""), received)
        source = "email"
        if not parsed:
            parsed = ai.extract_transaction(msg.get("subject", ""), body_text, received)
            source = "email-ai"
        if not parsed:
            log.info("correo sin transacción reconocible: %s", msg.get("subject", "")[:60])
            continue

        try:
            new_txns.append(_to_transaction(msg, parsed, source))
        except Exception:
            log.exception("no se pudo normalizar: %s", msg.get("subject", "")[:60])

    if new_txns:
        _assign_categories(new_txns, store.list_rules())
        for t in new_txns:
            store.put_transaction(t)

    if latest_received:
        from datetime import datetime

        marker = datetime.fromisoformat(latest_received.replace("Z", "+00:00")).astimezone(EC)
        store.put_state("ingest", {"lastReceived": marker.isoformat(), "ranAt": now_ec().isoformat()})
    else:
        store.put_state(
            "ingest",
            {**store.get_state("ingest"), "ranAt": now_ec().isoformat()},
        )

    return {
        "ok": True,
        "scanned": len(messages),
        "imported": len(new_txns),
        "alreadySeen": skipped,
        "since": since,
    }


def handler(event, context):  # noqa: ARG001
    days = None
    if isinstance(event, dict):
        try:
            days = int(event.get("days")) if event.get("days") else None
        except (TypeError, ValueError):
            days = None
    result = run(days)
    log.info("ingesta: %s", result)
    return result
