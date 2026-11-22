import { APP } from './seed.js';
import { contextFor, json, loadState } from './store.js';

export async function onRequestPost(context) {
  const ctx = await contextFor(context);
  const db = ctx.db;
  const count = await db.prepare('SELECT COUNT(*) AS n FROM records WHERE app = ? AND workspace_id = ? AND deleted_at IS NULL').bind(APP, ctx.ws).all();
  const first = await db.prepare('SELECT cells FROM records WHERE app = ? AND workspace_id = ? AND deleted_at IS NULL ORDER BY position, id LIMIT 1').bind(APP, ctx.ws).all();
  if (!first.results.length) return json({ error: 'Seed data is missing' }, 409, context, ctx.ws);
  const sampleNo = Number(count.results[0]?.n || 0) + 1;
  const cells = JSON.parse(first.results[0].cells);
  cells[0] = String(cells[0]).replace(/\s*\(sample \d+\)$/, '') + ' (sample ' + sampleNo + ')';
  const inserted = await db.prepare('INSERT INTO records (app, workspace_id, position, cells) VALUES (?, ?, ?, ?)')
    .bind(APP, ctx.ws, sampleNo, JSON.stringify(cells)).run();
  const recordId = inserted.meta?.last_row_id || inserted.last_row_id || null;
  await db.prepare('INSERT INTO activity (app, workspace_id, text, kind, record_id) VALUES (?, ?, ?, ?, ?)')
    .bind(APP, ctx.ws, 'You added a simulated sample row.', 'record.add', recordId).run();
  return json(await loadState(db, ctx.ws), 200, context, ctx.ws);
}

export async function onRequestDelete(context) {
  const ctx = await contextFor(context);
  const id = Number(new URL(context.request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Invalid record id' }, 400, context, ctx.ws);
  const result = await ctx.db.prepare("UPDATE records SET deleted_at = datetime('now') WHERE app = ? AND workspace_id = ? AND id = ? AND deleted_at IS NULL")
    .bind(APP, ctx.ws, id).run();
  if (!result.success) return json({ error: 'Delete failed' }, 500, context, ctx.ws);
  await ctx.db.prepare('INSERT INTO activity (app, workspace_id, text, kind, record_id) VALUES (?, ?, ?, ?, ?)')
    .bind(APP, ctx.ws, 'You soft-deleted a simulated sample row.', 'record.delete', id).run();
  return json(await loadState(ctx.db, ctx.ws), 200, context, ctx.ws);
}
