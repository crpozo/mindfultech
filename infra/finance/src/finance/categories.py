"""
Catálogo de categorías y reglas base por comercio.

Las reglas base cubren los comercios comunes en Ecuador; el dashboard puede
agregar las suyas (se guardan en DynamoDB) y la IA solo se invoca para lo que
ninguna regla reconoce, así el gasto de tokens se mantiene bajo.
"""

from __future__ import annotations

import re

CATEGORIES = [
    "comida",
    "supermercado",
    "transporte",
    "combustible",
    "suscripciones",
    "servicios",
    "salud",
    "hogar",
    "educacion",
    "entretenimiento",
    "ropa",
    "viajes",
    "negocio",
    "impuestos",
    "financiero",
    "otros",
]

INCOME_CATEGORIES = ["salario", "clientes", "inversiones", "reembolso", "otros_ingresos"]

# patrón (substring, case-insensitive) -> categoría
BASE_RULES: list[tuple[str, str]] = [
    # suscripciones / software
    ("netflix", "suscripciones"),
    ("spotify", "suscripciones"),
    ("openai", "suscripciones"),
    ("anthropic", "suscripciones"),
    ("claude", "suscripciones"),
    ("github", "suscripciones"),
    ("google", "suscripciones"),
    ("apple.com", "suscripciones"),
    ("itunes", "suscripciones"),
    ("microsoft", "suscripciones"),
    ("adobe", "suscripciones"),
    ("figma", "suscripciones"),
    ("notion", "suscripciones"),
    ("canva", "suscripciones"),
    ("disney", "suscripciones"),
    ("hbo", "suscripciones"),
    ("prime video", "suscripciones"),
    ("youtube", "suscripciones"),
    ("linkedin", "suscripciones"),
    ("zoom", "suscripciones"),
    ("dropbox", "suscripciones"),
    ("icloud", "suscripciones"),
    # nube / negocio
    ("amazon web", "negocio"),
    ("aws", "negocio"),
    ("vercel", "negocio"),
    ("godaddy", "negocio"),
    ("namecheap", "negocio"),
    ("cloudflare", "negocio"),
    ("meta platforms", "negocio"),
    ("facebook ads", "negocio"),
    # supermercado
    ("supermaxi", "supermercado"),
    ("megamaxi", "supermercado"),
    ("mi comisariato", "supermercado"),
    ("santa maria", "supermercado"),
    ("tia", "supermercado"),
    ("coral", "supermercado"),
    ("aki", "supermercado"),
    # comida
    ("mcdonald", "comida"),
    ("burger", "comida"),
    ("kfc", "comida"),
    ("pizza", "comida"),
    ("starbucks", "comida"),
    ("juan valdez", "comida"),
    ("sweet & coffee", "comida"),
    ("restaurant", "comida"),
    ("cafeteria", "comida"),
    ("uber eats", "comida"),
    ("pedidosya", "comida"),
    ("rappi", "comida"),
    # transporte / combustible
    ("uber", "transporte"),
    ("cabify", "transporte"),
    ("didi", "transporte"),
    ("taxi", "transporte"),
    ("primax", "combustible"),
    ("petroecuador", "combustible"),
    ("mobil", "combustible"),
    ("terpel", "combustible"),
    ("gasolinera", "combustible"),
    ("peaje", "transporte"),
    ("parqueadero", "transporte"),
    # servicios
    ("claro", "servicios"),
    ("movistar", "servicios"),
    ("cnt", "servicios"),
    ("tuenti", "servicios"),
    ("netlife", "servicios"),
    ("empresa electrica", "servicios"),
    ("agua potable", "servicios"),
    ("epmaps", "servicios"),
    # salud
    ("farmacia", "salud"),
    ("fybeca", "salud"),
    ("pharmacys", "salud"),
    ("sana sana", "salud"),
    ("clinica", "salud"),
    ("hospital", "salud"),
    ("laboratorio", "salud"),
    ("dental", "salud"),
    # hogar
    ("kywi", "hogar"),
    ("sukasa", "hogar"),
    ("ferrisariato", "hogar"),
    ("home vega", "hogar"),
    ("mueble", "hogar"),
    # viajes
    ("avianca", "viajes"),
    ("latam", "viajes"),
    ("copa air", "viajes"),
    ("booking", "viajes"),
    ("airbnb", "viajes"),
    ("despegar", "viajes"),
    ("hotel", "viajes"),
    # entretenimiento / ropa
    ("cinemark", "entretenimiento"),
    ("supercines", "entretenimiento"),
    ("steam", "entretenimiento"),
    ("playstation", "entretenimiento"),
    ("de prati", "ropa"),
    ("etafashion", "ropa"),
    ("zara", "ropa"),
    ("adidas", "ropa"),
    ("nike", "ropa"),
    # educación
    ("usfq", "educacion"),
    ("universidad", "educacion"),
    ("udemy", "educacion"),
    ("coursera", "educacion"),
    ("platzi", "educacion"),
    # financiero
    ("interes", "financiero"),
    ("comision", "financiero"),
    ("seguro", "financiero"),
    ("membresia", "financiero"),
    ("avance", "financiero"),
    ("sri ", "impuestos"),
    ("impuesto", "impuestos"),
]


def normalize(text: str) -> str:
    """minúsculas sin tildes — los correos de banco mezclan MAYÚSCULAS y acentos."""
    s = (text or "").lower()
    for a, b in (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ñ", "n"), ("ü", "u")):
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", s).strip()


def match_rules(merchant: str, extra_rules: list[dict] | None = None) -> str | None:
    """Devuelve la categoría de la primera regla que coincida, o None."""
    m = normalize(merchant)
    if not m:
        return None
    for rule in extra_rules or []:
        pattern = normalize(str(rule.get("pattern", "")))
        cat = rule.get("category")
        if pattern and cat and pattern in m:
            return str(cat)
    for pattern, cat in BASE_RULES:
        if pattern in m:
            return cat
    return None


def is_valid(category: str, kind: str = "expense") -> bool:
    pool = INCOME_CATEGORIES if kind == "income" else CATEGORIES
    return category in pool
