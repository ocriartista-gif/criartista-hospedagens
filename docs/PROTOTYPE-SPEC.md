# Protótipo aprovado — referência funcional

Esta especificação congela as decisões aprovadas antes do desenvolvimento real.

## Site público
- Visual premium/editorial de hospedagem; foco em fotografia e desejo.
- Home com hero, BookingArea, apresentação, acomodações, benefícios de reserva direta, experiências, avaliações, localização e CTA final.
- Mobile-first, CTA de reserva persistente quando adequado.
- Página individual de acomodação com galeria, capacidade, metragem, camas, comodidades e BookingArea contextual.

## BookingArea
Modos:
- criartista: formulário + lead + WhatsApp;
- external_link;
- widget;
- embed;
- popup.

A página não conhece o fornecedor: renderiza a BookingArea conforme configuração da propriedade.

## White-label
O cliente pode alterar:
- logo principal, logo claro e favicon;
- cor principal, secundária, destaque, fundo e texto;
- tipografia de títulos, eyebrow e interface;
- capitalização, peso e espaçamento do eyebrow dentro de limites seguros.

O painel administrativo também herda a cor principal da marca.

A plataforma protege:
- contraste mínimo;
- hierarquia dos CTAs;
- grid;
- componentes;
- responsividade;
- fluxo de reserva.

Princípio: **a marca pode mudar; a jornada de reserva não.**

## Conteúdo
Área própria para editar eyebrow, título e descrição das seções principais, sem liberar edição estrutural.

## Acomodações
CRUD com:
- nome, slug, descrições;
- capacidade, adultos, crianças;
- metragem e camas;
- comodidades;
- até 5 fotos na primeira versão;
- capa;
- ordem;
- publicado/oculto.

## Avaliações
Módulo próprio, com avaliações reais:
- nome;
- nota;
- texto;
- fonte;
- link original;
- data;
- foto opcional;
- destaque;
- publicado/oculto.

## Leads / CRM
Campos previstos:
- nome, WhatsApp e e-mail;
- check-in, check-out e noites;
- adultos e crianças;
- acomodação;
- origem, campanha, medium/UTM;
- status;
- responsável;
- valor cotado;
- último contato;
- próximo follow-up;
- observações.

Status: novo, contatado, cotacao_enviada, follow_up, reservado, perdido.

## Integrações
- Motor de reservas;
- Google Analytics 4;
- Meta Ads / Pixel (CAPI em etapa avançada);
- Google Tag Manager;
- Google Sheets;
- WhatsApp;
- Instagram, Facebook, TikTok, YouTube e LinkedIn;
- consentimento de cookies (necessários, analytics e publicidade).

## Permissões
Perfis previstos:
- proprietário;
- gerente;
- reservas;
- marketing;
- administrador técnico.

Scripts externos e configurações avançadas ficam restritos ao administrador técnico.

## Fonte visual completa
Os mockups e o protótipo HTML completos foram preservados no pacote de desenvolvimento original fora do repositório para evitar binários pesados no Git.
