"""
Acceso a DynamoDB (tabla única).

Layout de claves
----------------
  TXN#<YYYY-MM>  / <ISO-8601>#<id>   una transacción (gasto o ingreso)
  MSG            / <message-id>      marca de correo ya procesado (dedupe)
  RULE           / <patrón>          regla de categorización del usuario
  INSIGHT        / <ISO-8601>        diagnóstico generado por Claude
  SETTINGS       / v1                metas, presupuestos, moneda
  STATE          / ingest            última marca de tiempo leída del correo

Consultar un mes es un solo Query sobre TXN#<mes>, que es la operación que el
dashboard hace todo el tiempo; por eso el mes va en la partition key.
"""

from __future__ import annotations

import os
from decimal import Decimal
from typing import Any, Iterable

import boto3
from boto3.dynamodb.conditions import Key

from .util import money, now_ec

_ddb = boto3.resource("dynamodb")
_table = None


def table():
    global _table
    if _table is None:
        _table = _ddb.Table(os.environ["TABLE_NAME"])
    return _table


# ------------------------------------------------------------ transacciones --


def put_transaction(txn: dict) -> None:
    item = dict(txn)
    item["pk"] = f"TXN#{txn['month']}"
    item["sk"] = f"{txn['date']}#{txn['id']}"
    item["amount"] = money(txn.get("amount"))
    table().put_item(Item=item)


def list_transactions(month: str) -> list[dict]:
    items: list[dict] = []
    kwargs: dict[str, Any] = {"KeyConditionExpression": Key("pk").eq(f"TXN#{month}")}
    while True:
        resp = table().query(**kwargs)
        items.extend(resp.get("Items", []))
        if "LastEvaluatedKey" not in resp:
            return items
        kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]


def list_months(months: Iterable[str]) -> dict[str, list[dict]]:
    return {m: list_transactions(m) for m in months}


def update_transaction(month: str, sk: str, changes: dict) -> dict | None:
    allowed = {"category", "notes", "excluded", "merchant", "kind", "amount"}
    sets, names, values = [], {}, {}
    for i, (k, v) in enumerate(c for c in changes.items() if c[0] in allowed):
        sets.append(f"#f{i} = :v{i}")
        names[f"#f{i}"] = k
        values[f":v{i}"] = money(v) if k == "amount" else v
    if not sets:
        return None
    resp = table().update_item(
        Key={"pk": f"TXN#{month}", "sk": sk},
        UpdateExpression="SET " + ", ".join(sets),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )
    return resp.get("Attributes")


def delete_transaction(month: str, sk: str) -> None:
    table().delete_item(Key={"pk": f"TXN#{month}", "sk": sk})


# ------------------------------------------------------------------ dedupe --


def claim_message(message_id: str) -> bool:
    """
    True si este correo no se había procesado. La condición hace la carrera
    imposible: si dos ejecuciones del cron se solapan, solo una escribe.
    """
    try:
        table().put_item(
            Item={"pk": "MSG", "sk": message_id, "seenAt": now_ec().isoformat()},
            ConditionExpression="attribute_not_exists(pk) AND attribute_not_exists(sk)",
        )
        return True
    except _ddb.meta.client.exceptions.ConditionalCheckFailedException:
        return False


# ------------------------------------------------------------------ reglas --


def list_rules() -> list[dict]:
    resp = table().query(KeyConditionExpression=Key("pk").eq("RULE"))
    return [{"pattern": i["sk"], "category": i.get("category", "otros")} for i in resp.get("Items", [])]


def put_rule(pattern: str, category: str) -> None:
    table().put_item(Item={"pk": "RULE", "sk": pattern.strip().lower(), "category": category})


def delete_rule(pattern: str) -> None:
    table().delete_item(Key={"pk": "RULE", "sk": pattern.strip().lower()})


# --------------------------------------------------------------- insights ---


def put_insight(insight: dict) -> None:
    item = dict(insight)
    item["pk"] = "INSIGHT"
    item["sk"] = insight.get("createdAt") or now_ec().isoformat()
    table().put_item(Item=item)


def latest_insight() -> dict | None:
    resp = table().query(
        KeyConditionExpression=Key("pk").eq("INSIGHT"),
        ScanIndexForward=False,
        Limit=1,
    )
    items = resp.get("Items", [])
    return items[0] if items else None


# ------------------------------------------------------ settings y estado ---

DEFAULT_SETTINGS = {
    "currency": "USD",
    "monthlyIncomeGoal": Decimal("0"),
    "savingsRateGoal": Decimal("20"),
    "emergencyFundGoal": Decimal("0"),
    "budgets": {},
}


def get_settings() -> dict:
    resp = table().get_item(Key={"pk": "SETTINGS", "sk": "v1"})
    item = resp.get("Item") or {}
    merged = {**DEFAULT_SETTINGS, **{k: v for k, v in item.items() if k not in ("pk", "sk")}}
    return merged


def put_settings(settings: dict) -> dict:
    current = get_settings()
    for key in ("monthlyIncomeGoal", "savingsRateGoal", "emergencyFundGoal"):
        if key in settings:
            current[key] = money(settings[key])
    if "budgets" in settings and isinstance(settings["budgets"], dict):
        current["budgets"] = {k: money(v) for k, v in settings["budgets"].items()}
    if "currency" in settings:
        current["currency"] = str(settings["currency"])[:4]
    table().put_item(Item={"pk": "SETTINGS", "sk": "v1", **current})
    return current


def get_state(name: str) -> dict:
    resp = table().get_item(Key={"pk": "STATE", "sk": name})
    return resp.get("Item") or {}


def put_state(name: str, data: dict) -> None:
    table().put_item(Item={"pk": "STATE", "sk": name, **data})
