import { APP, ROWS } from './seed.js';

const WS_COOKIE = 'omegaapi_ws';
const MAX_AGE = 60 * 60 * 24 * 365;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cookieHeader(context, ws) {
  const secure = new URL(context.request.url).protocol === 'https:' ? '; Secure' : '';
  return WS_COOKIE + '=' + encodeURIComponent(ws) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + MAX_AGE + secure;
}

export function json(data, status = 200, context = null, ws = null) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  };
  if (context && ws) headers['set-cookie'] = cookieHeader(context, ws);
  return new Response(JSON.stringify(data), { status, headers });
}

function readCookie(header) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const item = part.trim();
    if (item.startsWith(WS_COOKIE + '=')) return decodeURIComponent(item.slice(WS_COOKIE.length + 1));
  }
  return null;
}

async function ensureWorkspace(db, ws) {
  await db.prepare('INSERT OR IGNORE INTO workspaces (app, workspace_id) VALUES (?, ?)').bind(APP, ws).run();
  const row = await db.prepare('SELECT seeded FROM workspaces WHERE app = ? AND workspace_id = ?').bind(APP, ws).all();
  if (row.results[0] && row.results[0].seeded) return;
  const statements = ROWS.map((cells, index) => (
    db.prepare('INSERT INTO records (app, workspace_id, position, cells) VALUES (?, ?, ?, ?)')
      .bind(APP, ws, index + 1, JSON.stringify(cells))
  ));
  statements.push(db.prepare("INSERT INTO activity (app, workspace_id, text, kind) VALUES (?, ?, ?, 'workspace.create')")
    .bind(APP, ws, 'Workspace created with simulated seed data.'));
  statements.push(db.prepare('UPDATE workspaces SET seeded = 1 WHERE app = ? AND workspace_id = ?').bind(APP, ws));
  await db.batch(statements);
}

export async function contextFor(context) {
  let ws = readCookie(context.request.headers.get('cookie'));
  if (!ws || !UUID.test(ws)) ws = crypto.randomUUID();
  await ensureWorkspace(context.env.DB, ws);
  return { db: context.env.DB, ws };
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

export async function loadState(db, ws) {
  const [settings, rows, removed, log] = await Promise.all([
    db.prepare('SELECT key, value FROM config WHERE app = ?').bind(APP).all(),
    db.prepare('SELECT id, cells FROM records WHERE app = ? AND workspace_id = ? AND deleted_at IS NULL ORDER BY position, id').bind(APP, ws).all(),
    db.prepare('SELECT id, cells, deleted_at FROM records WHERE app = ? AND workspace_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 20').bind(APP, ws).all(),
    db.prepare('SELECT id, text, kind, created_at FROM activity WHERE app = ? AND workspace_id = ? ORDER BY id DESC LIMIT 40').bind(APP, ws).all()
  ]);
  const config = {};
  for (const row of settings.results) config[row.key] = JSON.parse(row.value);
  return {
    meta: { app: APP, storage: 'd1', workspace: ws.slice(0, 8) },
    config,
    records: rows.results.map((row) => ({ id: row.id, cells: JSON.parse(row.cells) })),
    deleted: removed.results.map((row) => ({ id: row.id, cells: JSON.parse(row.cells), deletedAt: displayTime(row.deleted_at) })),
    activity: log.results.map((row) => ({ id: row.id, text: row.text, kind: row.kind, time: displayTime(row.created_at) }))
  };
}

export async function loadAdmin(db) {
  const [spaces, active, removed, actions, perSpace, log] = await Promise.all([
    db.prepare('SELECT COUNT(DISTINCT workspace_id) AS n FROM workspaces WHERE app = ?').bind(APP).all(),
    db.prepare('SELECT COUNT(*) AS n FROM records WHERE app = ? AND deleted_at IS NULL').bind(APP).all(),
    db.prepare('SELECT COUNT(*) AS n FROM records WHERE app = ? AND deleted_at IS NOT NULL').bind(APP).all(),
    db.prepare('SELECT COUNT(*) AS n FROM activity WHERE app = ?').bind(APP).all(),
    db.prepare('SELECT workspace_id, COUNT(*) AS active FROM records WHERE app = ? AND deleted_at IS NULL GROUP BY workspace_id ORDER BY active DESC LIMIT 10').bind(APP).all(),
    db.prepare('SELECT workspace_id, text, kind, created_at FROM activity WHERE app = ? ORDER BY id DESC LIMIT 30').bind(APP).all()
  ]);
  return {
    meta: { app: APP, storage: 'd1', view: 'public-read-only' },
    counts: {
      workspaces: spaces.results[0]?.n || 0,
      activeRecords: active.results[0]?.n || 0,
      deletedRecords: removed.results[0]?.n || 0,
      actions: actions.results[0]?.n || 0
    },
    workspaces: perSpace.results,
    activity: log.results.map((row) => ({
      workspace: row.workspace_id.slice(0, 8),
      text: row.text,
      kind: row.kind,
      time: displayTime(row.created_at)
    }))
  };
}
