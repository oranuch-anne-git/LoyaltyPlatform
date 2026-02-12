/**
 * Load full Thailand geography data (provinces, districts, subdistricts with zip codes)
 * from https://github.com/thailand-geography-data/thailand-geography-json
 *
 * Run: npx ts-node prisma/seed-thailand.ts
 * or:  npm run prisma:seed-thailand
 *
 * Uses prisma/data/thailand-geography.json if present; otherwise fetches from URL.
 * To download the data file: npm run prisma:download-thailand
 *
 * When targeting Render (Postgres): set DATABASE_URL to Render External URL with ?sslmode=require.
 * Schema must be provider = "postgresql" in prisma/schema.prisma. Run "npx prisma generate" first.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const GEOGRAPHY_JSON_URL =
  'https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json';
const LOCAL_DATA_PATH = path.join(__dirname, 'data', 'thailand-geography.json');

type GeoRow = {
  provinceCode: number;
  provinceNameEn: string;
  provinceNameTh: string;
  districtCode: number;
  districtNameEn: string;
  districtNameTh: string;
  subdistrictCode: number;
  subdistrictNameEn: string;
  subdistrictNameTh: string;
  postalCode: number;
};

const prisma = new PrismaClient();

async function loadGeography(): Promise<GeoRow[]> {
  if (fs.existsSync(LOCAL_DATA_PATH)) {
    console.log('Loading Thailand geography from', LOCAL_DATA_PATH);
    const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf8');
    const rows = JSON.parse(raw) as GeoRow[];
    console.log('Loaded', rows.length, 'rows from local file');
    return rows;
  }
  console.log('Fetching Thailand geography from', GEOGRAPHY_JSON_URL);
  const res = await fetch(GEOGRAPHY_JSON_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const rows: GeoRow[] = await res.json();
  console.log('Loaded', rows.length, 'rows from URL');
  return rows;
}

async function main() {
  const rows = await loadGeography();

  // Clear existing (order matters: subdistrict -> district -> province)
  await prisma.subdistrict.deleteMany({});
  await prisma.district.deleteMany({});
  await prisma.province.deleteMany({});

  // Build unique provinces and districts (by code)
  const provinceByCode = new Map<string, { code: string; nameTh: string; nameEn: string }>();
  const districtByKey = new Map<
    string,
    { provinceCode: string; code: string; nameTh: string; nameEn: string }
  >();
  for (const r of rows) {
    const pCode = String(r.provinceCode);
    if (!provinceByCode.has(pCode)) {
      provinceByCode.set(pCode, {
        code: pCode,
        nameTh: r.provinceNameTh,
        nameEn: r.provinceNameEn ?? undefined,
      });
    }
    const dKey = `${pCode}-${r.districtCode}`;
    if (!districtByKey.has(dKey)) {
      districtByKey.set(dKey, {
        provinceCode: pCode,
        code: String(r.districtCode),
        nameTh: r.districtNameTh,
        nameEn: r.districtNameEn ?? undefined,
      });
    }
  }

  // Insert provinces and keep code -> id
  const provinceIdByCode = new Map<string, string>();
  let sortOrder = 0;
  for (const [code, p] of provinceByCode) {
    const created = await prisma.province.create({
      data: {
        code: p.code,
        nameTh: p.nameTh,
        nameEn: p.nameEn || null,
        sortOrder: sortOrder++,
      },
    });
    provinceIdByCode.set(code, created.id);
  }
  console.log('Inserted', provinceIdByCode.size, 'provinces');

  // Insert districts and keep (provinceCode, districtCode) -> id
  const districtIdByKey = new Map<string, string>();
  for (const [, d] of districtByKey) {
    const provinceId = provinceIdByCode.get(d.provinceCode);
    if (!provinceId) continue;
    const created = await prisma.district.create({
      data: {
        provinceId,
        code: d.code,
        nameTh: d.nameTh,
        nameEn: d.nameEn || null,
        sortOrder: 0,
      },
    });
    districtIdByKey.set(`${d.provinceCode}-${d.code}`, created.id);
  }
  console.log('Inserted', districtIdByKey.size, 'districts');

  // Insert subdistricts
  let subCount = 0;
  for (const r of rows) {
    const dKey = `${r.provinceCode}-${r.districtCode}`;
    const districtId = districtIdByKey.get(dKey);
    if (!districtId) continue;
    const zipCode = String(r.postalCode).padStart(5, '0');
    await prisma.subdistrict.create({
      data: {
        districtId,
        code: String(r.subdistrictCode),
        nameTh: r.subdistrictNameTh,
        nameEn: r.subdistrictNameEn ?? null,
        zipCode,
        sortOrder: 0,
      },
    });
    subCount++;
  }
  console.log('Inserted', subCount, 'subdistricts');
  console.log('Thailand geography seed done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
