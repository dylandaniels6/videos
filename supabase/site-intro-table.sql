-- Page opener (headline + description). Single row. Run in Supabase SQL Editor.
create table if not exists public.site_intro (
  id int primary key default 1 check (id = 1),
  title text not null default '',
  description text not null default ''
);

insert into public.site_intro (id, title, description)
values (1, '100 of my favorite videos', 'test test test')
on conflict (id) do nothing;

alter table public.site_intro enable row level security;

create policy "Intro is viewable by everyone"
  on public.site_intro for select
  using (true);

create policy "Authenticated users can update intro"
  on public.site_intro for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
