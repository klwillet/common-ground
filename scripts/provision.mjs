#!/usr/bin/env node
/**
 * One-shot Supabase setup for Common Ground.
 *
 *   node scripts/provision.mjs --site https://<you>.github.io/common-ground/
 *
 * Uses your Supabase personal access token (from `supabase login`, or the
 * SUPABASE_ACCESS_TOKEN env var) to:
 *   1. find or create a project named "common-ground"
 *   2. apply supabase/schema.sql (tables, triggers, RLS policies)
 *   3. configure auth (email+password, no email confirmation, site URL)
 *   4. create the demo members via the Admin API
 *   5. apply supabase/seed.sql (issues, tasks, comments)
 *   6. write config.js with the public URL + anon key
 * Re-running is safe.
 */
import { writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.supabase.com/v1';
const PROJECT_NAME = process.env.PROJECT_NAME || 'common-ground';
const REGION = process.env.SUPABASE_REGION || 'us-east-1';
const DEMO_PASSWORD = 'community123';
const DEMO_MEMBERS = [
  ['Jane Alvarez', 'jane@example.com'],
  ['John Okafor', 'john@example.com'],
  ['Priya Raman', 'priya@example.com'],
  ['Marcus Lee', 'marcus@example.com'],
  ['Sofia Rossi', 'sofia@example.com'],
  ['Ben Carter', 'ben@example.com'],
  ['Aisha Mohammed', 'aisha@example.com'],
  ['Tom Whitaker', 'tom@example.com'],
];

const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const SITE_URL = argVal('--site') || process.env.SITE_URL || 'http://localhost:8080/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log('•', ...m);

function getToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN.trim();
  const file = join(homedir(), '.supabase', 'access-token');
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  try {
    let v = execFileSync('security', ['find-generic-password', '-s', 'Supabase CLI', '-w'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (v.startsWith('go-keyring-base64:')) v = Buffer.from(v.slice('go-keyring-base64:'.length), 'base64').toString();
    if (v) return v;
  } catch {
    /* not in keychain */
  }
  throw new Error('No Supabase access token found. Run `supabase login` first (or set SUPABASE_ACCESS_TOKEN).');
}

const TOKEN = getToken();

async function mgmt(method, path, body, { okStatuses = [] } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok && !okStatuses.includes(res.status)) {
    const err = new Error(`${method} ${path} → ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function retry(label, fn, tries = 20, delay = 6000) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= tries) throw err;
      log(`${label} not ready yet (${err.message.slice(0, 120)}), retrying…`);
      await sleep(delay);
    }
  }
}

async function main() {
  // 1. Project
  const projects = await mgmt('GET', '/projects');
  let project = projects.find((p) => p.name === PROJECT_NAME && !String(p.status).includes('PAUSE'));
  if (project) {
    log(`Using existing project ${project.name} (${project.id})`);
  } else {
    const orgs = await mgmt('GET', '/organizations');
    if (!orgs.length) throw new Error('Your Supabase account has no organization. Create one at supabase.com/dashboard.');
    const org = orgs.find((o) => o.id === process.env.SUPABASE_ORG) || orgs[0];
    log(`Creating project "${PROJECT_NAME}" in org "${org.name}" (${REGION})…`);
    project = await mgmt('POST', '/projects', {
      name: PROJECT_NAME,
      organization_id: org.id,
      region: REGION,
      db_pass: randomBytes(24).toString('base64url'),
    });
  }
  const ref = project.id;

  log('Waiting for the project to become healthy (this can take 1–3 minutes)…');
  for (let i = 0; ; i++) {
    const p = await mgmt('GET', `/projects/${ref}`);
    if (p.status === 'ACTIVE_HEALTHY') break;
    if (i > 60) throw new Error(`Project still ${p.status} after 10 minutes.`);
    await sleep(10000);
  }

  const query = (sql) => mgmt('POST', `/projects/${ref}/database/query`, { query: sql });

  // 2. Schema
  log('Applying schema + row-level security policies…');
  await retry('Database', () => query(readFileSync(join(ROOT, 'supabase', 'schema.sql'), 'utf8')));

  // 3. Auth config
  log(`Configuring auth (site URL ${SITE_URL})…`);
  const origin = new URL(SITE_URL).origin;
  await retry('Auth config', () =>
    mgmt('PATCH', `/projects/${ref}/config/auth`, {
      site_url: SITE_URL,
      uri_allow_list: [SITE_URL, `${origin}/**`, 'http://localhost:8080/**'].join(','),
      external_email_enabled: true,
      mailer_autoconfirm: true,
      disable_signup: false,
      password_min_length: 8,
    })
  );

  // 4. Keys
  const keys = await retry('API keys', () => mgmt('GET', `/projects/${ref}/api-keys?reveal=true`));
  const anon = keys.find((k) => k.name === 'anon')?.api_key;
  const service = keys.find((k) => k.name === 'service_role')?.api_key;
  if (!anon || !service) throw new Error('Could not read the anon/service_role keys for this project.');
  const url = `https://${ref}.supabase.co`;

  // 5. Demo members
  log('Creating demo members…');
  for (const [name, email] of DEMO_MEMBERS) {
    await retry(`User ${email}`, async () => {
      const res = await fetch(`${url}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { name } }),
      });
      if (res.ok) return;
      const body = await res.text();
      if (res.status === 422 || /already/i.test(body)) return; // exists
      throw new Error(`${res.status} ${body}`);
    }, 10, 5000);
  }

  // 6. Seed content
  log('Seeding issues, tasks and comments…');
  await query(readFileSync(join(ROOT, 'supabase', 'seed.sql'), 'utf8'));

  // 7. Client config (the anon key is public by design; RLS protects the data)
  await writeFile(
    join(ROOT, 'config.js'),
    `// Public Supabase settings. The anon key is safe to ship to browsers:\n// all data access is enforced by row-level security (see supabase/schema.sql).\nexport const SUPABASE_URL = '${url}';\nexport const SUPABASE_ANON_KEY = '${anon}';\n`
  );
  log(`Wrote config.js for ${url}`);
  console.log('\n✅ Supabase is ready.');
}

main().catch((err) => {
  console.error('\n✖', err.message);
  process.exit(1);
});
