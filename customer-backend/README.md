# Customer Backend

Separate API project for **customer-facing** endpoints. Proxies to the Admin Backend (`admin-backend`).

## APIs (member profile)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/members/levels | JWT | **Company_GetMemberLevel** – list member levels (Yellow, Silver, Black) with benefit fields. |
| GET | /api/members/get-info/:id | JWT | **Member_GetInfo** – full member (profile, address, pointLedgers, redemptions, transactions). `:id` = internal UUID. |
| POST | /api/members | JWT | Create member. Body: profile + optional address (name, surname, nationalType, sex, birthdate, mobile, email, addr_*, etc.). |
| PATCH | /api/members/:id | JWT | Update member profile (and/or address). Body: any of name, surname, nationalType, citizenId, passport, sex, birthdate, mobile, email, addr_*, etc. |
| PATCH | /api/members/:id/address | JWT | Update member address only. Body: addr_addressNo, addr_building, addr_road, addr_soi, addr_subdistrict, addr_district, addr_province, addr_postalCode. |
| PATCH | /api/members/:id/cancel | JWT | Cancel member: mark `active = false` (deactivate). Does not delete the member. |

Use the same JWT as the platform (e.g. from `POST /api/auth/login` on the Admin Backend). Base URL: `http://localhost:3001` by default.

## Setup

1. **Admin Backend** must be running (e.g. `http://localhost:3000`). Run it from `admin-backend/`.
2. Copy `.env.example` to `.env` and set:
   - `PLATFORM_API_URL` – Admin Backend URL (default `http://localhost:3000`)
   - `JWT_SECRET` – same as admin-backend so platform-issued tokens are valid
3. Install and run:

```bash
npm install
npm run start:dev
```

API: `http://localhost:3001`

## How to use

1. Get a JWT from the **Admin Backend**. In **PowerShell** run one of these (do not paste the word "POST" alone):
   - **Login:**  
     `Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"<email>","password":"<password>"}'`
   - **API key:**  
     `Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/token" -Headers @{ "X-API-Key" = "<apiKey>" }`  
     (Set `API_KEY` in admin-backend `.env` and run seed.)
2. Call customer-backend with that token:

```bash
# Member levels
curl -X GET http://localhost:3001/api/members/levels -H "Authorization: Bearer <token>"

# Member info (replace :id with member internal UUID)
curl -X GET http://localhost:3001/api/members/get-info/:id -H "Authorization: Bearer <token>"

# Create member
curl -X POST http://localhost:3001/api/members -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"name\":\"John\",\"surname\":\"Doe\",\"nationalType\":\"THAI\",\"sex\":\"M\",\"birthdate\":\"1990-01-01\",\"mobile\":\"0812345678\",\"email\":\"john@example.com\"}"

# Update profile
curl -X PATCH http://localhost:3001/api/members/:id -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"mobile\":\"0898765432\",\"email\":\"new@example.com\"}"

# Update address only (addr_addressNo, addr_building, addr_road, addr_soi, addr_subdistrict, addr_district, addr_province, addr_postalCode)
curl -X PATCH http://localhost:3001/api/members/:id/address -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"addr_addressNo\":\"123\",\"addr_building\":\"Tower A\",\"addr_road\":\"Main St\",\"addr_soi\":\"Soi 5\",\"addr_subdistrict\":\"X\",\"addr_district\":\"Y\",\"addr_province\":\"Bangkok\",\"addr_postalCode\":\"10110\"}"

# Cancel member (marks active = false; does not delete)
curl -X PATCH http://localhost:3001/api/members/:id/cancel -H "Authorization: Bearer <token>"
```

Optional: set `PLATFORM_SERVICE_TOKEN` in customer-backend `.env` to a valid Admin Backend JWT; then server-to-server calls can omit the client `Authorization` header.

---

## Deploy API (free tier)

Deploy the Customer Backend so mobile or web apps can call it over the internet. **Requirement:** Admin Backend must be deployed first and reachable at a public URL (you’ll set that as `PLATFORM_API_URL`).

### Option 1: Render (free)

1. Push this repo to **GitHub** (ensure `customer-backend` is at repo root or adjust paths below).
2. Go to [render.com](https://render.com) → Sign up (free) → **New** → **Web Service**.
3. Connect your GitHub repo. Set:
   - **Root Directory:** `customer-backend` (if the app is in that folder).
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free.
4. **Environment** (required):
   - `PLATFORM_API_URL` = your **deployed Admin Backend URL** (e.g. `https://your-admin-backend.onrender.com`).
   - `JWT_SECRET` = same secret as your Admin Backend (so JWTs from login/token work).
   - `PORT` = leave empty (Render sets it).
5. Deploy. Your Customer Backend API will be at `https://<your-service>.onrender.com`.  
   **Note:** Free services spin down after ~15 min idle; first request after that may take ~1 min to wake.

### Option 2: Railway (free)

1. Go to [railway.app](https://railway.app) → Login with GitHub.
2. **New Project** → **Deploy from GitHub** → select repo and (if needed) set **Root Directory** to `customer-backend`.
3. **Variables** tab: add `PLATFORM_API_URL`, `JWT_SECRET` (same as Admin Backend).
4. Railway detects Node and runs build/start. If not: set **Build Command** `npm install && npm run build`, **Start Command** `npm run start:prod`.
5. **Settings** → **Generate Domain** to get a public URL.

### Option 3: Fly.io (free)

1. Install [flyctl](https://fly.io/docs/hack/getting-started/).
2. In `customer-backend`: `fly launch` (create app, no DB needed). Then:
   ```bash
   fly secrets set PLATFORM_API_URL=https://your-admin-backend-url.com
   fly secrets set JWT_SECRET=your-jwt-secret
   fly deploy
   ```
3. Your API: `https://<app-name>.fly.dev`.

### Checklist

| Item | Notes |
|------|--------|
| Admin Backend deployed | Customer Backend only proxies; it needs a live Admin Backend URL. |
| `PLATFORM_API_URL` | Must be the **public** Admin Backend URL (e.g. `https://...`). |
| `JWT_SECRET` | Must match Admin Backend so tokens work. |
| CORS | If a web app on another domain calls the API, set `CORS_ORIGIN` to that origin (e.g. `https://your-app.vercel.app`). |

After deploy, call your API at the service URL, e.g. `GET https://<your-customer-backend>.onrender.com/api/members/levels` with header `Authorization: Bearer <token>`.
