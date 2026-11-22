import { APP, CONFIG, ROWS } from './seed.js';
import { json, loadState } from './store.js';

export async function onRequestPost({ env }) {
  const db = env.DB;
  const statements = [
    db.prepare('DELETE FROM activity WHERE app = ?').bind(APP),
    db.prepare('DELETE FROM records WHERE app = ?').bind(APP),
    db.prepare('DELETE FROM config WHERE app = ?').bind(APP)
  ];
  for (const [key, value] of Object.entries(CONFIG)) {
    statements.push(db.prepare('INSERT INTO config (app, key, value) VALUES (?, ?, ?)')
      .bind(APP, key, JSON.stringify(value)));
  }
  ROWS.forEach((cells, index) => {
    statements.push(db.prepare('INSERT INTO records (app, position, cells) VALUES (?, ?, ?)')
      .bind(APP, index + 1, JSON.stringify(cells)));
  });
  await db.batch(statements);
  return json(await loadState(db));
}
