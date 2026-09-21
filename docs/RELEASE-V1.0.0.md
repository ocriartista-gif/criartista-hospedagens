# Criartista Hospedagens V1.0.0

Status: congelada em 21/09/2026.

## Escopo aprovado

A V1.0.0 consolida o núcleo funcional do Criartista Hospedagens:

- site público responsivo e white-label;
- acomodações com até 5 imagens, capa e ordenação;
- Hero com mídia selecionável pela Biblioteca;
- biblioteca central de mídia com uso contextual;
- identidade visual com logos, favicon, paleta, tipografia e proteção de contraste;
- aplicação simplificada de cores para fundo geral, cabeçalho/rodapé e CTAs;
- histórico para desfazer a última alteração da identidade;
- conteúdo editável, incluindo os três cards de Experiências;
- avaliações administráveis;
- formulário de consulta com validação de datas e criação de lead;
- CRM comercial com prioridade, responsável, follow-up, agendamento e timeline;
- usuários, perfis e permissões por rota;
- fluxo de convite com OTP e criação de senha;
- política própria de senha forte: mínimo de 10 caracteres, maiúscula, minúscula, número e símbolo;
- configurações reais da propriedade no Supabase;
- integrações com persistência de configuração;
- SEO base com metadata, canonical, Open Graph, JSON-LD, robots e sitemap;
- RLS multi-tenant revisado;
- CI de build no GitHub e deploy pela Vercel.

## Decisões de produto congeladas

A estrutura do site e as regras de contraste são protegidas. Conteúdo, marca, mídia e dados da propriedade podem ser personalizados pelo painel sem transformar o produto em um page builder.

## Limitação conhecida aceita na V1

Leaked Password Protection do Supabase não está disponível no plano atual. A V1 compensa isso com política própria de senha forte no fluxo oficial de ativação. Ao migrar o projeto para Supabase Pro ou superior, ativar também a proteção contra senhas vazadas.

## Fora da V1.0.0

Itens abaixo passam para V1.1 ou posterior:

- fotos específicas nos cards de Experiências;
- melhorias adicionais de UX e acabamento visual;
- busca/filtros avançados na Biblioteca de mídia;
- drag-and-drop de mídia;
- execução real das integrações GA4, Meta Pixel, GTM, Google Sheets e consentimento;
- seletor de propriedade para usuários multi-property;
- melhorias adicionais de acessibilidade, desempenho e observabilidade.

A partir deste marco, alterações funcionais devem entrar em uma nova versão e não alterar a referência congelada da V1.0.0.
