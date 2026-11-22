import { APP } from './seed.js';
import { getConfig, json, loadState } from './store.js';

export async function onRequestPost(context) {
  if (Number(context.request.headers.get('content-length') || 0) > 2048) {
    return json({ error: 'Request too large' }, 413);
  }
  try {
    const body = await context.request.json();
    const index = Number(body.action);
    if (!Number.isInteger(index) || index < 0) return json({ error: 'Invalid action' }, 400);
    const config = await getConfig(context.env.DB);
    const actions = config.actions || [];
    if (index >= actions.length) return json({ error: 'Unknown action' }, 400);
    await context.env.DB.prepare('INSERT INTO activity (app, text) VALUES (?, ?)')
      .bind(APP, 'You' + actions[index][1]).run();
    return json(await loadState(context.env.DB));
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
}
