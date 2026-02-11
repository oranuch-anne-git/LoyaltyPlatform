# @loyalty/contracts

Shared API contracts and TypeScript types for the Loyalty Platform. Used by **admin-backend** and **customer-backend** so request/response shapes stay in sync.

## Contents

- **Auth**: `TokenResponse`
- **Location**: `LocationItem`, `SubdistrictItem`, `LocationByZipResponse` (Thailand province/district/subdistrict by zip)
- **Member**: `MemberProfile`, `MemberAddress`, `MemberLevelSummary`
- **API**: `ApiErrorBody` (error response shape)

## Usage

Both backends depend on this package:

```json
"dependencies": {
  "@loyalty/contracts": "file:../packages/contracts"
}
```

```ts
import type { LocationByZipResponse, LocationItem } from '@loyalty/contracts';
```

## Updating

1. Edit `src/index.ts`.
2. From this folder: `npm run build`.
3. Admin and customer backends will use the new types on next install/build. If you changed a response shape, ensure both backends still comply.
