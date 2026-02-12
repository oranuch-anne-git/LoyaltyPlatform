# Prisma data files

- **thailand-geography.json** – Full Thailand address master (see below). Used by `prisma:seed-thailand`.
- **export-for-render.json** – Created by `npm run prisma:export-for-render` in admin-backend. Contains member levels and province/district/subdistrict data exported from your local DB so you can import the same data into Render. See root README → “Making Render data the same as local”.

## Thailand geography data

This folder holds the full Thailand address master data (provinces, districts, subdistricts with postal codes) used by the seed.

## Get the data

**Option 1 – Download via script (recommended)**

From `admin-backend`:

```bash
npm run prisma:download-thailand
```

Or from project root:

```bash
node admin-backend/prisma/scripts/download-thailand-geography.js
```

This creates `thailand-geography.json` (~7,400+ rows).

**Option 2 – Seed without local file**

Run:

```bash
npm run prisma:seed-thailand
```

The seed will fetch the same JSON from the internet if `thailand-geography.json` is not present.

## Source

- [thailand-geography-data/thailand-geography-json](https://github.com/thailand-geography-data/thailand-geography-json) (MIT)
- One row per subdistrict: `provinceCode`, `provinceNameTh`, `provinceNameEn`, `districtCode`, `districtNameTh`, `districtNameEn`, `subdistrictCode`, `subdistrictNameTh`, `subdistrictNameEn`, `postalCode`

## Load into database

After the JSON file exists (or to use the online fetch):

```bash
cd admin-backend
npm run prisma:seed-thailand
```

This replaces all Province, District, and Subdistrict rows with the full Thailand dataset.
