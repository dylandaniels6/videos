-- Run this in Supabase SQL Editor if you get "Could not find the 'description' column" when saving.
-- (You created the videos table before the description field was added.)

alter table public.videos add column if not exists description text not null default '';
