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
