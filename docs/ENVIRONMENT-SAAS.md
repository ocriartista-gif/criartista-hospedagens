# Configuração do núcleo self-service

Variáveis no servidor (nunca usar prefixo `NEXT_PUBLIC_` para segredos):

| Variável | Finalidade |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Provisioning, billing e domínios no servidor |
| `MERCADO_PAGO_ACCESS_TOKEN` | Criar assinatura e consultar faturas |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Validar assinatura dos webhooks |
| `SAAS_MONTHLY_PRICE_BRL` | Valor mensal da única oferta, definido comercialmente |
| `SAAS_BASE_URL` | URL HTTPS central para retorno do checkout |
| `VERCEL_TOKEN` | Adicionar/verificar domínios próprios |
| `VERCEL_PROJECT_ID` | Projeto Vercel do produto |
| `VERCEL_TEAM_ID` | Escopo do projeto, se aplicável |

Variáveis públicas existentes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_PLATFORM_DOMAIN`. `NEXT_PUBLIC_DEFAULT_PROPERTY_SLUG` vale apenas para desenvolvimento local.

Ativação: aplicar migrations em ambiente de teste, gerar tipos do banco real, executar Supabase advisors, configurar o domínio central e wildcard `*.hospedagens.ocriartista.site` na Vercel, autorizar no Supabase Auth os redirects `/auth/callback?next=/contratar/checkout` e `/auth/callback?next=/admin/redefinir-senha`, cadastrar o webhook HTTPS `/api/webhooks/mercado-pago` para `subscription_authorized_payment` e `subscription_preapproval`, e testar uma compra de teste do início ao fim.

O webhook não usa o retorno do navegador como prova de pagamento. Ele consulta a fatura e a assinatura no Mercado Pago antes de chamar o provisioning. Um evento com falha de processamento retorna HTTP 503 para permitir nova entrega; o evento persistido fica pendente para diagnóstico.
