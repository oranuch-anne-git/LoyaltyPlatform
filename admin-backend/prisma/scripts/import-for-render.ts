/**
 * Import member levels and location data from export-for-render.json into the database.
 * Set DATABASE_URL to your TARGET (e.g. Render External Database URL) to load data there.
 *
 * Run from repo root or admin-backend:
 *   DATABASE_URL="postgresql://..." npx ts-node prisma/scripts/import-for-render.ts
 * Or: npm run prisma:import-for-render
 *
 * Reads: prisma/data/export-for-render.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const IN_PATH = path.join(__dirname, '..', 'data', 'export-for-render.json');

type Payload = {
  memberLevels: Array<{ code: string; name: string; sortOrder: number; privilegeTh?: string; privilegeEn?: string }>;
  provinces: Array<{ code: string; nameTh: string; nameEn?: string; sortOrder: number }>;
  districts: Array<{ provinceCode: string; code: string; nameTh: string; nameEn?: string; sortOrder: number }>;
  subdistricts: Array<{
    provinceCode: string;
    districtCode: string;
    code: string;
    nameTh: string;
    nameEn?: string;
    zipCode?: string;
    sortOrder: number;
  }>;
};

async function main() {
  if (!fs.existsSync(IN_PATH)) {
    throw new Error('Export file not found. Run export-for-render.ts locally first: npx ts-node prisma/scripts/export-for-render.ts');
  }
  const raw = fs.readFileSync(IN_PATH, 'utf8');
  const payload: Payload = JSON.parse(raw);

  console.log('Importing from', IN_PATH);

  for (const l of payload.memberLevels) {
    await prisma.memberLevel.upsert({
      where: { code: l.code },
      create: {
        code: l.code,
        name: l.name,
        sortOrder: l.sortOrder,
        privilegeTh: l.privilegeTh ?? null,
        privilegeEn: l.privilegeEn ?? null,
      },
      update: { name: l.name, sortOrder: l.sortOrder, privilegeTh: l.privilegeTh ?? null, privilegeEn: l.privilegeEn ?? null },
    });
  }
  console.log('  Member levels:', payload.memberLevels.length);

  for (const p of payload.provinces) {
    await prisma.province.upsert({
      where: { code: p.code },
      create: { code: p.code, nameTh: p.nameTh, nameEn: p.nameEn ?? null, sortOrder: p.sortOrder },
      update: { nameTh: p.nameTh, nameEn: p.nameEn ?? null, sortOrder: p.sortOrder },
    });
  }
  console.log('  Provinces:', payload.provinces.length);

  for (const d of payload.districts) {
    const prov = await prisma.province.findUnique({ where: { code: d.provinceCode } });
    if (!prov) {
      console.warn('  Skip district', d.code, '- province', d.provinceCode, 'not found');
      continue;
    }
    await prisma.district.upsert({
      where: { provinceId_code: { provinceId: prov.id, code: d.code } },
      create: { provinceId: prov.id, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn ?? null, sortOrder: d.sortOrder },
      update: { nameTh: d.nameTh, nameEn: d.nameEn ?? null, sortOrder: d.sortOrder },
    });
  }
  console.log('  Districts:', payload.districts.length);

  for (const s of payload.subdistricts) {
    const prov = await prisma.province.findUnique({ where: { code: s.provinceCode } });
    if (!prov) {
      console.warn('  Skip subdistrict', s.code, '- province', s.provinceCode, 'not found');
      continue;
    }
    const dist = await prisma.district.findUnique({
      where: { provinceId_code: { provinceId: prov.id, code: s.districtCode } },
    });
    if (!dist) {
      console.warn('  Skip subdistrict', s.code, '- district', s.districtCode, 'not found');
      continue;
    }
    await prisma.subdistrict.upsert({
      where: { districtId_code: { districtId: dist.id, code: s.code } },
      create: {
        districtId: dist.id,
        code: s.code,
        nameTh: s.nameTh,
        nameEn: s.nameEn ?? null,
        zipCode: s.zipCode ?? null,
        sortOrder: s.sortOrder,
      },
      update: { nameTh: s.nameTh, nameEn: s.nameEn ?? null, zipCode: s.zipCode ?? null, sortOrder: s.sortOrder },
    });
  }
  console.log('  Subdistricts:', payload.subdistricts.length);
  console.log('Import done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
