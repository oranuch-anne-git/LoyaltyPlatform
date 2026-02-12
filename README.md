# Loyalty Platform

Application built from **Loyalty_Platform_Feature_Summary_EN_with_NFR.md**: modular, API-first loyalty platform with LINE OA as primary channel, Admin Portal, and NFR alignment (RBAC, audit, performance targets).

## Architecture

- **Admin Backend**: NestJS + Prisma (SQLite for dev), REST API (admin and full platform APIs). Project folder: `admin-backend/`. **Source of truth** for all business logic and data.
- **Customer Backend**: Separate NestJS API for customer-facing endpoints only; **proxies** to Admin Backend (no duplicate logic). See `customer-backend/README.md`.
- **Admin Portal**: React + Vite, SPA with dashboard, members, rewards, campaigns, audit logs. Calls Admin Backend.
- **LINE**: Webhook endpoint for follow/message (stub); ready for Rich Menu and deep links.
- **Shared contracts**: `packages/contracts` – TypeScript types and API contracts used by both backends so responses stay in sync. See [ARCHITECTURE.md](ARCHITECTURE.md) for API design, auth/audience, and where logic lives.

### Services (admin-backend modules)

| Module        | Purpose                                      |
|---------------|----------------------------------------------|
| Member        | Registration, profile, single Member ID     |
| Points        | Earn, redeem, adjust; real-time balance      |
| Rewards       | Catalog, categories, redemption              |
| Campaigns     | Discount/cashback/redemption, banners       |
| Notifications | Log for LINE/email/push                       |
| Analytics     | Dashboard KPIs, campaign performance, audit  |
| Branch        | Branch locator, branch-specific data         |
| Line Webhook  | LINE OA webhook (follow, message)            |
| Auth          | Admin JWT login, RBAC                        |
| Audit         | Log all critical actions                     |

## Build all (once)

From the repo root, install and build every project in order (contracts → admin-backend → customer-backend → admin-portal):

**Windows (double-click):**  
Double-click **`scripts\build-all.bat`** in Explorer. A console window will run the build and stay open when done (or on error).  
If you see **EPERM / rename** during admin-backend (Prisma): close any running admin-backend or Node process, then run the script again—or open a **new** Command Prompt (outside Cursor), `cd admin-backend`, run `npx prisma generate`, then `npm run build`.

**PowerShell (Windows):**
```powershell
.\scripts\build-all.ps1
```

**Bash (Linux/macOS/Git Bash):**
```bash
./scripts/build-all.sh
```

Then run each service with its own `npm run start:dev` or `npm run dev` (see Quick Start below).

## Quick Start

### Admin Backend

```bash
cd admin-backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

API: `http://localhost:3000`

### Admin Portal

```bash
cd admin-portal
npm install
npm run dev
```

Admin UI: `http://localhost:5173`

**Default admin (after seed):** `admin@loyalty.local` / `admin123`

### Customer Backend (optional)

Separate API with only **Member_GetInfo** and **Company_GetMemberLevel**. Requires Admin Backend to be running.

```bash
cd customer-backend
cp .env.example .env
# Set PLATFORM_API_URL=http://localhost:3000 and same JWT_SECRET as admin-backend
npm install
npm run start:dev
```

API: `http://localhost:3001`. Use the same JWT from platform login.

## NFR Alignment

- **Performance**: Point calculation and redemption in single transaction; dashboard and list endpoints optimized.
- **Scalability**: Stateless API; horizontal scaling and container deployment ready.
- **Security**: HTTPS (env); JWT admin auth; RBAC (roles: SUPER_ADMIN, ADMIN, OPERATOR); audit log for login and point adjustments.
- **Compliance**: PDPA consent fields on Member; audit logs for critical actions.
- **Observability**: Centralized audit; structure in place for logging and alerting.
- **Integration**: REST API; LINE webhook; optional webhooks for POS/partners.

## Environment

**Admin Backend (`.env`):**

- `DATABASE_URL` – SQLite: `file:./dev.db`
- `JWT_SECRET` – Secret for admin JWT
- `PORT` – API port (default 3000)
- `API_KEY` or `API_KEYS` – Optional. API key(s) for obtaining JWT via `POST /api/auth/token` (comma-separated for multiple).
- `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` – For LINE OA (optional)
- `CORS_ORIGIN` – Admin origin (e.g. `http://localhost:5173`)

### Render (production): services and environment variables

When you deploy on [Render](https://render.com), you typically have four services. Set these environment variables so they work together.

| Service | Type | Region | Purpose |
|--------|------|--------|---------|
| **loyalty-database** | PostgreSQL | Oregon | Database for Admin Backend. |
| **loyalty-admin-backend** | Web Service (Node) | Oregon | Admin API. |
| **loyalty-customer-backend** | Web Service (Node) | Oregon | Customer-facing API (proxies to Admin Backend). |
| **loyalty-admin-portal** | Static Site | Global | Admin UI (React). |

**loyalty-admin-backend → Environment**

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | **Internal Database URL** from **loyalty-database** (Connections → Internal Database URL). Must be the internal URL (not External). |
| `JWT_SECRET` | Strong secret string. **Must match** the value on loyalty-customer-backend. |
| `API_KEY` | Secret used for `POST /api/auth/token` (e.g. from Customer Backend or tests). |
| `CORS_ORIGIN` | Admin Portal URL, e.g. `https://loyalty-admin-portal.onrender.com` (no trailing slash). |

**loyalty-customer-backend → Environment**

| Variable | Value |
|----------|--------|
| `PLATFORM_API_URL` | Admin Backend URL, e.g. `https://loyalty-admin-backend.onrender.com` (no trailing slash). |
| `JWT_SECRET` | **Same** as on loyalty-admin-backend. |
| `CORS_ORIGIN` | Optional. Set if a web/mobile app on another domain will call this API. |
| `PORT` | Leave unset (Render sets it). |

**loyalty-admin-portal → Environment**

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | Admin Backend URL, e.g. `https://loyalty-admin-backend.onrender.com` (no trailing slash). Baked in at build time. |

**loyalty-database** – No env vars to set on the database. Copy its **Internal Database URL** into the Admin Backend’s `DATABASE_URL`.

Deploy order: **loyalty-database** → **loyalty-admin-backend** → **loyalty-customer-backend** → **loyalty-admin-portal**. See [customer-backend/README.md](customer-backend/README.md) and [admin-portal/README.md](admin-portal/README.md) for step-by-step Render setup.

#### One-time: update data to Render (from your PC)

To push data to Render **once** (no redeploy, no Shell), run from your machine with Render’s **External Database URL**. The URL must end with **`?sslmode=require`**.

**1. Get the URL**  
Render → **loyalty-database** → **Connections** → copy **External Database URL**. If it has no `?sslmode=require`, add it:  
`postgresql://user:pass@host/dbname` → `postgresql://user:pass@host/dbname?sslmode=require`

**2a. Member levels only (full privilege text)**  
In a terminal:
```bash
cd admin-backend
set DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
npm run prisma:sync-member-levels
```
(On PowerShell: `$env:DATABASE_URL="..."`. On Linux/macOS: `export DATABASE_URL="..."`.)  
Then hard refresh the Member Levels page on the portal.

**2b. Full Thailand locations (fix “No locations for this zip in DB”)**  
Load all provinces, districts, subdistricts with zip codes so address-by-zip works on Render. Run **from your PC** with Render’s External URL (Shell is not available on free tier):
```bash
cd admin-backend
set DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
npm run prisma:load-locations-to-render
```
(On PowerShell: `$env:DATABASE_URL="..."`. On Linux/macOS: `export DATABASE_URL="..."`.)  
The script replaces all province/district/subdistrict rows with the full Thailand set. Member levels are unchanged. If you don’t have `prisma/data/thailand-geography.json`, the script will fetch it from the internet (slower). See **Once from PC (locations)** below for the full checklist.

**2c. Full data (member levels + provinces / districts / subdistricts) from local**  
Export from local, then import into Render:
```bash
cd admin-backend
npm run prisma:export-for-render
set DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
npm run prisma:import-for-render
```
Use the same External URL with `?sslmode=require`. After that, Render has the same member levels and location data as your local export.

**3. Done**  
No deploy or Shell needed. Refresh the admin portal to see the updated data.

#### Member levels vs province / district / subdistrict

- **Member levels** can be updated manually in the admin portal (Member Levels page) or via the sync script from your PC.
- **Province, district, subdistrict** have **no edit UI or API**; they are reference data. They are loaded automatically on every Admin Backend deploy (seed-thailand runs in the build). Alternatively you can load once from your PC (see **2b**); then remove the seed-thailand step from the build to shorten deploy time.

#### Loading member level, province, district, subdistrict data on Render

**What’s already on Render**

- Every Admin Backend **build** runs the seed (`prisma:seed`), seed-thailand, then the Nest build. It creates:
  - **Member levels:** Yellow, Silver, Black (with sample privilege text).
  - **Provinces / districts / subdistricts:** Full Thailand set (seed-thailand runs in build).
  - Plus: roles, admin user, API key user, branches, demo members, rewards, campaigns.

So you don’t need to “copy” member levels or full Thailand locations — they’re loaded on every deploy.

**Alternative: load province / district / subdistrict from your PC (once)**

If you prefer shorter build time, load locations once from your PC with Render’s **External Database URL** (see “One-time: update data to Render” → **2b**):

```bash
cd admin-backend
set DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
npm run prisma:load-locations-to-render
```

The script replaces all province, district, and subdistrict rows with the full Thailand set. If you use this option, you can remove the seed-thailand step from the build in `admin-backend/package.json` to keep deploy time lower. The script uses `prisma/data/thailand-geography.json` if present; otherwise it fetches from the internet.

**Once from PC (locations) — simplest**

1. In Render Dashboard: Postgres → Connect → **External Database URL**. Copy it; add `?sslmode=require` at the end if missing.
2. In the repo: `cd admin-backend`, copy `.env.render.example` to `.env.render`, paste the URL as the only line (or a line starting with `postgresql://`).
3. Run: `npm run prisma:load-locations-to-render`. The script runs `prisma generate` then loads all Thailand locations.
4. Optional: remove the `seed-thailand` step from the `build` script in `admin-backend/package.json` to shorten future deploys.

Schema must use `provider = "postgresql"` in `admin-backend/prisma/schema.prisma`. If you get EPERM, close any running admin-backend or Node process and run again. Alternatively set `DATABASE_URL` in the terminal instead of using `.env.render`.

**Re-running the main seed on Render**

- To recreate or fix roles, admin user, API key user, member levels, sample locations, demo members, etc., run the regular seed in the Render Shell:
  ```bash
  cd /opt/render/project/src/admin-backend && node node_modules/ts-node/dist/bin.js prisma/seed.ts
  ```
- The seed uses **upserts**, so it’s safe to run again; it won’t duplicate member levels or the sample province/district/subdistrict rows.

**Member levels on Render still show short text (not same as local)**

**On free tier, Shell is not available.** The sync script runs automatically **during every deploy** of the Admin Backend (it’s part of the build). So the next time you deploy (or trigger a manual deploy), the full privilege text will be written to the database and the Member Levels page will show it.

1. **Trigger a new deploy** of **loyalty-admin-backend** on Render (e.g. push a small commit and let Render deploy, or use “Manual Deploy” in the dashboard).
2. Wait for the build to finish (it will run seed then sync-member-levels).
3. **Hard refresh** the Member Levels page on the deployed admin portal (Ctrl+Shift+R or Cmd+Shift+R). The full Thai/English privilege text should appear.

**If you need to fix it without redeploying** (e.g. you can’t deploy right now), run the sync from your PC using the **External** Database URL. The URL **must** end with `?sslmode=require` or the connection will fail:

```bash
cd admin-backend
set DATABASE_URL=postgresql://user:password@dpg-xxxxx-external..../dbname?sslmode=require
npm run prisma:sync-member-levels
```
On Linux/macOS: `export DATABASE_URL="..."`. Then hard refresh the portal.

**If it still doesn’t work**  
- Run `npm run prisma:verify-member-levels` with the same `DATABASE_URL` to see what’s in the DB (length of privilegeTh per level).  
- Confirm you’re opening the **deployed** admin portal URL (e.g. `https://loyalty-admin-portal.onrender.com`), not localhost.

**Making Render data the same as local (member levels + province/district/subdistrict)**

If the data on Render doesn’t match your local DB (e.g. you edited member level text or ran full Thailand seed locally), use the export/import scripts so Render gets the same data.

1. **Export from local** (uses your local `DATABASE_URL` in `admin-backend/.env`):
   ```bash
   cd admin-backend
   npm run prisma:export-for-render
   ```
   This creates `admin-backend/prisma/data/export-for-render.json` with all MemberLevel, Province, District, and Subdistrict rows.

2. **Import into Render** (uses `DATABASE_URL` you set for the target DB). From your machine you must use Render’s **External** Database URL (from loyalty-database → Connections), because the Internal URL is only reachable from Render’s network.
   ```bash
   cd admin-backend
   set DATABASE_URL=postgresql://user:pass@dpg-xxxxx-external.oregon-postgres.render.com/dbname?sslmode=require
   npm run prisma:import-for-render
   ```
   (On Linux/macOS use `export DATABASE_URL=...`.) Replace the URL with the **External Database URL** from your Render PostgreSQL service. The script upserts member levels and location data into that database, so Render will have the same content as your export.

3. **Commit the export file (optional)**  
   If you want the same data to be applied on every deploy or by others, commit `prisma/data/export-for-render.json` and run the import step when needed (or add it to your deploy process).

## API Reference

Base URL: `http://localhost:3000`. All `/api/*` and `/webhook/*` paths below are relative to base.

### How to use the API

1. **Get a JWT** – Either login (email/password) or use an API key. **Run one of these commands** (do not paste the word "POST" alone):

   **PowerShell (Windows):**
   ```powershell
   # Email / password
   Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@loyalty.local","password":"admin123"}'

   # API key (set API_KEY in admin-backend .env and run seed)
   Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/token" -Headers @{ "X-API-Key" = "Y1768IUTGX4K2M9PQ" }
   ```

   **Bash / curl:**
   ```bash
   # Email / password
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@loyalty.local\",\"password\":\"admin123\"}"

   # API key
   curl -X POST http://localhost:3000/api/auth/token -H "X-API-Key: Y1768IUTGX4K2M9PQ"
   ```

   Response: `{ "access_token": "<jwt>", "user": { ... } }`. Use `access_token` as the Bearer token.

2. **Call protected endpoints** – Send the token in the `Authorization` header:
   ```bash
   curl -X GET http://localhost:3000/api/members/levels \
     -H "Authorization: Bearer <paste_access_token_here>"
   ```

3. **From code** – Set `Authorization: Bearer <token>` on every request to `/api/*` (except login). The Admin Portal does this automatically after login.

### Tools to test the API

**Postman** – Get JWT with API key:
- Method: **POST**, URL: `http://localhost:3000/api/auth/token`
- Headers: `X-API-Key` = `Y1768IUTGX4K2M9PQ` (or your `API_KEY` from .env)
- (No body.) Send request; use the returned `access_token` as Bearer token for other APIs.

  Curl equivalent (Bash/Git Bash):
  ```bash
  curl --location --request POST 'http://localhost:3000/api/auth/token' \
  --header 'X-API-Key: Y1768IUTGX4K2M9PQ'
  ```

| Tool | Description |
|------|-------------|
| **[Postman](https://www.postman.com/downloads/)** | Desktop/app: create requests, save env (base URL, JWT), organize collections. Good for teams and sharing. |
| **[Insomnia](https://insomnia.rest/download)** | Lightweight REST client; env variables, auth helpers (Bearer token). |
| **VS Code: [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)** | In-editor REST client; simple collections and auth. |
| **VS Code: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)** | Send requests from `.http` files in the repo (see below). |
| **curl / PowerShell** | CLI: use the examples in "How to use the API" above. |

The repo includes **`api-tests.http`** (root folder) for VS Code REST Client: open it, set `@token` after getting a JWT, then use "Send Request" on any block.

**If you get "Could not send request":**
1. **Start the backend first** – In a terminal: `cd admin-backend`, then `npm run start:dev`. Wait until you see *"Admin Backend API running at http://localhost:3000"*. Then try the .http file again.
2. **Check from terminal** – In a **new** terminal run:  
   `Invoke-RestMethod -Uri "http://localhost:3000/api/auth/token" -Method POST -Headers @{ "X-API-Key" = "Y1768IUTGX4K2M9PQ" }`  
   If this fails (e.g. "connection refused"), the backend is not running. If it works, the API is fine; the issue is with REST Client (try Postman or Thunder Client instead).
3. **REST Client extension** – Install "REST Client" (humao.rest-client) in VS Code. Click the **"Send Request"** link that appears **above** each `###` block (not the block text itself).
4. **Use Postman** – Create a POST request to `http://localhost:3000/api/auth/token` with header `X-API-Key: Y1768IUTGX4K2M9PQ`; see "Postman" above.

**Quick start with any GUI tool:** Set base URL to `http://localhost:3000`, call `POST /api/auth/login` or `POST /api/auth/token` (with `X-API-Key`), then set **Authorization → Bearer Token** to the returned `access_token` for all other requests.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Admin login. Body: `{ "email", "password" }`. Returns `{ "access_token", "user" }`. |
| POST | /api/auth/token | No | Get JWT with API key. Header `X-API-Key: <key>` or body `{ "apiKey": "<key>" }`. Returns same as login. Configure `API_KEY` or `API_KEYS` in .env; run seed for API key user. |
| POST | /api/auth/me | JWT | Current admin user. |

### Member

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/members | JWT | List members. Query: `page`, `limit`, `search`. Returns `{ items, total, page, limit }`. |
| GET | /api/members/levels | JWT | **Company_GetMemberLevel** – list member levels (Yellow, Silver, Black) with benefit fields. Returns array ordered by `sortOrder`. |
| GET | /api/members/get-info/:id | JWT | **Member_GetInfo** – full member (profile, address, pointLedgers, redemptions, transactions). `:id` = internal UUID. |
| GET | /api/members/by-id/:memberId | JWT | Get member by business id `memberId` (e.g. DEMO001). |
| GET | /api/members/:id | JWT | Get member by internal UUID (same payload as get-info). |
| POST | /api/members | JWT | Create member. Body: profile + address (name, surname, nationalType, citizenId, passport, sex, birthdate, mobile, email, addr_*). |
| PATCH | /api/members/:id | JWT | Update member profile/address. |

### Points

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/points/earn | JWT | Earn points. Body: `memberId`, `amount`, `type`, etc. |
| POST | /api/points/redeem | JWT | Redeem points. |
| POST | /api/points/adjust | JWT | Manual point adjustment (admin). Body: `memberId`, `points`, `reason?`. |
| GET | /api/points/balance/:memberId | JWT | Point balance by memberId. |
| GET | /api/points/ledger/:memberId | JWT | Point ledger for member. |
| GET | /api/points/transactions/:memberId | JWT | Transactions for member. |

### Rewards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/rewards | JWT | Reward catalog. |
| GET | /api/rewards/:id | JWT | Reward by id. |
| POST | /api/rewards | JWT | Create reward. |
| PATCH | /api/rewards/:id | JWT | Update reward. |
| POST | /api/rewards/redeem | JWT | Redeem reward. |

### Campaigns

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/campaigns | JWT | List campaigns. |
| GET | /api/campaigns/:id | JWT | Campaign by id. |
| GET | /api/campaigns/banners | JWT | List banners. |
| POST | /api/campaigns | JWT | Create campaign. |
| PATCH | /api/campaigns/:id | JWT | Update campaign. |
| POST | /api/campaigns/banners | JWT | Create banner. |

### Branches

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/branches | JWT | List branches. |
| GET | /api/branches/:id | JWT | Branch by id. |
| POST | /api/branches | JWT | Create branch. |

### Analytics & Audit

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/analytics/dashboard | JWT | Dashboard KPIs. |
| GET | /api/analytics/campaigns | JWT | Campaign performance. |
| GET | /api/analytics/audit-logs | JWT | Audit logs. |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/notifications/logs | JWT | Notification send logs. |

### Webhook (no auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /webhook/line | No | LINE webhook verify. |
| POST | /webhook/line | No | LINE webhook (follow, message). |
