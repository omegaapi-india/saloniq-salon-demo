import { APP } from './seed.js';
import { contextFor, json, loadState } from './store.js';

export async function onRequestPost(context) {
  const ctx = await contextFor(context);
  try {
    const body = await context.request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return json({ error: 'Invalid record id' }, 400, context, ctx.ws);
    const result = await ctx.db.prepare('UPDATE records SET deleted_at = NULL WHERE app = ? AND workspace_id = ? AND id = ? AND deleted_at IS NOT NULL')
      .bind(APP, ctx.ws, id).run();
    if (!result.success) return json({ error: 'Restore failed' }, 500, context, ctx.ws);
    await ctx.db.prepare('INSERT INTO activity (app, workspace_id, text, kind, record_id) VALUES (?, ?, ?, ?, ?)')
      .bind(APP, ctx.ws, 'You restored a simulated sample row.', 'record.restore', id).run();
    return json(await loadState(ctx.db, ctx.ws), 200, context, ctx.ws);
  } catch {
    return json({ error: 'Invalid JSON' }, 400, context, ctx.ws);
  }
}
