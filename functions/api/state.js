import { contextFor, json, loadState } from './store.js';

export async function onRequestGet(context) {
  const ctx = await contextFor(context);
  return json(await loadState(ctx.db, ctx.ws), 200, context, ctx.ws);
}
