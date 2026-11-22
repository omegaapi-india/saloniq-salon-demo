const byId = (id) => document.getElementById(id);

let state = null;
let busy = false;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error('Backend request failed');
  return response.json();
}

function setStatus(text, isError) {
  const element = byId('backend-status');
  if (!element) return;
  element.textContent = text;
  element.classList.toggle('error', Boolean(isError));
}

function renderHero() {
  const config = state.config;
  byId('hero-stat').textContent = config.heroStat;
  byId('hero-note').textContent = config.heroNote;
  byId('hero-bars').innerHTML = config.bars.map(([label, width]) => (
    '<div><span>' + escapeHtml(label) + '</span><i class="' + escapeHtml(width) + '"></i></div>'
  )).join('');
  byId('strip').innerHTML = config.strip.map(([strong, span]) => (
    '<div><strong>' + escapeHtml(strong) + '</strong><span>' + escapeHtml(span) + '</span></div>'
  )).join('');
  byId('safety-note').textContent = config.safetyNote;
}

function renderRecords() {
  const config = state.config;
  byId('record-head').innerHTML = '<tr>' + config.tableHead.map((item) => '<th>' + escapeHtml(item) + '</th>').join('') + '</tr>';
  byId('record-body').innerHTML = state.records.map((record) => (
    '<tr>' + record.cells.map((cell, index) => {
      const className = index === record.cells.length - 1
        ? ' class="status-cell' + (/review|reorder|due|busy|break|maintenance/i.test(cell) ? ' review' : '') + '"'
        : '';
      const label = ' data-label="' + escapeHtml(config.tableHead[index]) + '"';
      return '<td' + label + className + '>' + escapeHtml(cell) + '</td>';
    }).join('') + '</tr>'
  )).join('');
}

function renderWorkflow() {
  byId('workflow-grid').innerHTML = state.config.workflow.map(([title, text], index) => (
    '<article class="panel workflow-card"><span>0' + (index + 1) + '</span><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(text) + '</p></article>'
  )).join('');
}

function renderActions() {
  byId('action-grid').innerHTML = state.config.actions.map(([label], index) => (
    '<button class="button ghost small" type="button" data-action="' + index + '">' + escapeHtml(label) + '</button>'
  )).join('');
}

function renderLog() {
  const list = byId('log-list');
  byId('log-count').textContent = String(state.activity.length);
  if (!state.activity.length) {
    list.innerHTML = '<p class="empty">No action has been recorded yet.</p>';
    byId('activity-status').textContent = 'No action has been recorded yet.';
    return;
  }
  list.innerHTML = state.activity.map((item) => (
    '<div class="log-item"><time>' + escapeHtml(item.time) + '</time>' + escapeHtml(item.text) + '</div>'
  )).join('');
  byId('activity-status').textContent = 'Last action: ' + state.activity[0].text;
}

function renderAll() {
  renderHero();
  renderRecords();
  renderWorkflow();
  renderActions();
  renderLog();
  setStatus('Backend: connected · ' + state.meta.app + ' · D1', false);
}

async function mutate(path, body) {
  if (busy) return;
  busy = true;
  setStatus('Saving to backend…', false);
  try {
    const options = { method: 'POST' };
    if (body !== undefined) {
      options.headers = { 'content-type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    state = await api(path, options);
    renderAll();
  } catch {
    setStatus('Backend unavailable. Please retry.', true);
  } finally {
    busy = false;
  }
}

function bind() {
  byId('action-grid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    mutate('/api/action', { action: Number(button.dataset.action) });
  });
  byId('add-sample').addEventListener('click', () => mutate('/api/records'));
  byId('reset-demo').addEventListener('click', () => {
    if (!window.confirm('Reset this demo to its original simulated data?')) return;
    mutate('/api/reset');
  });
}

async function load() {
  setStatus('Connecting to backend…', false);
  try {
    state = await api('/api/state');
    renderAll();
    bind();
  } catch {
    setStatus('Backend unavailable. Please retry.', true);
  }
}

load();
