"""Utilidades compartidas: fechas de Ecuador, dinero, HMAC, respuestas HTTP."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import time
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

# Ecuador no usa horario de verano: UTC-5 todo el año.
EC = timezone(timedelta(hours=-5))

CORS_ORIGINS = [
    o.strip()
    for o in [os.environ.get("SITE_ORIGIN", ""), os.environ.get("DEV_ORIGIN", "")]
    if o.strip()
]


def now_ec() -> datetime:
    return datetime.now(EC)


def month_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m")


def month_range(end: datetime, count: int) -> list[str]:
    """Los `count` meses que terminan en el de `end`, del más viejo al más nuevo."""
    keys: list[str] = []
    y, m = end.year, end.month
    for _ in range(count):
        keys.append(f"{y:04d}-{m:02d}")
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return list(reversed(keys))


def parse_amount(raw: str) -> Decimal | None:
    """
    Convierte '3,50' / '1.234,56' / '1,234.56' / 'USD 12.00' a Decimal.

    Los correos ecuatorianos mezclan ambas convenciones, así que decidimos por
    el separador que aparezca de último: ese es el decimal.
    """
    if raw is None:
        return None
    s = re.sub(r"[^\d.,\-]", "", str(raw)).strip()
    if not s:
        return None
    last_dot, last_comma = s.rfind("."), s.rfind(",")
    if last_dot > last_comma:
        s = s.replace(",", "")
    elif last_comma > last_dot:
        s = s.replace(".", "").replace(",", ".")
    else:
        s = s.replace(",", "")
    try:
        return Decimal(s).quantize(Decimal("0.01"))
    except Exception:
        return None


def money(v: Any) -> Decimal:
    return Decimal(str(v or 0)).quantize(Decimal("0.01"))


def json_default(o: Any):
    if isinstance(o, Decimal):
        # DynamoDB guarda decimales; el JSON del dashboard los quiere como número.
        return float(o)
    if isinstance(o, datetime):
        return o.isoformat()
    raise TypeError(f"no serializable: {type(o)}")


def respond(status: int, body: Any, origin: str | None = None) -> dict:
    allow = origin if origin in CORS_ORIGINS else (CORS_ORIGINS[0] if CORS_ORIGINS else "*")
    return {
        "statusCode": status,
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": allow,
            "access-control-allow-headers": "authorization,content-type",
            "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
            "cache-control": "no-store",
        },
        "body": json.dumps(body, default=json_default, ensure_ascii=False),
    }


def sign_state(key: str, payload: dict) -> str:
    """Estado firmado para el OAuth de Microsoft: `<b64payload>.<hmac>`."""
    import base64

    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    b64 = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    mac = hmac.new(key.encode(), b64.encode(), hashlib.sha256).hexdigest()[:32]
    return f"{b64}.{mac}"


def verify_state(key: str, state: str, max_age_s: int = 900) -> dict | None:
    import base64

    try:
        b64, mac = state.split(".", 1)
    except ValueError:
        return None
    expected = hmac.new(key.encode(), b64.encode(), hashlib.sha256).hexdigest()[:32]
    if not hmac.compare_digest(mac, expected):
        return None
    try:
        pad = "=" * (-len(b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(b64 + pad))
    except Exception:
        return None
    if time.time() - float(payload.get("ts", 0)) > max_age_s:
        return None
    return payload


def strip_html(html: str) -> str:
    """
    HTML → texto plano legible, conservando los saltos de línea que separan las
    etiquetas de sus valores (los correos de banco son tablas: 'Valor' y '3,50'
    viven en celdas distintas y deben quedar en líneas distintas).
    """
    if not html:
        return ""
    s = re.sub(r"(?is)<(script|style|head)[^>]*>.*?</\1>", " ", html)
    s = re.sub(r"(?i)<br\s*/?>", "\n", s)
    s = re.sub(r"(?i)</(p|div|tr|td|th|li|h[1-6]|table)\s*>", "\n", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = (
        s.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
    )
    s = re.sub(r"&[a-zA-Z#0-9]+;", " ", s)
    s = re.sub(r"[ \t\xa0]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return "\n".join(line.strip() for line in s.split("\n")).strip()


def txn_id(message_id: str, fallback: str = "") -> str:
    seed = (message_id or fallback or str(time.time())).encode()
    return hashlib.sha256(seed).hexdigest()[:16]
