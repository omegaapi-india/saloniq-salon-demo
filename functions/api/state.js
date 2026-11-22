import { json, loadState } from './store.js';

export async function onRequestGet({ env }) {
  return json(await loadState(env.DB));
}
