import { APP, ROWS } from './seed.js';
import { contextFor, json, loadState } from './store.js';

export async function onRequestPost(context) {
  const ctx = await contextFor(context);
  const statements = [
    ctx.db.prepare('DELETE FROM activity WHERE app = ? AND workspace_id = ?').bind(APP, ctx.ws),
    ctx.db.prepare('DELETE FROM records WHERE app = ? AND workspace_id = ?').bind(APP, ctx.ws),
    ctx.db.prepare("INSERT INTO activity (app, workspace_id, text, kind) VALUES (?, ?, ?, 'reset')")
      .bind(APP, ctx.ws, 'You reset this workspace to its original simulated data.')
  ];
  ROWS.forEach((cells, index) => {
    statements.push(ctx.db.prepare('INSERT INTO records (app, workspace_id, position, cells) VALUES (?, ?, ?, ?)')
      .bind(APP, ctx.ws, index + 1, JSON.stringify(cells)));
  });
  await ctx.db.batch(statements);
  return json(await loadState(ctx.db, ctx.ws), 200, context, ctx.ws);
}
