"""
Agregados que consumen tanto el dashboard como el diagnóstico de Claude.

Un solo lugar para decidir qué cuenta como gasto, qué como ingreso y cómo se
calcula la tasa de ahorro — si esto viviera en dos sitios, el número del
gráfico y el número del que habla la IA acabarían discrepando.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Iterable

from .util import money, month_range, now_ec

ZERO = Decimal("0.00")


def summarize_month(txns: Iterable[dict]) -> dict:
    income, expense = ZERO, ZERO
    by_category: dict[str, Decimal] = {}
    by_merchant: dict[str, Decimal] = {}
    count = 0
    for t in txns:
        if t.get("excluded"):
            continue
        amount = money(t.get("amount"))
        count += 1
        if t.get("kind") == "income":
            income += amount
            continue
        expense += amount
        cat = t.get("category") or "otros"
        by_category[cat] = by_category.get(cat, ZERO) + amount
        merchant = t.get("merchant") or "—"
        by_merchant[merchant] = by_merchant.get(merchant, ZERO) + amount
    net = income - expense
    rate = (net / income * 100).quantize(Decimal("0.1")) if income > 0 else ZERO
    return {
        "income": income,
        "expense": expense,
        "net": net,
        "savingsRate": rate,
        "count": count,
        "byCategory": dict(sorted(by_category.items(), key=lambda kv: kv[1], reverse=True)),
        "topMerchants": dict(sorted(by_merchant.items(), key=lambda kv: kv[1], reverse=True)[:10]),
    }


def build_summary(months_data: dict[str, list[dict]], settings: dict | None = None) -> dict:
    """Resumen por mes + totales + deltas contra el mes anterior."""
    keys = sorted(months_data.keys())
    months = [{"month": k, **summarize_month(months_data[k])} for k in keys]

    current = months[-1] if months else None
    previous = months[-2] if len(months) > 1 else None

    def delta(field: str) -> Decimal:
        if not current or not previous:
            return ZERO
        return money(current[field]) - money(previous[field])

    closed = [m for m in months[:-1] if m["count"] > 0]  # meses completos, sin el actual
    avg_expense = (
        (sum((money(m["expense"]) for m in closed), ZERO) / len(closed)).quantize(Decimal("0.01"))
        if closed
        else ZERO
    )
    avg_income = (
        (sum((money(m["income"]) for m in closed), ZERO) / len(closed)).quantize(Decimal("0.01"))
        if closed
        else ZERO
    )

    # Proyección del mes en curso: gasto diario del mes × días del mes.
    today = now_ec()
    projected = ZERO
    if current and current["month"] == today.strftime("%Y-%m") and today.day > 0:
        import calendar

        days_in_month = calendar.monthrange(today.year, today.month)[1]
        daily = money(current["expense"]) / Decimal(today.day)
        projected = (daily * Decimal(days_in_month)).quantize(Decimal("0.01"))

    budgets = (settings or {}).get("budgets") or {}
    budget_status = []
    if current:
        for cat, limit in budgets.items():
            spent = money(current["byCategory"].get(cat, ZERO))
            budget_status.append(
                {
                    "category": cat,
                    "limit": money(limit),
                    "spent": spent,
                    "pct": (spent / money(limit) * 100).quantize(Decimal("0.1"))
                    if money(limit) > 0
                    else ZERO,
                }
            )

    return {
        "months": months,
        "current": current,
        "previous": previous,
        "deltas": {
            "income": delta("income"),
            "expense": delta("expense"),
            "net": delta("net"),
        },
        "averages": {"expense": avg_expense, "income": avg_income},
        "projectedExpense": projected,
        "budgets": budget_status,
        "generatedAt": now_ec().isoformat(),
    }


def build_networth(accounts: list[dict], debts: list[dict], receivables: list[dict], avg_expense: Decimal) -> dict:
    """
    Patrimonio, y las dos cifras que dicen si hay estabilidad:

    - `runway`: meses que aguanta el efectivo si mañana no entra un dólar. Para
      alguien que factura por proyecto es el número más honesto de todos.
    - `pending`: lo facturado y no cobrado. No es patrimonio (todavía), pero sí
      explica por qué la cuenta puede verse floja un mes bueno.
    """
    liquid = sum((money(a.get("balance")) for a in accounts if a.get("kind") != "investment"), ZERO)
    invested = sum((money(a.get("balance")) for a in accounts if a.get("kind") == "investment"), ZERO)
    debt_total = sum((money(d.get("balance")) for d in debts), ZERO)
    monthly_debt = sum((money(d.get("monthlyPayment")) for d in debts), ZERO)
    pending = sum((money(r.get("amount")) for r in receivables if r.get("status") != "paid"), ZERO)
    assets = liquid + invested
    runway = (liquid / avg_expense).quantize(Decimal("0.1")) if avg_expense > 0 else ZERO
    return {
        "liquid": liquid,
        "invested": invested,
        "assets": assets,
        "debt": debt_total,
        "monthlyDebtPayment": monthly_debt,
        "netWorth": assets - debt_total,
        "receivablesPending": pending,
        # Con lo cobrado encima: el colchón real si los clientes pagan.
        "netWorthWithReceivables": assets - debt_total + pending,
        "runwayMonths": runway,
    }


def insight_payload(
    months_data: dict[str, list[dict]],
    settings: dict,
    networth: dict | None = None,
    debts: list[dict] | None = None,
    receivables: list[dict] | None = None,
) -> dict:
    """
    Versión compacta para mandarle a Claude: agregados y los movimientos más
    grandes, nunca el listado completo (ni hace falta, ni cabe barato).
    """
    summary = build_summary(months_data, settings)
    biggest: list[dict] = []
    for month in sorted(months_data.keys())[-2:]:
        rows = [t for t in months_data[month] if not t.get("excluded") and t.get("kind") != "income"]
        rows.sort(key=lambda t: money(t.get("amount")), reverse=True)
        for t in rows[:15]:
            biggest.append(
                {
                    "month": month,
                    "date": t.get("date"),
                    "merchant": t.get("merchant"),
                    "amount": money(t.get("amount")),
                    "category": t.get("category"),
                }
            )
    return {
        "moneda": settings.get("currency", "USD"),
        "perfil": settings.get("profile", ""),
        "metas": {
            "ingresoMensualObjetivo": money(settings.get("monthlyIncomeGoal")),
            "tasaAhorroObjetivo": money(settings.get("savingsRateGoal")),
            "fondoEmergenciaObjetivo": money(settings.get("emergencyFundGoal")),
        },
        "patrimonio": networth or {},
        "deudas": [
            {
                "nombre": d.get("name"),
                "saldo": money(d.get("balance")),
                "cuotaMensual": money(d.get("monthlyPayment")),
                "tipo": d.get("kind"),
            }
            for d in (debts or [])
        ],
        "porCobrar": [
            {"cliente": r.get("client"), "monto": money(r.get("amount")), "estado": r.get("status")}
            for r in (receivables or [])
            if r.get("status") != "paid"
        ],
        "meses": [
            {
                "mes": m["month"],
                "ingresos": m["income"],
                "gastos": m["expense"],
                "neto": m["net"],
                "tasaAhorro": m["savingsRate"],
                "porCategoria": m["byCategory"],
            }
            for m in summary["months"]
        ],
        "promedios": summary["averages"],
        "proyeccionMesActual": summary["projectedExpense"],
        "presupuestos": summary["budgets"],
        "mayoresGastos": biggest,
    }


def default_months(count: int = 6) -> list[str]:
    return month_range(now_ec(), count)
