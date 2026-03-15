-- Run this in Supabase SQL Editor (see SUPABASE_SETUP.md).

-- Videos table
create table if not exists public.videos (
  id text primary key,
  title text not null default '',
  description text not null default '',
  category text not null default 'life',
  instagram_url text not null default '',
  thumbnail text not null default '',
  sort_order int not null default 0
);

-- If you already created the table without description, run add-description-column.sql once.

alter table public.videos enable row level security;

create policy "Videos are viewable by everyone"
  on public.videos for select
  using (true);

create policy "Authenticated users can manage videos"
  on public.videos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
