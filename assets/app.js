import { demo } from './data.js';

const byId = (id) => document.getElementById(id);
const STORAGE = 'saloniq-salon-demo_v1';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadLog() {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(log) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(log.slice(-40)));
  } catch {
    /* Storage may be disabled. The demo still works in memory. */
  }
}

let log = loadLog();

function renderHero() {
  byId('hero-stat').textContent = demo.heroStat;
  byId('hero-note').textContent = demo.heroNote;
  byId('hero-bars').innerHTML = demo.bars.map(([label, width]) => (
    '<div><span>' + escapeHtml(label) + '</span><i class="' + width + '"></i></div>'
  )).join('');
  byId('strip').innerHTML = demo.strip.map(([strong, span]) => (
    '<div><strong>' + escapeHtml(strong) + '</strong><span>' + escapeHtml(span) + '</span></div>'
  )).join('');
  byId('safety-note').textContent = demo.safetyNote;
}

function renderRecords() {
  byId('record-head').innerHTML = '<tr>' + demo.tableHead.map((item) => '<th>' + escapeHtml(item) + '</th>').join('') + '</tr>';
  byId('record-body').innerHTML = demo.rows.map((row) => (
    '<tr>' + row.map((cell, index) => {
      const className = index === row.length - 1 ? ' class="status-cell' + (/review|reorder|due|busy|break|maintenance/i.test(cell) ? ' review' : '') + '"' : '';
      return '<td' + className + '>' + escapeHtml(cell) + '</td>';
    }).join('') + '</tr>'
  )).join('');
}

function renderWorkflow() {
  byId('workflow-grid').innerHTML = demo.workflow.map(([title, text], index) => (
    '<article class="panel workflow-card"><span>0' + (index + 1) + '</span><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(text) + '</p></article>'
  )).join('');
}

function renderActions() {
  byId('action-grid').innerHTML = demo.actions.map(([label], index) => (
    '<button class="button ghost small" type="button" data-action="' + index + '">' + escapeHtml(label) + '</button>'
  )).join('');
}

function renderLog() {
  const list = byId('log-list');
  byId('log-count').textContent = String(log.length);
  if (!log.length) {
    list.innerHTML = '<p class="empty">No action has been recorded yet.</p>';
    byId('activity-status').textContent = 'No action has been recorded yet.';
    return;
  }
  list.innerHTML = log.slice().reverse().map((item) => (
    '<div class="log-item"><time>' + escapeHtml(item.time) + '</time>' + escapeHtml(item.text) + '</div>'
  )).join('');
  byId('activity-status').textContent = 'Last action: ' + log[log.length - 1].text;
}

function record(text) {
  log.push({ time: new Date().toLocaleTimeString(), text });
  saveLog(log);
  renderLog();
}

function bind() {
  byId('action-grid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = demo.actions[Number(button.dataset.action)];
    if (action) record('You' + action[1]);
  });
  byId('reset-demo').addEventListener('click', () => {
    log = [];
    saveLog(log);
    renderLog();
  });
}

renderHero();
renderRecords();
renderWorkflow();
renderActions();
renderLog();
bind();
