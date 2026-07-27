#!/usr/bin/env python3
"""
Carga el punto de partida en la tabla: saldos, deudas, cuentas por cobrar y el
perfil que la IA lee junto a los números.

Se corre una sola vez después del despliegue. Es idempotente — cada registro
tiene id fijo, así que volver a correrlo actualiza en vez de duplicar. Los
montos se editan luego desde el dashboard (pestaña Patrimonio).

    python3 seed.py --table mft-finance-data --region us-east-1
    python3 seed.py --table mft-finance-data --dry-run
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal

EC = timezone(timedelta(hours=-5))

# ------------------------------------------------------------------ datos ---
# Actualizado: 26 de julio de 2026.

ACCOUNTS = [
    # kind: cash | bank | investment  (investment no cuenta para el runway)
    {"id": "paypal", "name": "PayPal", "kind": "bank", "balance": "4500"},
    {"id": "wise", "name": "Wise", "kind": "bank", "balance": "3600"},
    {"id": "procredit", "name": "ProCredit", "kind": "bank", "balance": "3000"},
    {"id": "pichincha", "name": "Pichincha", "kind": "bank", "balance": "2500"},
    {"id": "ibkr", "name": "Interactive Brokers", "kind": "investment", "balance": "2000"},
]

DEBTS = [
    {
        "id": "auto",
        "name": "Préstamo vehículo",
        "kind": "auto",
        "balance": "12800",
        "monthlyPayment": "520",
    },
]

# Facturado y no cobrado. status: pending | paid
RECEIVABLES = [
    {"id": "helixona", "client": "Helixona", "amount": "3800", "status": "pending"},
    {"id": "wfs-1", "client": "WFS", "amount": "1500", "status": "pending"},
    {"id": "wfs-2", "client": "WFS", "amount": "3200", "status": "pending"},
    {"id": "theme-motion", "client": "Theme Motion", "amount": "1000", "status": "pending"},
    {"id": "betan", "client": "Betan", "amount": "400", "status": "pending"},
    {"id": "andrew", "client": "Andrew", "amount": "500", "status": "pending"},
    {"id": "scott", "client": "Scott", "amount": "525", "status": "pending"},
]

# Gastos fijos conocidos, como presupuesto de referencia. No son movimientos:
# los movimientos reales entran solos desde el correo. Esto solo le da a la IA
# (y a las barras de presupuesto) la línea base contra la cual comparar.
BUDGETS = {
    "hogar": "550",  # arriendo
    "suscripciones": "200",  # Claude
    "financiero": "700",  # seguro y afines
}

PROFILE = """Carlos Pozo — Quito, Ecuador. Dueño de MindfulTech.

Ingreso: freelance por proyectos de software, en dólares y en escalada. No hay
sueldo fijo: los meses son irregulares por naturaleza. Helixona es el cliente
más recurrente, con un promedio cercano a 3.000 USD al mes, pero no está
garantizado. Sigue buscando proyectos nuevos de forma activa.

Gastos: alrededor de 3.000 USD al mes en total, incluidos el arriendo (550) y la
cuota del vehículo (520). Seguros y gastos afines suman unos 700 al mes.
Suscripción de Claude: 200 al mes.

Metas declaradas:
1. Aumentar patrimonio y tener estabilidad, no solo rotar dinero.
2. Afiliarse al IESS y pagar al menos la aportación mínima de forma continua.
   Es un requisito de entrada, no un gasto opcional: para acceder a un crédito
   hipotecario decente (BIESS) piden entre dos y tres años de aportaciones. Cada
   mes sin aportar retrasa la fecha en que puede comprar departamento, así que
   arrancar el reloj cuanto antes vale más que el monto que aporte.
3. Comprar un departamento cuando el historial de aportaciones lo permita.

Riesgos a vigilar: concentración de ingreso en pocos clientes, cartera por
cobrar creciendo más rápido de lo que se cobra, y meses sin proyecto nuevo."""


# ----------------------------------------------------------------- carga ----


def rows() -> list[dict]:
    stamp = datetime.now(EC).isoformat()
    out: list[dict] = []
    for a in ACCOUNTS:
        out.append({"pk": "ACCOUNT", "sk": a["id"], "name": a["name"], "kind": a["kind"],
                    "balance": Decimal(a["balance"]), "currency": "USD", "updatedAt": stamp})
    for d in DEBTS:
        out.append({"pk": "DEBT", "sk": d["id"], "name": d["name"], "kind": d["kind"],
                    "balance": Decimal(d["balance"]),
                    "monthlyPayment": Decimal(d["monthlyPayment"]), "updatedAt": stamp})
    for r in RECEIVABLES:
        out.append({"pk": "AR", "sk": r["id"], "client": r["client"],
                    "amount": Decimal(r["amount"]), "status": r["status"], "updatedAt": stamp})
    out.append(
        {
            "pk": "SETTINGS",
            "sk": "v1",
            "currency": "USD",
            # Meta de ingreso: el promedio recurrente conocido, redondeado hacia
            # arriba para que sea una meta y no un espejo.
            "monthlyIncomeGoal": Decimal("5000"),
            "savingsRateGoal": Decimal("30"),
            # Seis meses de gasto: el colchón estándar, y más necesario aún con
            # ingreso por proyecto.
            "emergencyFundGoal": Decimal("18000"),
            "budgets": {k: Decimal(v) for k, v in BUDGETS.items()},
            "profile": PROFILE,
        }
    )
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--table", default="mft-finance-data")
    ap.add_argument("--region", default="us-east-1")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    items = rows()
    if args.dry_run:
        print(json.dumps(items, indent=2, default=str, ensure_ascii=False))
        print(f"\n{len(items)} registros (dry run — no se escribió nada)", file=sys.stderr)
        return 0

    import boto3

    table = boto3.resource("dynamodb", region_name=args.region).Table(args.table)
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)

    liquid = sum(Decimal(a["balance"]) for a in ACCOUNTS if a["kind"] != "investment")
    invested = sum(Decimal(a["balance"]) for a in ACCOUNTS if a["kind"] == "investment")
    debt = sum(Decimal(d["balance"]) for d in DEBTS)
    pending = sum(Decimal(r["amount"]) for r in RECEIVABLES)
    print(f"Escritos {len(items)} registros en {args.table}.")
    print(f"  Líquido            ${liquid:,.2f}")
    print(f"  Invertido          ${invested:,.2f}")
    print(f"  Deuda              ${debt:,.2f}")
    print(f"  Patrimonio neto    ${liquid + invested - debt:,.2f}")
    print(f"  Por cobrar         ${pending:,.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
