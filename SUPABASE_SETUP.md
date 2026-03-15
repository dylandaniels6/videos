# Supabase setup for Dylan Videos

Follow these steps to use Supabase as the backend so your videos and thumbnails are stored in the cloud and shared across devices.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose your organization, name the project (e.g. `dylan-videos`), set a database password (save it somewhere), pick a region, then click **Create new project**.
4. Wait for the project to finish provisioning.

---

## 2. Create the `videos` table

1. In the Supabase dashboard, open **SQL Editor**.
2. Click **New query** and paste the SQL below, then run it.

```sql
-- Videos table (matches your app’s fields)
create table public.videos (
  id text primary key,
  title text not null default '',
  category text not null default 'life',
  instagram_url text not null default '',
  thumbnail text not null default '',
  sort_order int not null default 0
);

-- Allow anyone to read videos (for the public site)
alter table public.videos enable row level security;

create policy "Videos are viewable by everyone"
  on public.videos for select
  using (true);

-- Only authenticated users can insert/update/delete (admin)
create policy "Authenticated users can manage videos"
  on public.videos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

---

## 2b. Create the `site_intro` table (page headline + description)

So the main page headline and description sync to Supabase and appear on your live site (e.g. Vercel), run the SQL in **supabase/site-intro-table.sql** in the SQL Editor. That creates a single-row table and RLS so everyone can read it and only authenticated users can update it.

---

## 3. Create the Storage bucket for thumbnails

1. Go to **Storage** in the sidebar and click **New bucket**.
2. Name: `thumbnails`.
3. Turn **Public bucket** ON (so the main site can show images without auth).
4. Click **Create bucket**.

Then add policies:

**Policy 1 – authenticated users can upload/update/delete**
1. Open the **thumbnails** bucket → **Policies**.
2. Click **New policy** → **For full customization**.
3. Policy name: `Authenticated users can upload thumbnails`.
4. Allowed operations: enable **INSERT**, **UPDATE**, **DELETE** (or “All”).
5. Target roles: **authenticated**.
6. USING expression: `auth.role() = 'authenticated'`.
7. WITH CHECK expression: `auth.role() = 'authenticated'`.
8. Save.

**Policy 2 – anyone can view**
1. **New policy** again.
2. Name: `Anyone can view thumbnails`.
3. Allowed operation: **SELECT** (read).
4. USING: `true`.
5. Save.

---

## 4. Get your project URL and anon key

1. In the dashboard go to **Project settings** (gear) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under “Project API keys”).

---

## 5. Create an admin user (for the admin page)

1. Go to **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter an email and password (e.g. your email and a strong password). This is the account you’ll use to log in on the admin page.
4. Click **Create user**.

(You can also use **Sign up** on the admin page once it’s wired to Supabase.)

---

## 6. Connect the app to Supabase

1. In your project folder, open **supabase-config.js**.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the values from step 4:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

3. Save the file. Do **not** commit the real anon key to a public repo; use environment variables or a private config in production.

---

## 7. Load initial data (optional)

If you want to copy your existing videos from `videos.js` into Supabase once:

1. In the SQL Editor, run `select * from public.videos;` to see the table (it will be empty).
2. Either:
   - Use the admin page: log in, then use “Reset to default” so the list loads from `videos.js`, then click “Save all changes” so it writes to Supabase, or
   - Manually insert rows via the **Table Editor** (e.g. one row per video with `id`, `title`, `category`, `instagram_url`, `thumbnail`, `sort_order`).

After that, the main site will read from Supabase. Use the admin page to edit and upload thumbnails; they’ll be stored in the `thumbnails` bucket and the `videos` table will store the image URLs.

---

## Summary

| Step | What you did |
|------|----------------|
| 1 | Created a Supabase project |
| 2 | Created `videos` table and RLS (public read, auth write) |
| 3 | Created public `thumbnails` bucket and policies (public read, auth write) |
| 4 | Copied Project URL and anon key |
| 5 | Created an admin user in Authentication |
| 6 | Filled in `supabase-config.js` |
| 7 | (Optional) Loaded initial data |

Once this is done, the main site will use Supabase when `supabase-config.js` is configured, and the admin page will require login and then save/upload to Supabase.

---

## If Save says "Could not find the 'description' column"

Your `videos` table was created before the description field existed. Add the column once:

1. Open **SQL Editor** in the Supabase dashboard.
2. Run the contents of **`supabase/add-description-column.sql`** (or paste and run):

```sql
alter table public.videos add column if not exists description text not null default '';
```

3. Try saving again from the admin page.
