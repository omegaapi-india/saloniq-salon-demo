const byId = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function load() {
  try {
    const response = await fetch('/api/admin/overview');
    if (!response.ok) throw new Error('Admin view unavailable');
    const data = await response.json();
    const cards = [
      ['Workspaces', data.counts.workspaces],
      ['Active records', data.counts.activeRecords],
      ['Soft-deleted', data.counts.deletedRecords],
      ['Audit events', data.counts.actions]
    ];
    byId('admin-cards').innerHTML = cards.map(([label, value]) => (
      '<div class="admin-card"><span class="muted">' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>'
    )).join('');
    byId('admin-workspaces').innerHTML = data.workspaces.length
      ? data.workspaces.map((row) => (
          '<div class="admin-row"><span>ws ' + escapeHtml(row.workspace_id.slice(0, 8)) + '</span><span>' + escapeHtml(row.active) + ' active</span><span>simulated rows only</span></div>'
        )).join('')
      : '<p class="muted">No workspace has opened this demo yet.</p>';
    byId('admin-activity').innerHTML = data.activity.length
      ? data.activity.map((row) => (
          '<div class="admin-row"><time>' + escapeHtml(row.time) + '</time><span class="tag">' + escapeHtml(row.kind) + '</span><span>ws ' + escapeHtml(row.workspace) + ' · ' + escapeHtml(row.text) + '</span></div>'
        )).join('')
      : '<p class="muted">No audit event yet.</p>';
    byId('admin-status').textContent = data.meta.app + ' · ' + data.meta.storage + ' · ' + data.meta.view;
  } catch {
    byId('admin-status').textContent = 'Admin view unavailable. Please retry.';
  }
}

load();
