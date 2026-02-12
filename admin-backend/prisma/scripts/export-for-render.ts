/**
 * Export member levels and location data (province, district, subdistrict) from the LOCAL database
 * so you can import the same data into Render. Uses DATABASE_URL from .env (local).
 *
 * Run from repo root or admin-backend:
 *   npx ts-node prisma/scripts/export-for-render.ts
 * Or: npm run prisma:export-for-render
 *
 * Writes: prisma/data/export-for-render.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OUT_PATH = path.join(__dirname, '..', 'data', 'export-for-render.json');

async function main() {
  const [memberLevels, provinces, districts, subdistricts] = await Promise.all([
    prisma.memberLevel.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.province.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.district.findMany({ include: { province: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.subdistrict.findMany({ include: { district: { include: { province: true } } }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    memberLevels: memberLevels.map((l) => ({
      code: l.code,
      name: l.name,
      sortOrder: l.sortOrder,
      privilegeTh: l.privilegeTh ?? undefined,
      privilegeEn: l.privilegeEn ?? undefined,
    })),
    provinces: provinces.map((p) => ({
      code: p.code,
      nameTh: p.nameTh,
      nameEn: p.nameEn ?? undefined,
      sortOrder: p.sortOrder,
    })),
    districts: districts.map((d) => ({
      provinceCode: d.province.code,
      code: d.code,
      nameTh: d.nameTh,
      nameEn: d.nameEn ?? undefined,
      sortOrder: d.sortOrder,
    })),
    subdistricts: subdistricts.map((s) => ({
      provinceCode: s.district.province.code,
      districtCode: s.district.code,
      code: s.code,
      nameTh: s.nameTh,
      nameEn: s.nameEn ?? undefined,
      zipCode: s.zipCode ?? undefined,
      sortOrder: s.sortOrder,
    })),
  };

  const dir = path.dirname(OUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log('Exported to', OUT_PATH);
  console.log('  Member levels:', payload.memberLevels.length);
  console.log('  Provinces:', payload.provinces.length);
  console.log('  Districts:', payload.districts.length);
  console.log('  Subdistricts:', payload.subdistricts.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
