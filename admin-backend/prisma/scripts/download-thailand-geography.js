/**
 * Download full Thailand geography JSON (provinces, districts, subdistricts, postal codes)
 * and save to prisma/data/thailand-geography.json.
 *
 * Run from repo root: node admin-backend/prisma/scripts/download-thailand-geography.js
 * Or from admin-backend: node prisma/scripts/download-thailand-geography.js
 *
 * Source: https://github.com/thailand-geography-data/thailand-geography-json (MIT)
 */

const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json';
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(DATA_DIR, 'thailand-geography.json');

async function main() {
  console.log('Downloading Thailand geography from', URL);
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Expected JSON array');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 0), 'utf8');
  console.log('Saved', data.length, 'rows to', OUT_FILE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
