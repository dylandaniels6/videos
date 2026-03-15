# Deploy to dallywithdilly.com (Vercel)

## 1. Create a new GitHub repo

- Go to [github.com/new](https://github.com/new)
- Repository name: e.g. `dallywithdilly` or `dylan-videos`
- Create **without** initializing with a README (you already have files)
- Copy the repo URL (e.g. `https://github.com/YOUR_USERNAME/dallywithdilly.git`)

## 2. Push this project to GitHub

From this folder in Terminal:

```bash
cd "/Users/Dylan/Desktop/dylan-videos 3"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name.

## 3. Import into Vercel

- [vercel.com/new](https://vercel.com/new) → **Import** the new repository
- Framework Preset: **Other** (static)
- Build Command: leave empty (or `echo "No build"`)
- Output Directory: `.` or leave default
- Click **Deploy**

## 4. Add your domain

- In the Vercel project → **Settings** → **Domains**
- Add `dallywithdilly.com` and `www.dallywithdilly.com`
- Follow Vercel’s DNS instructions for your registrar (CNAME / A records)

## 5. Remove domain from old project (optional)

- Open the old Vercel project (dillysdally) → **Settings** → **Domains**
- Remove `dallywithdilly.com` and `www` so only the new project uses the domain
