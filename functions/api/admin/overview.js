import { json, loadAdmin } from '../store.js';

export async function onRequestGet({ env }) {
  return json(await loadAdmin(env.DB));
}
