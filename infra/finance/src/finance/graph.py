"""
Cliente mínimo de Microsoft Graph para leer el buzón de Outlook.

Usa OAuth2 delegado (authorization code + refresh token) porque los correos de
Diners llegan a una cuenta personal @hotmail.com, donde no existen los permisos
de aplicación. El refresh token vive en Secrets Manager y se rota solo: Graph
devuelve uno nuevo en cada refresco y aquí se vuelve a guardar.

Sin dependencias externas — urllib basta y mantiene la lambda liviana.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

import boto3

GRAPH = "https://graph.microsoft.com/v1.0"
SCOPES = "offline_access openid email Mail.Read"

_sm = boto3.client("secretsmanager")


class GraphError(RuntimeError):
    pass


class NotConnected(GraphError):
    """Todavía no se ha completado el consentimiento de Microsoft."""


# ------------------------------------------------------------------ secreto --


def load_secret() -> dict:
    raw = _sm.get_secret_value(SecretId=os.environ["SECRET_ID"])["SecretString"]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def save_secret(data: dict) -> None:
    _sm.put_secret_value(SecretId=os.environ["SECRET_ID"], SecretString=json.dumps(data))


def ensure_state_key() -> str:
    """Clave HMAC para firmar el `state` del OAuth; se crea sola la primera vez."""
    secret = load_secret()
    key = secret.get("state_key") or ""
    if not key:
        import secrets as pysecrets

        key = pysecrets.token_hex(32)
        secret["state_key"] = key
        save_secret(secret)
    return key


# --------------------------------------------------------------------- OAuth --


def _token_endpoint(tenant: str) -> str:
    return f"https://login.microsoftonline.com/{tenant or 'common'}/oauth2/v2.0/token"


def authorize_url(redirect_uri: str, state: str) -> str:
    secret = load_secret()
    client_id = secret.get("client_id")
    if not client_id:
        raise NotConnected("falta client_id en el secreto de Microsoft Graph")
    tenant = secret.get("tenant") or "common"
    qs = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "response_type": "code",
            "redirect_uri": redirect_uri,
            "response_mode": "query",
            "scope": SCOPES,
            "state": state,
            "prompt": "consent",
        }
    )
    return f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?{qs}"


def _post_token(tenant: str, data: dict) -> dict:
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(
        _token_endpoint(tenant),
        data=body,
        headers={"content-type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        raise GraphError(f"token endpoint {e.code}: {e.read().decode()[:400]}") from e


def exchange_code(code: str, redirect_uri: str) -> dict:
    """Cambia el `code` del consentimiento por tokens y guarda el refresh token."""
    secret = load_secret()
    tokens = _post_token(
        secret.get("tenant") or "common",
        {
            "client_id": secret["client_id"],
            "client_secret": secret.get("client_secret", ""),
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
            "scope": SCOPES,
        },
    )
    if "refresh_token" not in tokens:
        raise GraphError("Microsoft no devolvió refresh_token (¿faltó offline_access?)")
    secret["refresh_token"] = tokens["refresh_token"]
    save_secret(secret)
    return tokens


def access_token() -> str:
    secret = load_secret()
    if not secret.get("refresh_token"):
        raise NotConnected("Outlook no está conectado todavía")
    tokens = _post_token(
        secret.get("tenant") or "common",
        {
            "client_id": secret["client_id"],
            "client_secret": secret.get("client_secret", ""),
            "refresh_token": secret["refresh_token"],
            "grant_type": "refresh_token",
            "scope": SCOPES,
        },
    )
    # Microsoft rota el refresh token en cada uso: si no guardamos el nuevo, la
    # próxima ejecución se queda sin acceso.
    if tokens.get("refresh_token") and tokens["refresh_token"] != secret["refresh_token"]:
        secret["refresh_token"] = tokens["refresh_token"]
        save_secret(secret)
    return tokens["access_token"]


def is_connected() -> bool:
    try:
        secret = load_secret()
    except Exception:
        return False
    return bool(secret.get("client_id") and secret.get("refresh_token"))


# --------------------------------------------------------------------- mail --


def _get(url: str, token: str) -> dict:
    req = urllib.request.Request(url, headers={"authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        raise GraphError(f"graph {e.code}: {e.read().decode()[:400]}") from e


def fetch_messages(since_iso: str, senders: list[str], page_limit: int = 10) -> list[dict]:
    """
    Correos recibidos desde `since_iso`, filtrados por remitente en el cliente.

    Graph rechaza (o degrada) los filtros que combinan `from` con `$orderby`
    sobre otra propiedad, así que filtramos solo por fecha en el servidor y
    descartamos aquí lo que no venga de un banco conocido.
    """
    token = access_token()
    wanted = {s.strip().lower() for s in senders if s.strip()}
    select = "id,subject,receivedDateTime,from,body,bodyPreview"
    qs = urllib.parse.urlencode(
        {
            "$filter": f"receivedDateTime ge {since_iso}",
            "$select": select,
            "$orderby": "receivedDateTime desc",
            "$top": "50",
        }
    )
    url = f"{GRAPH}/me/mailFolders('Inbox')/messages?{qs}"

    out: list[dict] = []
    for _ in range(page_limit):
        data = _get(url, token)
        for msg in data.get("value", []):
            addr = (
                (msg.get("from") or {}).get("emailAddress", {}).get("address", "") or ""
            ).lower()
            if wanted and addr not in wanted:
                continue
            out.append(
                {
                    "id": msg.get("id", ""),
                    "subject": msg.get("subject", "") or "",
                    "receivedDateTime": msg.get("receivedDateTime", ""),
                    "from": addr,
                    "body": (msg.get("body") or {}).get("content", "")
                    or msg.get("bodyPreview", ""),
                }
            )
        url = data.get("@odata.nextLink") or ""
        if not url:
            break
    return out


def mailbox_address() -> str:
    try:
        return _get(f"{GRAPH}/me?$select=mail,userPrincipalName", access_token()).get(
            "mail"
        ) or ""
    except Exception:
        return ""
