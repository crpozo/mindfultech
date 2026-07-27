# MindfulTech Finance — backend (en pausa)

> **Nada de esto está desplegado, y por ahora no hace falta.** El dashboard de
> `mindfultech.ec/finance` funciona entero en el navegador: entrada manual,
> datos en localStorage, respaldo en JSON. Este stack queda escrito y validado
> (`sam validate` pasa) para el día que la entrada manual empiece a pesar y
> convenga que los consumos de Diners entren solos desde el correo. El modelo
> de datos del front es el mismo que usa aquí, así que migrar será subir el
> JSON exportado — no reescribir.

Motor en la nube de `mindfultech.ec/finance`. Corre entero en AWS: lee los
correos de consumo de Diners (y de cualquier otro banco que agregues) desde
Outlook, los convierte en transacciones categorizadas, y genera un diagnóstico
financiero con Claude en Amazon Bedrock.

```
EventBridge (cada 15 min)
        │
        ▼
   Lambda ingest ──► Microsoft Graph (Outlook, solo lectura)
        │                    │
        │                    └─► parser de plantillas de banco
        │                        └─► si no reconoce: Claude extrae los campos
        ▼
   DynamoDB (tabla única)  ◄────────────┐
        ▲                               │
        │                          Lambda insights (diario 07:00 EC)
        │                               └─► Claude: salud financiera + acciones
   Lambda api ◄── HTTP API + authorizer JWT ◄── Cognito ◄── dashboard estático
```

Todo el stack está dentro de AWS. Microsoft Graph aparece solo porque el correo
de Diners llega a una cuenta Outlook: es la fuente del dato, no infraestructura.

---

## 1. Desplegar el stack

Requisitos: AWS CLI configurado, SAM CLI, y **acceso al modelo de Claude
habilitado en Bedrock** (consola de Bedrock → *Model access* → habilita
`Claude Opus 5`; si tu cuenta aún no lo tiene, usa `anthropic.claude-sonnet-5`).

```bash
cd infra/finance
sam build
sam deploy --guided \
  --stack-name mft-finance \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM
```

`us-east-1` es la región recomendada porque es donde Bedrock tiene disponible
antes cada modelo de Claude. Si prefieres otra, cámbiala — el código lee la
región del entorno de la lambda.

Guarda los **outputs**: `ApiBaseUrl`, `UserPoolClientId`, `CognitoDomain`,
`OAuthRedirectUri`, `UserPoolId`, `GraphSecretName`.

## 2. Crear tu usuario

No hay auto-registro: la única cuenta la creas tú.

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <UserPoolId> \
  --username crpozo95@gmail.com \
  --user-attributes Name=email,Value=crpozo95@gmail.com Name=email_verified,Value=true \
  --region us-east-1
```

Cognito manda una contraseña temporal por correo; en el primer login te pide
cambiarla. Para activar MFA (recomendado) entra al Hosted UI y sigue el flujo, o
usa `admin-set-user-mfa-preference`.

## 3. Registrar la app de Microsoft (una sola vez)

Es lo único que vive fuera de AWS, y es obligatorio para leer el buzón.

1. [Azure Portal](https://portal.azure.com) → **App registrations** → *New registration*
   - Nombre: `MindfulTech Finance`
   - Cuentas soportadas: **Personal Microsoft accounts + cuentas de organización**
   - Redirect URI: tipo *Web*, valor = el output `OAuthRedirectUri`
2. **Certificates & secrets** → *New client secret* → copia el **Value**.
3. **API permissions** → *Microsoft Graph* → *Delegated* → `Mail.Read` y
   `offline_access` → *Grant admin consent* (si aplica).
4. Guarda `client_id` y `client_secret` en el secreto que creó el stack:

```bash
aws secretsmanager put-secret-value \
  --secret-id mft-finance/msgraph \
  --secret-string '{"client_id":"<APP_ID>","client_secret":"<SECRET>","tenant":"common","refresh_token":"","state_key":""}' \
  --region us-east-1
```

`Mail.Read` es solo lectura: el stack no puede enviar ni borrar correo.

## 4. Sembrar el punto de partida

`seed.py` carga saldos, deudas, cuentas por cobrar y el perfil que la IA lee
junto a los números. Revisa los montos antes de correrlo — están tomados del
27 de julio de 2026 y se editan después desde la pestaña **Patrimonio**.

```bash
python3 seed.py --dry-run                       # ver qué escribiría
python3 seed.py --table mft-finance-data --region us-east-1
```

## 5. Conectar el dashboard

En `public/finance/config.json` del repo del sitio:

```json
{
  "apiBase": "<ApiBaseUrl>",
  "cognitoDomain": "<CognitoDomain>",
  "clientId": "<UserPoolClientId>"
}
```

`git push` a `main` y GitHub Actions publica. Entra a
`https://mindfultech.ec/finance`, inicia sesión, ve a **Ajustes → Conectar
Outlook** y acepta el consentimiento de Microsoft. Desde ahí:

- **Importar 6 meses** trae el histórico de una vez.
- El cron de 15 minutos se encarga del resto.

---

## Operación

```bash
# ver la ingesta en vivo
sam logs -n IngestFunction --stack-name mft-finance --tail

# correr la ingesta a mano (últimos 30 días)
aws lambda invoke --function-name <IngestFunction> \
  --payload '{"days":30}' --cli-binary-format raw-in-base64-out /dev/stdout

# regenerar el diagnóstico
aws lambda invoke --function-name <InsightsFunction> --payload '{}' /dev/stdout
```

**Agregar otro banco**: añade su remitente al parámetro `MailSenders` y
redespliega. No hace falta escribir un parser — si la plantilla no encaja con
las reglas, Claude extrae los campos y la transacción entra igual.

**Costo aproximado**: DynamoDB, Lambda y API Gateway caen dentro del free tier
con este volumen; Cognito es gratis hasta 50k usuarios activos. El gasto real es
Bedrock: la categorización solo se invoca para comercios nunca vistos (y la
respuesta se guarda como regla, así que cada comercio se paga una vez), y el
diagnóstico es una llamada diaria. En la práctica, unos pocos dólares al mes.

## Notas de seguridad

- El `client_secret` de Microsoft y el refresh token viven en Secrets Manager,
  nunca en el navegador ni en el repo.
- La única ruta pública del API es `/oauth/callback`, y está protegida por un
  `state` firmado con HMAC que solo emite una sesión ya autenticada.
- El dashboard es un cliente público con PKCE: el `clientId` y la URL del API
  son visibles por diseño, y no sirven de nada sin la contraseña de Cognito.
- La tabla tiene cifrado en reposo y point-in-time recovery activados.
