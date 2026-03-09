-- ============================================================
--  Art History Learning System – Initial Schema
--  Apply via: supabase db push  OR  Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade unique,
  username    text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── periods ─────────────────────────────────────────────────
create table if not exists periods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  start_year  int,
  end_year    int,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── artists ─────────────────────────────────────────────────
create table if not exists artists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  birth_year  int,
  death_year  int,
  nationality text,
  bio         text,
  period_id   uuid references periods(id) on delete set null,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── artworks ────────────────────────────────────────────────
create table if not exists artworks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  artist_id   uuid references artists(id) on delete set null,
  year        int,
  medium      text,
  dimensions  text,
  description text,
  image_url   text,
  period_id   uuid references periods(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── tags ────────────────────────────────────────────────────
create table if not exists tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- ── artwork_tags ────────────────────────────────────────────
create table if not exists artwork_tags (
  artwork_id uuid not null references artworks(id) on delete cascade,
  tag_id     uuid not null references tags(id) on delete cascade,
  primary key (artwork_id, tag_id)
);

-- ── artist_tags ─────────────────────────────────────────────
create table if not exists artist_tags (
  artist_id  uuid not null references artists(id) on delete cascade,
  tag_id     uuid not null references tags(id) on delete cascade,
  primary key (artist_id, tag_id)
);

-- ── notes ───────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  content     text,
  entity_type text check (entity_type in ('artist','artwork','period','notion_article')),
  entity_id   uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── favorites ───────────────────────────────────────────────
create table if not exists favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('artist','artwork','period','notion_article')),
  entity_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

-- ── notion_articles ─────────────────────────────────────────
create table if not exists notion_articles (
  id             uuid primary key default gen_random_uuid(),
  notion_page_id text not null unique,
  title          text not null,
  content        text,
  cover_url      text,
  tags           text[],
  synced_at      timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- ============================================================
--  Row Level Security
-- ============================================================

alter table profiles        enable row level security;
alter table periods         enable row level security;
alter table artists         enable row level security;
alter table artworks        enable row level security;
alter table tags            enable row level security;
alter table artwork_tags    enable row level security;
alter table artist_tags     enable row level security;
alter table notes           enable row level security;
alter table favorites       enable row level security;
alter table notion_articles enable row level security;

-- profiles: owner only
create policy "profiles_owner" on profiles
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- periods / artists / artworks / tags: any authenticated user can read; only service role can write
create policy "periods_read"   on periods   for select using (auth.role() = 'authenticated');
create policy "artists_read"   on artists   for select using (auth.role() = 'authenticated');
create policy "artworks_read"  on artworks  for select using (auth.role() = 'authenticated');
create policy "tags_read"      on tags      for select using (auth.role() = 'authenticated');
create policy "artwork_tags_read" on artwork_tags for select using (auth.role() = 'authenticated');
create policy "artist_tags_read"  on artist_tags  for select using (auth.role() = 'authenticated');

-- periods / artists / artworks / tags: authenticated user can insert/update/delete (personal use)
create policy "periods_write"  on periods  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "artists_write"  on artists  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "artworks_write" on artworks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "tags_write"     on tags     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "artwork_tags_write" on artwork_tags for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "artist_tags_write"  on artist_tags  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- notes: owner only
create policy "notes_owner" on notes
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- favorites: owner only
create policy "favorites_owner" on favorites
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- notion_articles: any authenticated user can read; service role writes via sync
create policy "notion_articles_read"  on notion_articles for select using (auth.role() = 'authenticated');
create policy "notion_articles_write" on notion_articles for all   using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ============================================================
--  Storage bucket
-- ============================================================
-- Run these in the Supabase Dashboard > Storage or via CLI:
--   supabase storage create art-images --public
-- Then add a policy so authenticated users can upload:
--   INSERT allowed for authenticated role in bucket art-images

-- ============================================================
--  Updated-at trigger helper
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at  before update on profiles  for each row execute function set_updated_at();
create trigger trg_periods_updated_at   before update on periods   for each row execute function set_updated_at();
create trigger trg_artists_updated_at   before update on artists   for each row execute function set_updated_at();
create trigger trg_artworks_updated_at  before update on artworks  for each row execute function set_updated_at();
create trigger trg_notes_updated_at     before update on notes     for each row execute function set_updated_at();
