"""
Correo de banco → transacción.

Estrategia en dos pasos:

1. `parse_email` corre un parser determinístico (rápido, gratis y exacto) que
   entiende el formato etiqueta/valor que usan Diners Club y Titanium en
   Ecuador — y que, por cómo está escrito, también acierta con la mayoría de
   los correos de Pichincha, Guayaquil, Produbanco y Bolivariano.
2. Si el determinístico no encuentra monto o comercio, `ingest` cae al
   extractor con Claude (ver ai.py). Así un banco nuevo funciona el día uno,
   aunque nunca hayamos visto su plantilla.
"""

from __future__ import annotations

import re
from datetime import datetime
from decimal import Decimal

from .util import EC, parse_amount, strip_html

# Palabras que anuncian cada campo. Cada una puede venir como "Valor: 3,50" o
# como celda de tabla con el número en la línea siguiente.
AMOUNT_LABELS = ["valor", "monto", "importe", "total", "valor de la transaccion", "valor transaccion"]
MERCHANT_LABELS = [
    "establecimiento",
    "comercio",
    "lugar",
    "descripcion",
    "detalle",
    "beneficiario",
    "razon social",
]
DATE_LABELS = ["fecha", "fecha y hora", "fecha de transaccion"]
CARD_LABELS = ["tarjeta terminada en", "terminada en", "final", "tarjeta"]

# Un correo de consumo dice alguna de estas cosas; uno de marketing, ninguna.
TRANSACTION_HINTS = [
    "consumo",
    "compra",
    "transaccion",
    "transacción",
    "debito",
    "débito",
    "pago",
    "retiro",
    "notificacion de consumos",
]

# Movimientos que suman en vez de restar.
CREDIT_HINTS = ["reverso", "devolucion", "devolución", "nota de credito", "acreditacion", "abono", "pago recibido"]


def _norm(s: str) -> str:
    s = (s or "").lower()
    for a, b in (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ñ", "n")):
        s = s.replace(a, b)
    return s


def _value_after(lines: list[str], labels: list[str], max_lookahead: int = 3) -> str | None:
    """
    Busca `label` y devuelve lo que venga después: en la misma línea tras ':',
    o en las siguientes líneas no vacías (formato de tabla).
    """
    norm = [_norm(l) for l in lines]
    for i, line in enumerate(norm):
        for label in labels:
            pos = line.find(label)
            if pos < 0:
                continue
            rest = lines[i][pos + len(label) :].lstrip(" :\t-–—")
            if rest.strip():
                return rest.strip()
            for j in range(i + 1, min(i + 1 + max_lookahead, len(lines))):
                if lines[j].strip():
                    return lines[j].strip()
    return None


def _parse_date(raw: str | None) -> datetime | None:
    if not raw:
        return None
    txt = raw.strip()
    patterns = [
        ("%Y-%m-%d %H:%M:%S", r"\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}"),
        ("%Y-%m-%d %H:%M", r"\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}"),
        ("%Y-%m-%d", r"\d{4}-\d{2}-\d{2}"),
        ("%d/%m/%Y %H:%M:%S", r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}"),
        ("%d/%m/%Y %H:%M", r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}"),
        ("%d/%m/%Y", r"\d{2}/\d{2}/\d{4}"),
        ("%d-%m-%Y", r"\d{2}-\d{2}-\d{4}"),
    ]
    for fmt, rx in patterns:
        m = re.search(rx, txt)
        if m:
            try:
                return datetime.strptime(m.group(0).replace("T", " "), fmt).replace(tzinfo=EC)
            except ValueError:
                continue
    return None


def _clean_merchant(raw: str | None) -> str:
    if not raw:
        return ""
    s = re.sub(r"\s+", " ", raw).strip(" .,-–—:")
    # Los POS rellenan con asteriscos y números de terminal que no aportan nada.
    s = re.sub(r"[*]{2,}", " ", s)
    s = re.sub(r"\b\d{6,}\b", " ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s[:80]


def looks_like_transaction(subject: str, body: str) -> bool:
    hay = _norm(f"{subject}\n{body[:1500]}")
    return any(h in hay for h in TRANSACTION_HINTS)


def parse_email(subject: str, html_or_text: str, received_iso: str | None = None) -> dict | None:
    """
    Devuelve {date, amount, merchant, card, kind, currency} o None si el parser
    determinístico no logra sacar lo esencial (monto + comercio).
    """
    text = strip_html(html_or_text) if "<" in (html_or_text or "") else (html_or_text or "")
    if not text:
        return None
    lines = [l for l in text.split("\n")]

    amount = parse_amount(_value_after(lines, AMOUNT_LABELS) or "")
    if amount is None:
        # Último recurso: el primer monto con formato de dinero del cuerpo.
        m = re.search(r"(?:usd|\$)\s*([\d.,]+)", text, re.I) or re.search(r"\b(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\b", text)
        if m:
            amount = parse_amount(m.group(1))
    if amount is None or amount <= 0:
        return None

    merchant = _clean_merchant(_value_after(lines, MERCHANT_LABELS))
    if not merchant:
        return None

    when = _parse_date(_value_after(lines, DATE_LABELS)) or _parse_date(text)
    if when is None and received_iso:
        try:
            when = datetime.fromisoformat(received_iso.replace("Z", "+00:00")).astimezone(EC)
        except ValueError:
            when = None
    if when is None:
        return None

    card = ""
    card_raw = _value_after(lines, CARD_LABELS)
    if card_raw:
        m = re.search(r"(\d{3,4})\b", card_raw)
        if m:
            card = m.group(1)

    hay = _norm(f"{subject}\n{text[:1200]}")
    kind = "income" if any(h in hay for h in CREDIT_HINTS) else "expense"
    currency = "USD"
    if re.search(r"\beur\b|€", text, re.I):
        currency = "EUR"

    return {
        "date": when.isoformat(),
        "amount": Decimal(amount),
        "merchant": merchant,
        "card": card,
        "kind": kind,
        "currency": currency,
        "parser": "rules",
    }
