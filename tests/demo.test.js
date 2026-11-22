import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { demo } from '../assets/data.js';

const root = new URL('../', import.meta.url);
const index = fs.readFileSync(new URL('index.html', root), 'utf8');
const app = fs.readFileSync(new URL('assets/app.js', root), 'utf8');

test('demo data has a complete shape', () => {
  assert.ok(demo.rows.length >= 5);
  assert.ok(demo.tableHead.length >= 4);
  assert.equal(demo.rows.every((row) => row.length === demo.tableHead.length), true);
  assert.equal(demo.workflow.length, 3);
  assert.equal(demo.actions.length, 4);
  assert.equal(demo.strip.length, 4);
});

test('placeholders and forbidden content are absent', () => {
  assert.doesNotMatch(index, /__[A-Z_]+__/);
  assert.doesNotMatch(index + app, /whatsapp/i);
  assert.doesNotMatch(index + app, /claude|anthropic/i);
  assert.doesNotMatch(index + app, /api[_-]?key|password|card number/i);
});

test('sponsor and contact details are present', () => {
  assert.match(index, /Sponsor OmegaAPI/);
  assert.match(index, /10 monthly sponsors/);
  assert.match(index, /\$5 to \$250/);
  assert.match(index, /https:\/\/github\.com\/sponsors\/omegaapi-india\?interval=monthly/);
  assert.match(index, /info@omegaapi\.com/);
  assert.match(index, /https:\/\/t\.me\/Omegaapiofficial/);
});

test('salon theme art is local and present', () => {
  const html = fs.readFileSync(new URL('index.html', root), 'utf8');
  assert.match(html, /class="theme-salon"/);
  assert.match(html, /assets\/img\/hero\.svg/);
  assert.match(html, /assets\/img\/flow\.svg/);
  assert.ok(fs.existsSync(new URL('assets/theme.css', root)));
  assert.ok(fs.existsSync(new URL('assets/img/hero.svg', root)));
  assert.ok(fs.existsSync(new URL('assets/img/flow.svg', root)));
});

test('category layout is distinct', () => {
  const html = fs.readFileSync(new URL('index.html', root), 'utf8');
  const css = fs.readFileSync(new URL('assets/theme.css', root), 'utf8');
  const app = fs.readFileSync(new URL('assets/app.js', root), 'utf8');
  assert.ok(html.includes("SALON DEMO · SAMPLE TEAM · NO CLIENT DETAILS"));
  assert.ok(css.includes('LAYOUT: salon'));
  assert.match(app, /data-label/);
});

test('backend API and D1 binding are wired', () => {
  const apiDir = new URL('functions/api/', root);
  for (const name of ['seed.js', 'store.js', 'state.js', 'action.js', 'records.js', 'reset.js']) {
    assert.ok(fs.existsSync(new URL(name, apiDir)), name + ' is missing');
  }
  const sql = fs.readFileSync(new URL('migrations/0001_init.sql', root), 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS config/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS records/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS activity/);
  assert.ok(sql.includes("SalonIQ"));
  const toml = fs.readFileSync(new URL('wrangler.toml', root), 'utf8');
  assert.match(toml, /\[\[d1_databases\]\]/);
  assert.match(toml, /binding = "DB"/);
  assert.match(toml, /database_name = "omegaapi-demos"/);
});

test('frontend reads and writes through the API', () => {
  const script = fs.readFileSync(new URL('assets/app.js', root), 'utf8');
  const markup = fs.readFileSync(new URL('index.html', root), 'utf8');
  assert.match(script, /api\('\/api\/state'\)/);
  assert.match(script, /fetch\(path, options\)/);
  assert.doesNotMatch(script, /localStorage/);
  assert.match(markup, /id="add-sample"/);
  assert.match(markup, /id="backend-status"/);
  assert.doesNotMatch(markup, /stored in this browser only/i);
});
