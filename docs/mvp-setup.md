# MVP Setup (Meta + Supabase + n8n)

## 1. Meta (WhatsApp Cloud API)

1. Crie um app em [Meta for Developers](https://developers.facebook.com/docs/).
2. Ative o produto **WhatsApp** e gere um token permanente.
3. Copie os seguintes dados:
   - **Phone Number ID**
   - **Access Token**
   - **Verify Token** (defina um valor e mantenha consistente)

No `.env.local`:

```bash
META_WHATSAPP_TOKEN="<token-permanente>"
META_PHONE_NUMBER_ID="<phone-number-id>"
META_VERIFY_TOKEN="<verify-token>"
META_GRAPH_API_VERSION="v20.0"
```

### Webhook

Configure o webhook com:

```
https://<sua-url>/api/whatsapp/webhook
```

Use o mesmo `META_VERIFY_TOKEN` definido no ambiente.

## 2. Supabase (armazenar mensagens)

Crie a tabela `whatsapp_messages` para armazenar eventos recebidos:

```sql
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  message_id text,
  from_number text,
  message_type text,
  text_body text,
  timestamp text,
  contact_name text,
  phone_number_id text,
  raw_payload jsonb,
  created_at timestamptz default now()
);
```

Variáveis necessárias:

```bash
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

## 3. n8n (automations)

Crie um **Webhook Trigger** no n8n e copie a URL.

```bash
N8N_WEBHOOK_URL="https://<seu-n8n>/webhook/whatsapp"
```

Cada evento recebido da Meta será enviado com o payload completo.

## 4. Envio de mensagens

A API `/api/whatsapp/send` usa as credenciais do ambiente para enviar mensagens.

Exemplo:

```bash
curl -X POST https://<sua-url>/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Olá!"}'
```
