import { APP } from './seed.js';

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function displayTime(value) {
  const text = String(value || '');
  return /\d{2}:\d{2}:\d{2}/.test(text) ? text.slice(11, 19) : text;
}

export async function getConfig(db) {
  const result = await db.prepare('SELECT key, value FROM config WHERE app = ?').bind(APP).all();
  const config = {};
  for (const row of result.results) config[row.key] = JSON.parse(row.value);
  return config;
}

export async function loadState(db) {
  const [settings, rows, log] = await Promise.all([
    db.prepare('SELECT key, value FROM config WHERE app = ?').bind(APP).all(),
    db.prepare('SELECT id, cells FROM records WHERE app = ? ORDER BY position, id').bind(APP).all(),
    db.prepare('SELECT id, text, created_at FROM activity WHERE app = ? ORDER BY id DESC LIMIT 40').bind(APP).all()
  ]);
  const config = {};
  for (const row of settings.results) config[row.key] = JSON.parse(row.value);
  return {
    meta: { app: APP, storage: 'd1' },
    config,
    records: rows.results.map((row) => ({ id: row.id, cells: JSON.parse(row.cells) })),
    activity: log.results.map((row) => ({ id: row.id, text: row.text, time: displayTime(row.created_at) }))
  };
}
