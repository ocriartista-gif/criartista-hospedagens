# Criartista Hospedagens

Base real v0.1 do produto de sites administráveis para pousadas, hotéis, chalés e outras hospedagens.

## Princípios congelados

- A marca pode mudar; a jornada de reserva não.
- O cliente edita conteúdo, não desmonta o layout.
- Cada propriedade tem seus próprios `theme tokens`.
- A aplicação nasce multi-hospedagem (`property_id`).
- A `BookingArea` aceita fluxo Criartista ou motor externo.
- Leads devem manter origem/UTM, status, responsável, valor e follow-up.
- Avaliações são um módulo próprio e devem representar depoimentos reais.
- Integrações previstas: motor de reservas, GA4, Meta Pixel, GTM, Google Sheets, WhatsApp, redes sociais e consentimento de cookies.

## Stack

- Next.js 16.3.3
- React 19.2
- TypeScript
- Supabase (Postgres, Auth, Storage)
- Vercel

## Estado desta versão

A aplicação já possui a estrutura visual e de rotas usando dados mockados. O próximo passo é criar o projeto Supabase e substituir os mocks por repositórios reais.

### Rotas públicas

- `/`
- `/acomodacoes`
- `/acomodacoes/[slug]`

### Rotas administrativas

- `/admin`
- `/admin/leads`
- `/admin/acomodacoes`
- `/admin/galeria`
- `/admin/conteudo`
- `/admin/avaliacoes`
- `/admin/identidade`
- `/admin/integracoes`
- `/admin/usuarios`
- `/admin/configuracoes`

## Referências aprovadas

A pasta `docs/` preserva o protótipo v0.3 e as pranchas visuais aprovadas antes da implementação.

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Próximas etapas

1. Criar Supabase e aplicar `supabase/schema.sql`.
2. Implementar autenticação e RLS.
3. Substituir `lib/mock-data.ts` por camada de dados Supabase.
4. CRUD real de acomodações, imagens, conteúdo, avaliações e marca.
5. Persistência do CRM de leads.
6. BookingArea modular e integrações.
7. Google Sheets, Analytics, Meta e consentimento.
8. Testes responsivos, SEO e publicação na Vercel.
