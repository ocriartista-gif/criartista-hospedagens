-- Criartista Hospedagens — esquema inicial multi-hospedagem
-- Aplicar somente quando o projeto Supabase for criado.

create extension if not exists "pgcrypto";

create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  phone text,
  whatsapp text,
  email text,
  address text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table property_themes (
  property_id uuid primary key references properties(id) on delete cascade,
  primary_color text not null default '#183B2A',
  secondary_color text not null default '#8CA67C',
  accent_color text not null default '#C97863',
  background_color text not null default '#F6F2EA',
  text_color text not null default '#302C2F',
  heading_font text not null default 'Playfair Display',
  eyebrow_font text not null default 'Inter',
  body_font text not null default 'Inter',
  eyebrow_transform text not null default 'uppercase',
  eyebrow_weight text not null default '600',
  eyebrow_spacing text not null default 'wide',
  updated_at timestamptz not null default now()
);

create table content_sections (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  section_key text not null,
  eyebrow text,
  title text,
  description text,
  enabled boolean not null default true,
  extra jsonb not null default '{}'::jsonb,
  unique(property_id, section_key)
);

create table accommodations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  capacity integer not null default 2,
  adults integer not null default 2,
  children integer not null default 0,
  size_m2 numeric,
  beds text,
  amenities jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(property_id, slug)
);

create table accommodation_images (
  id uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references accommodations(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  is_cover boolean not null default false,
  sort_order integer not null default 0
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  guest_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  source text,
  source_url text,
  review_date date,
  photo_path text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  email text,
  check_in date,
  check_out date,
  nights integer,
  adults integer not null default 2,
  children integer not null default 0,
  accommodation_id uuid references accommodations(id) on delete set null,
  source text,
  campaign text,
  medium text,
  status text not null default 'novo',
  assigned_to uuid,
  quoted_value numeric,
  last_contact timestamptz,
  next_follow_up timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  integration_key text not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(property_id, integration_key)
);

create table social_links (
  property_id uuid primary key references properties(id) on delete cascade,
  instagram text,
  facebook text,
  tiktok text,
  youtube text,
  linkedin text,
  updated_at timestamptz not null default now()
);

create table property_members (
  property_id uuid not null references properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key(property_id, user_id)
);

-- RLS deve ser ativada após criarmos as políticas com o modelo de autenticação definitivo.
