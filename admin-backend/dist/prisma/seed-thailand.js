"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const client_1 = require("@prisma/client");
const GEOGRAPHY_JSON_URL = 'https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json';
const LOCAL_DATA_PATH = path.join(__dirname, 'data', 'thailand-geography.json');
const prisma = new client_1.PrismaClient();
async function loadGeography() {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
        console.log('Loading Thailand geography from', LOCAL_DATA_PATH);
        const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf8');
        const rows = JSON.parse(raw);
        console.log('Loaded', rows.length, 'rows from local file');
        return rows;
    }
    console.log('Fetching Thailand geography from', GEOGRAPHY_JSON_URL);
    const res = await fetch(GEOGRAPHY_JSON_URL);
    if (!res.ok)
        throw new Error(`Failed to fetch: ${res.status}`);
    const rows = await res.json();
    console.log('Loaded', rows.length, 'rows from URL');
    return rows;
}
async function main() {
    const rows = await loadGeography();
    await prisma.subdistrict.deleteMany({});
    await prisma.district.deleteMany({});
    await prisma.province.deleteMany({});
    const provinceByCode = new Map();
    const districtByKey = new Map();
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
    const provinceIdByCode = new Map();
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
    const districtIdByKey = new Map();
    for (const [, d] of districtByKey) {
        const provinceId = provinceIdByCode.get(d.provinceCode);
        if (!provinceId)
            continue;
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
    let subCount = 0;
    for (const r of rows) {
        const dKey = `${r.provinceCode}-${r.districtCode}`;
        const districtId = districtIdByKey.get(dKey);
        if (!districtId)
            continue;
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
//# sourceMappingURL=seed-thailand.js.map