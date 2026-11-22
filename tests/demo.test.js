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
