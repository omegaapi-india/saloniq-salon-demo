import { APP } from './seed.js';
import { contextFor, getConfig, json, loadState } from './store.js';

export async function onRequestPost(context) {
  if (Number(context.request.headers.get('content-length') || 0) > 2048) {
    return json({ error: 'Request too large' }, 413);
  }
  try {
    const body = await context.request.json();
    const index = Number(body.action);
    if (!Number.isInteger(index) || index < 0) return json({ error: 'Invalid action' }, 400);
    const ctx = await contextFor(context);
    const config = await getConfig(ctx.db);
    const actions = config.actions || [];
    if (index >= actions.length) return json({ error: 'Unknown action' }, 400);
    await ctx.db.prepare('INSERT INTO activity (app, workspace_id, text, kind) VALUES (?, ?, ?, ?)')
      .bind(APP, ctx.ws, 'You' + actions[index][1], 'action').run();
    return json(await loadState(ctx.db, ctx.ws), 200, context, ctx.ws);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
}
