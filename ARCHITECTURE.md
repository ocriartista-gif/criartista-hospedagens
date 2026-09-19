# Arquitetura Mestre v1

## Camadas

### Brand Layer
Logo, cores, tipografias, eyebrow e personalidade da propriedade.

### Content Layer
Hero, textos institucionais, acomodações, experiências, avaliações, localização e rodapé.

### Conversion Layer
BookingArea, CTAs, formulários, WhatsApp, leads e CRM. Essa camada é protegida.

### Integration Layer
Motor externo, GA4, Meta Pixel/CAPI, GTM, Google Sheets, redes sociais e cookies.

## BookingArea

Modos previstos:

- `criartista`: formulário + WhatsApp + lead.
- `external_link`: botão abre URL externa.
- `widget`: código/componente do fornecedor.
- `embed`: motor incorporado abaixo do cabeçalho.
- `popup`: motor abre em modal/painel.

A página chama apenas a BookingArea; a configuração da propriedade decide o modo renderizado.

## Multi-tenant

Todo conteúdo operacional possui `property_id`. As políticas RLS do Supabase devem garantir que um usuário só veja propriedades em que possua associação em `property_members`.

## Permissões previstas

- Proprietário
- Gerente
- Reservas
- Marketing
- Administrador técnico

Scripts externos e configurações avançadas ficam restritos ao administrador técnico.
