/**
 * Once-from-PC: load full Thailand province/district/subdistrict data into the
 * database (e.g. Render). Runs prisma generate then seed-thailand.
 *
 * Easiest: put Render External URL in admin-backend/.env.render (one line), then:
 *   cd admin-backend && npm run prisma:load-locations-to-render
 *
 * Or set in terminal: DATABASE_URL=postgresql://...?sslmode=require
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.join(__dirname, '..', '..');

function resolveDatabaseUrl(): string {
  let url = process.env.DATABASE_URL?.trim() || '';
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }

  const isPostgres = url.startsWith('postgresql://') || url.startsWith('postgres://');
  if (isPostgres) return url;

  const envRenderPath = path.join(rootDir, '.env.render');
  if (fs.existsSync(envRenderPath)) {
    const content = fs.readFileSync(envRenderPath, 'utf8');
    const line = content.split(/\r?\n/).find((l) => l.trim() && !l.trim().startsWith('#'));
    if (line) {
      const match = line.trim().match(/^(?:DATABASE_URL=)?(.+)$/);
      if (match) {
        url = match[1].trim();
        if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
          url = url.slice(1, -1).trim();
        }
        if ((url.startsWith('postgresql://') || url.startsWith('postgres://')) && !url.includes('USER:PASSWORD')) {
          return url;
        }
      }
    }
  }

  return '';
}

let DATABASE_URL = resolveDatabaseUrl();

const envRenderPath = path.join(rootDir, '.env.render');
const envRenderExamplePath = path.join(rootDir, '.env.render.example');

if (!DATABASE_URL) {
  if (!fs.existsSync(envRenderPath) && fs.existsSync(envRenderExamplePath)) {
    fs.copyFileSync(envRenderExamplePath, envRenderPath);
    console.log('Created .env.render from .env.render.example');
    console.log('Edit admin-backend/.env.render: paste your Render External URL (one line).');
    console.log('From Render: Dashboard → Postgres → Connect → External URL (add ?sslmode=require if missing).');
    console.log('Then run again: npm run prisma:load-locations-to-render');
    process.exit(0);
  }
  console.error('No PostgreSQL URL found.');
  if (fs.existsSync(envRenderPath)) {
    console.error('Edit admin-backend/.env.render and set one line: postgresql://...?sslmode=require');
  } else {
    console.error('Option 1: Create admin-backend/.env.render with one line: postgresql://...?sslmode=require');
    console.error('Option 2: In this terminal (PowerShell): $env:DATABASE_URL="postgresql://...?sslmode=require"');
  }
  process.exit(1);
}

if (!DATABASE_URL.includes('sslmode=') && DATABASE_URL.includes('render.com')) {
  DATABASE_URL += (DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=require';
}
process.env.DATABASE_URL = DATABASE_URL;

console.log('Running prisma generate...');
execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit', cwd: rootDir });

console.log('Loading Thailand locations into DB...');
execSync('node node_modules/ts-node/dist/bin.js prisma/seed-thailand.ts', {
  stdio: 'inherit',
  env: process.env,
  cwd: rootDir,
});
console.log('Done. You can remove the seed-thailand step from the build to shorten deploy time.');
