# Admin Portal

React (Vite) frontend for the Loyalty Platform admin: members, levels, rewards, campaigns, audit logs. Talks to the **Admin Backend** API.

## Local development

1. **Admin Backend** must be running (e.g. `http://localhost:3000`). From `admin-backend/`: `npm run start:dev`.
2. From this directory:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` and `/webhook` to the Admin Backend.

## Deploy on Render (free)

Deploy the Admin Portal as a **Static Site** so you can open it from anywhere.

### Prerequisites

- **Admin Backend** deployed on Render and **Live** (e.g. `https://loyalty-admin-backend.onrender.com`).
- Repo pushed to GitHub (root contains `admin-portal`).

### Steps

1. Go to [render.com](https://render.com) → **New +** → **Static Site**.
2. Connect your GitHub repo.
3. **Settings:**
   - **Name:** e.g. `loyalty-admin-portal`
   - **Root Directory:** `admin-portal`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Environment:** Add a variable:
   - **Key:** `VITE_API_URL`
   - **Value:** your **Admin Backend** public URL (e.g. `https://loyalty-admin-backend.onrender.com`). No trailing slash.
   - This is baked into the build so the app calls the correct API in production.
5. Click **Create Static Site**. After the first deploy, note the URL (e.g. `https://loyalty-admin-portal.onrender.com`).
6. **SPA routing (both root and /login):** So that both `https://loyalty-admin-portal.onrender.com` and `https://loyalty-admin-portal.onrender.com/login` (and any route) display the app, add a **Rewrite** rule in Render:
   - Open your **Static Site** → **Settings** → **Redirects/Rewrites**.
   - Add rule: **Source** `/*`, **Destination** `/index.html`, **Action** `Rewrite`.
   - Save. This makes Render serve `index.html` for all paths so React Router can handle `/`, `/login`, `/members`, etc.
7. **CORS:** So the browser can call the Admin Backend from the portal origin, add CORS on the Admin Backend:
   - Open the **Admin Backend** Web Service in Render → **Environment**.
   - Add **Key:** `CORS_ORIGIN`, **Value:** your Admin Portal URL (e.g. `https://loyalty-admin-portal.onrender.com`).
   - Save (redeploy if needed).

### After deploy

Both URLs will work: the root (e.g. `https://loyalty-admin-portal.onrender.com`) and direct links (e.g. `https://loyalty-admin-portal.onrender.com/login`) once the Rewrite rule above is set.

- Open the Admin Portal URL. Log in with an admin user (e.g. from seed: `admin@loyalty.local` / `admin123`) or use your own admin account.
- If the first request is slow, the Admin Backend may be waking from sleep (free tier); wait and retry.

### Checklist

| Item | Notes |
|------|--------|
| Admin Backend deployed & Live | Portal only works if the API is up. |
| `VITE_API_URL` | Must be the **public** Admin Backend URL. Set before building. |
| `CORS_ORIGIN` on Admin Backend | Must include the Admin Portal URL so API requests from the browser succeed. |
