import { APP } from './seed.js';
import { json, loadState } from './store.js';

export async function onRequestPost({ env }) {
  const db = env.DB;
  const count = await db.prepare('SELECT COUNT(*) AS n FROM records WHERE app = ?').bind(APP).all();
  const first = await db.prepare('SELECT cells FROM records WHERE app = ? ORDER BY position, id LIMIT 1').bind(APP).all();
  if (!first.results.length) return json({ error: 'Seed data is missing' }, 409);
  const sampleNo = Number(count.results[0]?.n || 0) + 1;
  const cells = JSON.parse(first.results[0].cells);
  cells[0] = String(cells[0]).replace(/\s*\(sample \d+\)$/, '') + ' (sample ' + sampleNo + ')';
  await db.batch([
    db.prepare('INSERT INTO records (app, position, cells) VALUES (?, ?, ?)').bind(APP, sampleNo, JSON.stringify(cells)),
    db.prepare('INSERT INTO activity (app, text) VALUES (?, ?)').bind(APP, 'You added a simulated sample row.')
  ]);
  return json(await loadState(db));
}

export async function onRequestDelete(context) {
  const id = Number(new URL(context.request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Invalid record id' }, 400);
  const result = await context.env.DB.prepare('DELETE FROM records WHERE app = ? AND id = ?').bind(APP, id).run();
  if (!result.success) return json({ error: 'Delete failed' }, 500);
  await context.env.DB.prepare('INSERT INTO activity (app, text) VALUES (?, ?)')
    .bind(APP, 'You removed a simulated sample row.').run();
  return json(await loadState(context.env.DB));
}
