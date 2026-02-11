# Loyalty Platform – Architecture

## API design: separate admin vs customer backends

The platform uses **two backends** so that:

- **Admin Backend** is the source of truth: database, business logic, and full APIs for the admin portal and internal use.
- **Customer Backend** exposes only customer-facing APIs (member profile, levels, location by zip) and **proxies** to the Admin Backend. It does not hold business logic or a database.

This gives:

- **Clear audience split**: admin (staff) vs customer (members, apps).
- **Security**: admin APIs are not exposed to the public; customer backend can sit in a different network zone.
- **Scaling**: you can scale the customer API independently (e.g. more traffic from the customer website).
- **Single source of truth**: all logic and data live in the Admin Backend; the Customer Backend stays a thin proxy layer.

---

## Services overview

| Service            | Role                                                                 | Consumes                    |
|--------------------|----------------------------------------------------------------------|-----------------------------|
| **Admin Backend**  | Full platform API, DB (Prisma/SQLite), auth, members, points, etc.   | —                           |
| **Customer Backend** | Customer-facing API only; proxies to Admin Backend                | Admin Backend               |
| **Admin Portal**   | React SPA for staff (dashboard, members, rewards, campaigns)          | Admin Backend               |
| **Customer website / app** | Member-facing UI (profile, points, address)                   | Customer Backend           |

---

## Shared contracts

To keep API shapes and types in sync between Admin and Customer backends:

- **`packages/contracts`** – shared TypeScript types and API contracts (e.g. `LocationByZipResponse`, `MemberProfile`, `TokenResponse`).
- **Usage**: both backends depend on `@loyalty/contracts`. Admin Backend implements APIs that match these types; Customer Backend uses them when proxying and when typing responses.

After changing a shared type:

1. Update `packages/contracts/src/index.ts`.
2. Run `npm run build` in `packages/contracts`.
3. Ensure Admin Backend and Customer Backend still build and their responses match the contracts.

---

## Auth and audience

- **Admin Backend**
  - **Audience**: staff (admin portal, internal tools).
  - **Auth**: JWT from `POST /api/auth/login` (email/password) or `POST /api/auth/token` (API key). Same JWT is used for all admin APIs.
  - **Guards**: `AuthGuard('jwt')` on admin routes; JWT must be valid and (if you add roles) have the right permissions.

- **Customer Backend**
  - **Audience**: customer website / app (members or anonymous).
  - **Auth**: Same JWT as the platform (e.g. issued by Admin Backend via login or API key). Customer Backend forwards the `Authorization` header to the Admin Backend when proxying.
  - **Important**: Do not use admin-only tokens for customer-facing flows. In the future, if you introduce a separate “member JWT” (e.g. after member login), customer routes should accept only that and never admin tokens.

- **Start order**: You can start Admin Backend and Customer Backend in any order. Customer Backend does not call Admin Backend at startup; it only proxies when a request arrives. If Admin Backend is down, proxied requests return 502 until Admin Backend is up.

---

## Where business logic lives

- **All business logic and data access**: in **Admin Backend** (member service, points, location, auth, etc.).
- **Customer Backend**: only HTTP client + proxy + (optional) request/response shaping. No duplicate rules or DB access.

This keeps a single source of truth and avoids drift between admin and customer behaviour.
