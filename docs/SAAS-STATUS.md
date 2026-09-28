# Evolução SaaS: estado da PR #1

**Esta PR continua em rascunho. Não aplicar na produção ou integrar à `main` antes da validação remota.**

## Ponto de retomada

O código anterior da PR oferece perfil global, avatar, recuperação de senha, troca de hospedagem e resolução do site por domínio verificado. Esta etapa acrescentou o núcleo self-service, mas a conexão Supabase ainda responde “You do not have permission to perform this action” para tabelas, migrations e advisors. Apenas a lista de projetos está acessível. Portanto, não foi possível inspecionar o banco remoto, aplicar migrations, gerar tipos a partir do banco nem testar RLS, perfil ou isolamento contra dados reais. Os tipos novos foram editados localmente e **precisam ser regenerados após a aplicação das migrations**.

## Implementado nesta etapa

- Provisioning transacional via RPC restrita a `service_role`. Um ID externo único impede duplicação em entregas repetidas do webhook. Cria propriedade em `draft`, owner, profile, tema, seções de conteúdo, redes, integrações desativadas, onboarding, subdomínio e log.
- Regra de publicação no banco: um proprietário pode promover `draft → active` somente com nome, WhatsApp, endereço, título e imagem hero, e pelo menos uma acomodação publicada com imagem. Sites incompletos não entram nas políticas públicas existentes.
- Onboarding em `/admin/onboarding` com progresso baseado nos dados persistidos, edição inicial de contato/redes, links para os editores aprovados, revisão, publicação e ajuda contextual.
- Conta para contratação, checkout de assinatura única do Mercado Pago e retorno pendente. O preço fica apenas no ambiente do servidor.
- Webhook com assinatura HMAC, janela antirreplay, consulta do pagamento e assinatura diretamente no Mercado Pago, conferência de vínculo e valor, registro de eventos e provisioning somente quando a fatura informa pagamento aprovado.
- Domínio próprio no admin: inclusão pela API da Vercel, leitura de registros de verificação, nova verificação e escolha transacional do domínio principal. O domínio só fica público quando o projeto e a configuração DNS forem confirmados.
- Landing central com oferta única, recursos e fluxo de contratação, sem preços ou depoimentos inventados.

## Migrations em ordem, ainda não aplicadas

1. `20260928210000_add_user_profiles.sql`
2. `20260928211000_property_domains.sql`
3. `20260928213000_self_service_core.sql`
4. `20260928214000_subscription_billing.sql`

Revisão estática: todas as novas tabelas públicas usam RLS. Perfis são limitados ao próprio usuário; domínios públicos precisam de status verificado e hospedagem ativa; mutações de domínio, billing e provisioning ficam no servidor com `service_role`. A RPC de provisioning usa `SECURITY INVOKER`, permissões restritas e transação única. **A revisão estática não substitui a execução dos advisors nem os testes de permissão no banco.**

## Verificação realizada

- `npx tsc --noEmit`: passou.
- `npm run build`: passou.
- `npm test`: assinatura válida, adulteração e replay cobertos; passou.
- Preview Vercel: confirmar o novo deploy após o push desta etapa.

## Bloqueios antes da venda

- Supabase remoto: aplicar migrations, regenerar tipos, executar advisors e testar owner A/B, avatar, recuperação, idempotência e publicação.
- Configurar `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, valor comercial e URL pública. Testar assinatura e primeira fatura em ambiente de teste do provedor. O fluxo exige criação/validação da conta antes do pagamento.
- Configurar `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.
- Configurar `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, wildcard DNS/certificado e domínio central.
- Adicionar URLs de confirmação da conta e recuperação à lista de redirects do Supabase Auth.
- Integrações GA4, Pixel, GTM, consentimento, Sheets e motores externos ainda são configurações salvas, sem execução completa.
- Falta rotina operacional para falhas de cobrança, tolerância, suspensão, estornos e reconciliação do webhook; o site não é derrubado automaticamente.
- Faltam testes E2E com Supabase e Mercado Pago, textos legais reais e validação visual em mobile do admin e da landing.

Consulte `docs/ENVIRONMENT-SAAS.md` para as variáveis e a sequência de ativação. **Não publicar a landing de contratação em produção enquanto os bloqueios acima persistirem.**
