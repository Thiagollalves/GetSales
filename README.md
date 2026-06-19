# GetSales
criado no V0

## Segurança e configuração

- O acesso ao dashboard é feito em `/login` com `ADMIN_ACCESS_USERNAME` e `ADMIN_ACCESS_TOKEN`, ou com o fallback `admin / 123456` quando as variáveis não estiverem definidas.
- As credenciais da Meta ficam somente no servidor.
- O webhook do WhatsApp valida `META_VERIFY_TOKEN` e `META_APP_SECRET`.
- Para teste local, use `ADMIN_ACCESS_USERNAME=admin` e `ADMIN_ACCESS_TOKEN=123456`.
- Execute `npm test` para validar auth e o fluxo de chatbot local.
- O CRM grava contatos, tickets e timeline em `supabase/migrations/20260619_crm_contacts.sql`.
- A área de chatbots usa `supabase/migrations/20260505_chatbot_storage.sql`.
- O webhook do WhatsApp grava mensagens em `supabase/migrations/20260520_whatsapp_messages.sql`.
