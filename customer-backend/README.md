# Customer Backend

Separate API project for **customer-facing** endpoints. Proxies to the Admin Backend (`admin-backend`). No business logic or database here—see [ARCHITECTURE.md](../ARCHITECTURE.md) for design. API types are shared via `@loyalty/contracts`.

## APIs (member profile)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/token | — | Get JWT with API key. Send `X-API-Key` header or body `{ "apiKey": "..." }`. Proxies to Admin Backend. Response: `{ status: { success, message }, data: { access_token } }`. |
| GET | /api/members/levels | JWT | **Company_GetMemberLevel** – list member levels (Yellow, Silver, Black) with benefit fields. |
| GET | /api/members/get-info/:memberId | JWT | **Member_GetInfo** – full member (profile, address, pointLedgers, redemptions, transactions). `:memberId` = human-readable ID (e.g. M123ABC). |
| POST | /api/members | JWT | Create member. Body: profile + optional address (firstName, lastName, nationalType, gender, birthdate, mobile, email, levelCode, addr_*, etc.). |
| PATCH | /api/members/:memberId | JWT | Update member profile (and/or address) by memberId. Body: any of firstName, lastName, nationalType, citizenId, passport, gender, birthdate, mobile, email, levelCode, addr_*, etc. |
| PATCH | /api/members/:memberId/address | JWT | Update member address only by memberId. Body: addr_addressNo, addr_building, addr_road, addr_soi, addr_moo, addr_subdistrict, addr_subdistrictCode, addr_district, addr_districtCode, addr_province, addr_provinceCode, addr_zipCode, addr_country. |
| PATCH | /api/members/:memberId/cancel | JWT | Cancel member by memberId: mark `active = false` (deactivate). Does not delete the member. |

## APIs (location by zip code)

Thailand address master: list province, district, subdistrict by postal code. Proxies to Admin Backend. Requires Admin Backend to have Thailand geography seeded (`npm run prisma:seed-thailand` in admin-backend).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/location/provinces?zipCode=10400 | JWT | List provinces that have subdistricts with this zip code. Returns `[{ id, code, nameTh, nameEn }]`. |
| GET | /api/location/districts?zipCode=10400 | JWT | List districts that have subdistricts with this zip code. Returns `[{ id, code, nameTh, nameEn }]`. |
| GET | /api/location/subdistricts?zipCode=10400 | JWT | List subdistricts with this zip code. Returns `[{ id, code, nameTh, nameEn, zipCode }]`. |

Use the same JWT as the platform (e.g. from `POST /api/auth/login` on the Admin Backend). Base URL: `http://localhost:3001` by default.

## Response format

All APIs return the same envelope:

**Success (2xx):**
```json
{
  "status": { "success": true, "message": "success" },
  "data": { ... }
}
```
`data` is the endpoint payload (object or array). Example: `GET /api/members/levels` → `data` is the array of levels; `POST /api/auth/token` → `data` is `{ "access_token": "..." }`.

**Error (4xx/5xx):**
```json
{
  "status": { "success": false, "message": "<error message>" },
  "data": null
}
```
Optional `hint` field may be present (e.g. for 401).

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

1. Get a JWT (from Customer Backend or Admin Backend). In **PowerShell**:
   - **API key (Customer Backend):**  
     `Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/auth/token" -Headers @{ "X-API-Key" = "<apiKey>" }`
   - **Login (Admin Backend):**  
     `Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"<email>","password":"<password>"}'`
   - **API key (Admin Backend):**  
     `Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/token" -Headers @{ "X-API-Key" = "<apiKey>" }`  
     (Set `API_KEY` in admin-backend `.env` and run seed.)
2. Call customer-backend with that token (required for `/api/members/*`; without it you get **401 Unauthorized**):

```bash
# Member levels
curl -X GET http://localhost:3001/api/members/levels -H "Authorization: Bearer <token>"

# Member info by memberId (e.g. M123ABC)
curl -X GET http://localhost:3001/api/members/get-info/<memberId> -H "Authorization: Bearer <token>"

# Create member
curl -X POST http://localhost:3001/api/members -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"name\":\"John\",\"surname\":\"Doe\",\"nationalType\":\"THAI\",\"sex\":\"M\",\"birthdate\":\"1990-01-01\",\"mobile\":\"0812345678\",\"email\":\"john@example.com\"}"

# Update profile by memberId
curl -X PATCH http://localhost:3001/api/members/<memberId> -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"mobile\":\"0898765432\",\"email\":\"new@example.com\"}"

# Update address only by memberId
curl -X PATCH http://localhost:3001/api/members/<memberId>/address -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"addr_addressNo\":\"123\",\"addr_building\":\"Tower A\",\"addr_road\":\"Main St\",\"addr_soi\":\"Soi 5\",\"addr_moo\":\"1\",\"addr_subdistrict\":\"X\",\"addr_district\":\"Y\",\"addr_province\":\"Bangkok\",\"addr_zipCode\":\"10110\",\"addr_country\":\"TH\"}"

# Cancel member by memberId (marks active = false; does not delete)
curl -X PATCH http://localhost:3001/api/members/<memberId>/cancel -H "Authorization: Bearer <token>"

# Location by zip code (Thailand)
curl -X GET "http://localhost:3001/api/location/provinces?zipCode=10400" -H "Authorization: Bearer <token>"
curl -X GET "http://localhost:3001/api/location/districts?zipCode=10400" -H "Authorization: Bearer <token>"
curl -X GET "http://localhost:3001/api/location/subdistricts?zipCode=10400" -H "Authorization: Bearer <token>"
```

Optional: set `PLATFORM_SERVICE_TOKEN` in customer-backend `.env` to a valid Admin Backend JWT; then server-to-server calls can omit the client `Authorization` header.

### 502 on POST /api/auth/token

- **Cause:** Customer Backend cannot reach the Admin Backend (connection refused / unreachable).
- **Fix:** Start the **Admin Backend** first: from `admin-backend/` run `npm run start:dev`. Ensure `PLATFORM_API_URL` in customer-backend `.env` is correct (default `http://localhost:3000`).

### 401 on /api/members/* or /api/location/*

- **Cause:** The request has no `Authorization` header or the JWT is invalid/expired.
- **Fix:** Get a JWT (e.g. `POST /api/auth/token` with `X-API-Key: <apiKey>` — Admin Backend must be running), then call with `Authorization: Bearer <access_token>`.
- If you send a token and still get 401, ensure `JWT_SECRET` in customer-backend `.env` **matches** admin-backend (tokens are issued by admin-backend).

---

## Deploy API (free tier)

Deploy the Customer Backend so mobile or web apps can call it over the internet.

### Before you deploy

1. **Admin Backend** must be deployed and reachable at a **public URL** (e.g. `https://your-admin.onrender.com`). Set that as `PLATFORM_API_URL`.
2. **Build order:** This project depends on `@loyalty/contracts` (in `../packages/contracts`). Build contracts first, then customer-backend. Use the build commands in each option below.
3. **Environment variables** (all platforms):
   - `PLATFORM_API_URL` – **required.** Public Admin Backend URL (e.g. `https://your-admin.onrender.com`).
   - `JWT_SECRET` – **required.** Same value as Admin Backend so JWTs work.
   - `CORS_ORIGIN` – optional. If a web app on another domain calls the API, set to that origin (e.g. `https://your-app.vercel.app`). Omit or `true` to allow any origin.
   - `PORT` – leave unset on Render/Railway/Fly (they set it).

### Option 1: Render (free)

1. **Deploy Admin Backend first.** In Render: **New** → **Web Service** → connect the same repo. Set **Root Directory** to `admin-backend`, **Build Command** to `npm install && npx prisma generate && npm run build`, **Start Command** to `npm run start:prod`. Add env vars (e.g. `DATABASE_URL`, `JWT_SECRET`). Deploy and note the URL (e.g. `https://your-admin.onrender.com`).
2. Push the repo to **GitHub** (repo root must contain `customer-backend`, `admin-backend`, and `packages`).
3. Go to [render.com](https://render.com) → **New** → **Web Service** → connect the repo.
4. **Settings:**
   - **Root Directory:** `customer-backend`
   - **Build Command:**  
     `cd ../packages/contracts && npm install && npm run build && cd ../customer-backend && npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free
5. **Environment:** Add `PLATFORM_API_URL` = your Admin Backend URL from step 1, `JWT_SECRET` (same as Admin Backend). Optionally `CORS_ORIGIN`. Do not set `PORT`.
6. Deploy. Customer Backend API base URL: `https://<your-service>.onrender.com`.  
   **Note:** Free instances spin down after ~15 min idle; first request after that may take ~1 min (cold start).

### Option 2: Railway (free)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select repo.
2. **Settings:** Set **Root Directory** to `customer-backend`.
3. **Build:** If the default build fails (e.g. missing contracts), set **Build Command** to:  
   `cd ../packages/contracts && npm install && npm run build && cd ../customer-backend && npm install && npm run build`  
   **Start Command:** `npm run start:prod`
4. **Variables:** Add `PLATFORM_API_URL`, `JWT_SECRET`. Optionally `CORS_ORIGIN`.
5. **Settings** → **Generate Domain** to get the public URL.

### Option 3: Fly.io (free)

1. Install [flyctl](https://fly.io/docs/hack/getting-started/).
2. From your machine, in the **repo root** (so `customer-backend` and `packages` exist), run:
   ```bash
   cd customer-backend
   fly launch
   ```
   When prompted, do not add a database.
3. Set secrets and deploy:
   ```bash
   fly secrets set PLATFORM_API_URL=https://your-admin-backend-url.com
   fly secrets set JWT_SECRET=your-jwt-secret
   fly deploy
   ```
4. API base URL: `https://<app-name>.fly.dev`.

### Deployment checklist

| Item | Notes |
|------|--------|
| Admin Backend live | Deploy admin-backend first; use its public URL for `PLATFORM_API_URL`. |
| `PLATFORM_API_URL` | Must be the **public** Admin Backend URL (e.g. `https://...`). No trailing slash. |
| `JWT_SECRET` | Must match Admin Backend exactly. |
| Build contracts first | Use the two-step build command so `@loyalty/contracts` is built before customer-backend. |
| CORS | Set `CORS_ORIGIN` if a web app on another domain will call the API. |

### After deploy

- **Health:** Open `https://<your-customer-backend-url>/` in a browser. Calling an endpoint (e.g. `POST /api/auth/token` with `X-API-Key`) confirms the service is up.
- **Example:**  
  `GET https://<your-customer-backend>.onrender.com/api/members/levels`  
  Header: `Authorization: Bearer <token>`.  
  Response: `{ "status": { "success": true, "message": "success" }, "data": [ ... ] }`.
