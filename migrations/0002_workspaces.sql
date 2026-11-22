-- Shared D1 schema upgrade: anonymous workspaces, soft delete, and audit trail.
-- Applied once by the maintainer. App namespace: SalonIQ.
ALTER TABLE records ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'shared';
ALTER TABLE activity ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'shared';
ALTER TABLE records ADD COLUMN deleted_at TEXT;
ALTER TABLE activity ADD COLUMN kind TEXT NOT NULL DEFAULT 'action';
ALTER TABLE activity ADD COLUMN record_id INTEGER;
CREATE TABLE IF NOT EXISTS workspaces (
  app TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  seeded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (app, workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_records_ws ON records(app, workspace_id, deleted_at, position);
CREATE INDEX IF NOT EXISTS idx_activity_ws ON activity(app, workspace_id, id);
DELETE FROM records WHERE workspace_id = 'shared';
DELETE FROM activity WHERE workspace_id = 'shared';
