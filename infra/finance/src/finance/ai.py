"""
Claude en Amazon Bedrock: extracción de correos desconocidos, categorización y
el diagnóstico financiero.

Tres llamadas distintas, tres niveles de esfuerzo. Extraer y categorizar son
tareas mecánicas (`effort: low/medium`); el diagnóstico es la parte que de
verdad tiene que razonar sobre tendencias, así que va en `high`.

Todo lo de aquí degrada con gracia: si Bedrock falla, la ingesta sigue con lo
que sacó el parser determinístico y el dashboard muestra los números igual.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from .categories import CATEGORIES, INCOME_CATEGORIES

log = logging.getLogger(__name__)

MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-opus-5")
REGION = os.environ.get("BEDROCK_REGION") or os.environ.get("AWS_REGION", "us-east-1")

_client = None


def client():
    global _client
    if _client is None:
        from anthropic import AnthropicBedrockMantle

        _client = AnthropicBedrockMantle(aws_region=REGION)
    return _client


def _first_text(response: Any) -> str:
    for block in response.content:
        if block.type == "text":
            return block.text
    return ""


def _json_call(system: str, prompt: str, schema: dict, effort: str, max_tokens: int = 8000) -> dict | None:
    try:
        resp = client().messages.create(
            model=MODEL_ID,
            max_tokens=max_tokens,
            system=system,
            output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
            messages=[{"role": "user", "content": prompt}],
        )
        if resp.stop_reason == "refusal":
            log.warning("bedrock refusal: %s", getattr(resp, "stop_details", None))
            return None
        text = _first_text(resp)
        return json.loads(text) if text else None
    except Exception:  # red, cuota, modelo sin acceso — nunca tumbar la ingesta
        log.exception("llamada a Bedrock fallida")
        return None


# ------------------------------------------------- extraer de un correo raro --

EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "is_transaction": {"type": "boolean"},
        "date": {"type": "string", "description": "ISO 8601, hora de Ecuador (UTC-5)"},
        "amount": {"type": "number"},
        "currency": {"type": "string"},
        "merchant": {"type": "string"},
        "card": {"type": "string", "description": "últimos 3-4 dígitos, o cadena vacía"},
        "kind": {"type": "string", "enum": ["expense", "income"]},
        "bank": {"type": "string"},
    },
    "required": ["is_transaction", "date", "amount", "currency", "merchant", "card", "kind", "bank"],
    "additionalProperties": False,
}

EXTRACT_SYSTEM = (
    "Eres un extractor de datos de correos bancarios ecuatorianos. Devuelves solo "
    "hechos que estén literalmente en el correo; nunca inventas montos, fechas ni "
    "comercios. Si el correo es publicidad, un estado de cuenta, un aviso de "
    "seguridad o cualquier cosa que no sea UNA transacción concreta, "
    "is_transaction es false y el resto va en ceros o cadenas vacías. "
    "Los montos ecuatorianos usan coma decimal: '3,50' son 3.50 dólares. "
    "Un reverso, una devolución o una acreditación es kind=income; un consumo, "
    "compra, débito o retiro es kind=expense."
)


def extract_transaction(subject: str, body_text: str, received_iso: str) -> dict | None:
    prompt = (
        f"Correo recibido el {received_iso}.\n"
        f"Asunto: {subject}\n\n"
        f"Cuerpo:\n{body_text[:6000]}"
    )
    data = _json_call(EXTRACT_SYSTEM, prompt, EXTRACT_SCHEMA, effort="low", max_tokens=4000)
    if not data or not data.get("is_transaction"):
        return None
    if not data.get("merchant") or float(data.get("amount") or 0) <= 0:
        return None
    return data


# ------------------------------------------------------------ categorizar ----

CATEGORIZE_SCHEMA = {
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "merchant": {"type": "string"},
                    "category": {"type": "string"},
                    "rule": {
                        "type": "string",
                        "description": "fragmento estable del nombre para reutilizar como regla, en minúsculas",
                    },
                },
                "required": ["merchant", "category", "rule"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["results"],
    "additionalProperties": False,
}


def categorize(merchants: list[str], kind: str = "expense") -> dict[str, dict]:
    """{merchant -> {category, rule}} para los comercios que ninguna regla reconoció."""
    if not merchants:
        return {}
    pool = INCOME_CATEGORIES if kind == "income" else CATEGORIES
    system = (
        "Clasificas comercios de tarjetas de crédito ecuatorianas en categorías de "
        "gasto personal. Responde únicamente con categorías de la lista dada. Si no "
        f"reconoces el comercio, usa '{'otros_ingresos' if kind == 'income' else 'otros'}'. "
        "El campo 'rule' es el fragmento más corto y estable del nombre que serviría "
        "para reconocer al mismo comercio la próxima vez (sin números de terminal, "
        "sucursal ni ciudad)."
    )
    prompt = (
        "Categorías válidas: " + ", ".join(pool) + "\n\n"
        "Comercios:\n" + "\n".join(f"- {m}" for m in merchants[:60])
    )
    data = _json_call(system, prompt, CATEGORIZE_SCHEMA, effort="low", max_tokens=4000)
    if not data:
        return {}
    out: dict[str, dict] = {}
    for row in data.get("results", []):
        cat = row.get("category")
        if cat in pool:
            out[row.get("merchant", "")] = {"category": cat, "rule": (row.get("rule") or "").lower()}
    return out


# -------------------------------------------------------------- diagnóstico --

INSIGHT_SCHEMA = {
    "type": "object",
    "properties": {
        "healthScore": {"type": "integer", "description": "0-100, salud financiera general"},
        "verdict": {"type": "string", "enum": ["excelente", "bien", "atencion", "riesgo"]},
        "headline": {"type": "string", "description": "una frase, máximo 90 caracteres"},
        "summary": {"type": "string", "description": "2-4 frases en español, directo, sin rodeos"},
        "wins": {"type": "array", "items": {"type": "string"}},
        "risks": {"type": "array", "items": {"type": "string"}},
        "actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "why": {"type": "string"},
                    "impactMonthly": {"type": "number", "description": "USD que libera al mes, 0 si no aplica"},
                    "effort": {"type": "string", "enum": ["bajo", "medio", "alto"]},
                },
                "required": ["title", "why", "impactMonthly", "effort"],
                "additionalProperties": False,
            },
        },
        "forecast": {
            "type": "object",
            "properties": {
                "nextMonthExpense": {"type": "number"},
                "savingsRate": {"type": "number", "description": "porcentaje estimado"},
                "runwayMonths": {"type": "number", "description": "0 si no se puede estimar"},
            },
            "required": ["nextMonthExpense", "savingsRate", "runwayMonths"],
            "additionalProperties": False,
        },
    },
    "required": ["healthScore", "verdict", "headline", "summary", "wins", "risks", "actions", "forecast"],
    "additionalProperties": False,
}

INSIGHT_SYSTEM = (
    "Eres el analista financiero personal de Carlos, dueño de MindfulTech (Quito, "
    "Ecuador). Su objetivo declarado es aumentar su patrimonio y tener estabilidad. "
    "Analizas datos reales de sus tarjetas y movimientos, en dólares.\n\n"
    "Reglas:\n"
    "- Habla en español, directo y concreto. Nada de generalidades tipo 'controla "
    "tus gastos'; di qué categoría, qué monto y qué hacer.\n"
    "- Toda afirmación numérica debe salir de los datos que te doy. Si un mes "
    "tiene pocos datos, dilo en vez de inventar una tendencia.\n"
    "- Las acciones se ordenan por impacto mensual en dólares, de mayor a menor.\n"
    "- No eres asesor de inversiones con licencia: no recomiendas instrumentos "
    "financieros específicos ni operaciones de compra/venta. Hablas de gasto, "
    "ahorro, flujo de caja y hábitos.\n"
    "- healthScore: 0-40 riesgo, 41-60 atención, 61-80 bien, 81-100 excelente. "
    "Pesa la tasa de ahorro, la tendencia del gasto y la concentración por categoría."
)


def diagnose(payload: dict) -> dict | None:
    prompt = (
        "Estos son los datos financieros consolidados (montos en USD):\n\n"
        + json.dumps(payload, ensure_ascii=False, indent=1, default=str)
        + "\n\nDiagnostica la situación y da acciones concretas."
    )
    return _json_call(INSIGHT_SYSTEM, prompt, INSIGHT_SCHEMA, effort="high", max_tokens=12000)
