insert into properties (name, slug, tagline, description, phone, whatsapp, email, address, status)
values (
  'Villa Ipê',
  'villa-ipe',
  'Dias leves. Memórias que ficam.',
  'Um refúgio entre o verde, com conforto, atendimento próximo e reserva direta.',
  '(19) 99999-9999',
  '5519999999999',
  'reservas@villaipe.demo',
  'Interior de São Paulo',
  'active'
)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  address = excluded.address,
  status = excluded.status;

insert into property_themes (
  property_id, primary_color, secondary_color, accent_color, background_color, text_color,
  heading_font, eyebrow_font, body_font, eyebrow_transform, eyebrow_weight, eyebrow_spacing
)
select id, '#183B2A', '#8CA67C', '#C97863', '#F6F2EA', '#302C2F',
       'Playfair Display', 'Inter', 'Inter', 'uppercase', '600', 'wide'
from properties where slug = 'villa-ipe'
on conflict (property_id) do update set
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  accent_color = excluded.accent_color,
  background_color = excluded.background_color,
  text_color = excluded.text_color,
  heading_font = excluded.heading_font,
  eyebrow_font = excluded.eyebrow_font,
  body_font = excluded.body_font,
  eyebrow_transform = excluded.eyebrow_transform,
  eyebrow_weight = excluded.eyebrow_weight,
  eyebrow_spacing = excluded.eyebrow_spacing,
  updated_at = now();

insert into content_sections (property_id, section_key, eyebrow, title, description, enabled)
select p.id, s.section_key, s.eyebrow, s.title, s.description, true
from properties p
cross join (values
  ('hero','POUSADA BOUTIQUE NO INTERIOR DE SÃO PAULO','Dias leves. Memórias que ficam.','Um refúgio entre o verde, com conforto, atendimento próximo e reserva direta.'),
  ('intro','SUA PAUSA COMEÇA AQUI','O conforto de chegar e sentir que escolheu certo.','Na Villa Ipê, cada detalhe foi pensado para uma estadia sem pressa: acolhimento verdadeiro, natureza ao redor e a liberdade de falar diretamente com quem cuida da pousada.'),
  ('accommodations','ACOMODAÇÕES','Seu canto entre o verde.','Escolha o espaço que combina com a sua viagem.'),
  ('direct_booking','RESERVA DIRETA','Condições claras e contato humano.','Do primeiro clique ao check-out, fale diretamente com quem cuida da hospedagem.'),
  ('experiences','EXPERIÊNCIAS','O que faz você lembrar da viagem.','O café sem pressa, o silêncio do fim da tarde e a natureza logo depois da varanda.'),
  ('reviews','AVALIAÇÕES','Quem vem, leva histórias.','Depoimentos reais de hóspedes que viveram a experiência.'),
  ('location','LOCALIZAÇÃO','Perto o bastante. Longe na medida certa.','Interior de São Paulo, com acesso simples e clima de refúgio.'),
  ('footer','VILLA IPÊ','Hospedagens que criam boas histórias.','')
) as s(section_key, eyebrow, title, description)
where p.slug = 'villa-ipe'
on conflict (property_id, section_key) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  description = excluded.description,
  enabled = excluded.enabled;

insert into accommodations (
  property_id, name, slug, short_description, description, capacity, adults, children, size_m2, beds, amenities, published, sort_order
)
select p.id, a.name, a.slug, a.short_description, a.description, a.capacity, a.adults, a.children, a.size_m2, a.beds, a.amenities::jsonb, true, a.sort_order
from properties p
cross join (values
  ('Chalé Jardim','chale-jardim','Varanda privativa e silêncio para até 4 hóspedes.','Um chalé cercado de verde, com varanda privativa e espaço para desacelerar com conforto.',4,2,2,35,'1 cama queen + 2 camas de solteiro','["Wi-Fi","Ar-condicionado","Frigobar","Varanda","Smart TV"]',1),
  ('Suíte Ipê','suite-ipe','Conforto essencial para duas pessoas.','Uma suíte acolhedora para casais que valorizam conforto e tranquilidade.',2,2,0,28,'1 cama queen','["Wi-Fi","Ar-condicionado","Frigobar","Smart TV"]',2),
  ('Chalé Família','chale-familia','Mais espaço para viver bons dias juntos.','Acomodação ampla para famílias, com ambientes confortáveis e integração com a natureza.',6,4,2,48,'1 cama queen + 4 camas de solteiro','["Wi-Fi","Ar-condicionado","Frigobar","Varanda","Smart TV"]',3)
) as a(name, slug, short_description, description, capacity, adults, children, size_m2, beds, amenities, sort_order)
where p.slug = 'villa-ipe'
on conflict (property_id, slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  capacity = excluded.capacity,
  adults = excluded.adults,
  children = excluded.children,
  size_m2 = excluded.size_m2,
  beds = excluded.beds,
  amenities = excluded.amenities,
  published = excluded.published,
  sort_order = excluded.sort_order;

delete from accommodation_images
where accommodation_id in (
  select a.id from accommodations a
  join properties p on p.id = a.property_id
  where p.slug = 'villa-ipe'
);

insert into accommodation_images (accommodation_id, storage_path, alt_text, is_cover, sort_order)
select a.id, i.storage_path, i.alt_text, i.is_cover, i.sort_order
from accommodations a
join properties p on p.id = a.property_id
join (values
  ('chale-jardim','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80','Chalé Jardim',true,1),
  ('chale-jardim','https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80','Interior do Chalé Jardim',false,2),
  ('suite-ipe','https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80','Suíte Ipê',true,1),
  ('chale-familia','https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80','Chalé Família',true,1)
) as i(slug, storage_path, alt_text, is_cover, sort_order)
  on i.slug = a.slug
where p.slug = 'villa-ipe';

delete from reviews
where property_id = (select id from properties where slug = 'villa-ipe');

insert into reviews (property_id, guest_name, rating, review_text, source, review_date, featured, published)
select p.id, r.guest_name, r.rating, r.review_text, r.source, r.review_date::date, r.featured, true
from properties p
cross join (values
  ('Mariana S.',5,'A sensação é de estar longe da correria sem abrir mão do conforto. O atendimento fez toda a diferença.','Google','2026-08-14',true),
  ('Carlos H.',5,'Quarto muito confortável, café excelente e equipe muito atenciosa.','Booking','2026-07-29',false)
) as r(guest_name, rating, review_text, source, review_date, featured)
where p.slug = 'villa-ipe';

insert into social_links (property_id, instagram)
select id, 'https://instagram.com/villaipe'
from properties where slug = 'villa-ipe'
on conflict (property_id) do update set instagram = excluded.instagram, updated_at = now();

insert into integrations (property_id, integration_key, enabled, config)
select p.id, i.integration_key, false, i.config::jsonb
from properties p
cross join (values
  ('booking','{"mode":"criartista"}'),
  ('ga4','{}'),
  ('meta_pixel','{}'),
  ('gtm','{}'),
  ('google_sheets','{}'),
  ('cookie_consent','{"necessary":true,"analytics":false,"advertising":false}')
) as i(integration_key, config)
where p.slug = 'villa-ipe'
on conflict (property_id, integration_key) do update set
  enabled = excluded.enabled,
  config = excluded.config,
  updated_at = now();
