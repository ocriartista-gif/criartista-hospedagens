# Evolução SaaS: estado desta branch

Esta branch inicia a transição da aplicação existente. **Ainda não constitui a versão 2.0 nem um produto pronto para venda automática.**

## Implementado localmente

- Perfil global de usuário, nome, telefone, avatar no Storage, alteração de senha e solicitação de troca de e-mail.
- Recuperação de senha com callback PKCE e tratamento de link inválido.
- Seletor de hospedagem para usuários com mais de uma associação. O servidor verifica a membership antes de gravar o cookie e cada operação continua usando a role da hospedagem ativa.
- Resolução do site público por Host e domínio verificado; a hospedagem é sempre buscada pelo `property_id` resolvido. O slug padrão fica restrito ao desenvolvimento.
- Página central da plataforma, sitemap/robots por host e links do painel para o domínio da hospedagem.

## Migrations pendentes de aplicação

- `20260928210000_add_user_profiles.sql`: `profiles` com RLS, backfill e bucket `profile-avatars`.
- `20260928211000_property_domains.sql`: `property_domains` com RLS, índice único e subdomínios iniciais.

Aplicar e verificar essas migrations em ambiente de teste antes de executar a aplicação desta branch. As consultas ao projeto Supabase foram recusadas pela conexão disponível nesta sessão, portanto **não foram aplicadas nem verificadas no banco remoto**. A configuração de wildcard DNS e o domínio na Vercel também precisam ser verificados antes do teste multi-tenant público.

## Bloqueios para “pagou e usou”

- Não há checkout, assinatura nem webhook de pagamento.
- Não há provisioning transacional/idempotente nem onboarding self-service.
- Domínios próprios ainda não são adicionados/verificados via API da Vercel.
- As integrações armazenadas (analytics, consentimento, Sheets, motor externo) ainda exigem implementação e testes ponta a ponta.
- O backoffice da plataforma e o ciclo de cobrança/suspensão ainda não existem.
- Os textos legais e a decisão comercial de preço/provedor precisam de dados reais.
- Não há teste E2E com Supabase e Vercel disponíveis nesta sessão.

Não integrar à `main` nem tratar a landing como fluxo de contratação até que esses itens estejam implementados e verificados.
