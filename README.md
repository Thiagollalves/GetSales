# GetSales
criado no V0

## Segurança e configuração

- O acesso ao dashboard é feito em `/login` com `ADMIN_ACCESS_USERNAME` e `ADMIN_ACCESS_TOKEN`.
- As credenciais da Meta ficam somente no servidor.
- O webhook do WhatsApp valida `META_VERIFY_TOKEN` e `META_APP_SECRET`.
- Para teste local, use `ADMIN_ACCESS_USERNAME=admin` e `ADMIN_ACCESS_TOKEN=123456`.
