"""
Diagnóstico financiero diario con Claude (Bedrock).

Toma los últimos 6 meses agregados, se los pasa al modelo y guarda el veredicto
en DynamoDB. El dashboard lee siempre el último guardado, así que abrir la
página nunca dispara una llamada al modelo (ni su latencia, ni su costo).
"""

from __future__ import annotations

import logging
import os

from finance import ai, store
from finance.analytics import build_networth, default_months, insight_payload
from finance.util import money, now_ec

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("insights")

MONTHS = 6


def run() -> dict:
    months = default_months(MONTHS)
    data = store.list_months(months)
    settings = store.get_settings()

    total = sum(len(v) for v in data.values())
    has_balance = bool(store.list_balance("ACCOUNT") or store.list_balance("DEBT"))
    if total == 0 and not has_balance:
        return {"ok": False, "reason": "sin_datos"}

    accounts = store.list_balance("ACCOUNT")
    debts = store.list_balance("DEBT")
    receivables = store.list_balance("AR")
    from finance.analytics import build_summary

    summary = build_summary(data, settings)
    avg = money(summary["averages"]["expense"]) or money((summary["current"] or {}).get("expense"))
    networth = build_networth(accounts, debts, receivables, avg)

    payload = insight_payload(data, settings, networth, debts, receivables)
    verdict = ai.diagnose(payload)
    if not verdict:
        return {"ok": False, "reason": "modelo_no_disponible"}

    insight = {
        "createdAt": now_ec().isoformat(),
        "model": ai.MODEL_ID,
        "monthsAnalyzed": months,
        "healthScore": int(verdict.get("healthScore", 0)),
        "verdict": verdict.get("verdict", "atencion"),
        "headline": verdict.get("headline", ""),
        "summary": verdict.get("summary", ""),
        "wins": verdict.get("wins", []),
        "risks": verdict.get("risks", []),
        "actions": [
            {
                "title": a.get("title", ""),
                "why": a.get("why", ""),
                "impactMonthly": money(a.get("impactMonthly", 0)),
                "effort": a.get("effort", "medio"),
            }
            for a in verdict.get("actions", [])
        ],
        "forecast": {
            "nextMonthExpense": money(verdict.get("forecast", {}).get("nextMonthExpense", 0)),
            "savingsRate": money(verdict.get("forecast", {}).get("savingsRate", 0)),
            "runwayMonths": money(verdict.get("forecast", {}).get("runwayMonths", 0)),
        },
    }
    store.put_insight(insight)
    return {"ok": True, "healthScore": insight["healthScore"], "createdAt": insight["createdAt"]}


def handler(event, context):  # noqa: ARG001
    result = run()
    log.info("diagnóstico: %s", result)
    return result
