/* ==========================================================================
   Common Ground: client (PWA)
   A hash-routed single-page app backed by Supabase (Postgres + Auth).
   Ownership rules are enforced server-side by row-level security; the UI
   only mirrors them. All rendering is string templates and every piece of
   user content goes through esc() before it reaches the DOM.
   ========================================================================== */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const sb = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

/* ---------- Helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const COLORS = ['#2f6f5e', '#e07a4f', '#5162c4', '#c2577a', '#c98a1b', '#3a8fb7', '#7a5bc9', '#4f8a3c'];

const ICONS = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
};

const icon = (name, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const LOGO = `<span class="logo" aria-hidden="true"><svg viewBox="0 0 32 32"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15.5 16 7l10 8.5"/><path d="M9 13.5V25h14V13.5"/></g><path class="logo__heart" d="M16 22.2s-3.6-2.1-3.6-4.5a1.9 1.9 0 0 1 3.6-.9 1.9 1.9 0 0 1 3.6.9c0 2.4-3.6 4.5-3.6 4.5Z"/></svg></span>`;

const initials = (name) =>
  String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

const avatar = (m, size = 'md') =>
  `<span class="avatar avatar--${size}" style="--c:${esc(m.color)}" title="${esc(m.name)}" aria-hidden="true">${esc(initials(m.name))}</span>`;

function avatarStack(list, max = 4) {
  if (!list.length) return '';
  const shown = list.slice(0, max).map((m) => avatar(m, 'xs')).join('');
  const more = list.length > max ? `<span class="avatar avatar--xs avatar--more">+${list.length - max}</span>` : '';
  return `<span class="avatars" title="${esc(list.map((m) => m.name).join(', '))}">${shown}${more}</span>`;
}

const firstName = (n) => String(n || '').trim().split(/\s+/)[0];
const plural = (n, word, pl = `${word}s`) => `${n} ${n === 1 ? word : pl}`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM" as a *local* date. */
function parseLocal(s) {
  if (!s) return null;
  const [d, t] = s.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t ? t.split(':').map(Number) : [0, 0];
  return { date: new Date(y, m - 1, day, hh, mm), hasTime: Boolean(t) };
}

function formatWhen(s) {
  const p = parseLocal(s);
  if (!p) return '';
  const opts = { weekday: 'short', month: 'short', day: 'numeric' };
  if (p.date.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  const day = p.date.toLocaleDateString(undefined, opts);
  return p.hasTime ? `${day} · ${p.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : day;
}

function relativeDay(s) {
  const p = parseLocal(s);
  if (!p) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(p.date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return diff > 1 ? `In ${diff} days` : `${-diff} days ago`;
}

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)}d ago`;
  const d = new Date(iso);
  const opts = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString(undefined, opts);
}

const joined = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

/* ---------- State ---------- */

const state = {
  me: null,
  authEmail: '',
  authMode: 'login',
  issues: null,
  stats: null,
  issueFilter: 'open',
  issueQuery: '',
  issue: null, // { issue, tasks }
  openComments: new Set(),
  editing: null, // { type: 'task' | 'comment', id }
  members: null,
  memberQuery: '',
};
let renderSeq = 0;
let lastPath = '';
let installPrompt = null; // deferred "Add to Home Screen" prompt (PWA)
const PHONE_RE = /^[0-9+().\-\s]{7,30}$/;

function resetState() {
  Object.assign(state, {
    issues: null,
    stats: null,
    issueFilter: 'open',
    issueQuery: '',
    issue: null,
    editing: null,
    members: null,
    memberQuery: '',
  });
  state.openComments.clear();
}

/* ---------- Data layer (Supabase) ---------- */

const PROFILE_COLS = 'id,name,email,phone,bio,color,created_at';
const OWNER_COLS = 'id,name,color,email,phone';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function notFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

/** Turn a Supabase/PostgREST error into a friendly Error. */
function friendly(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return new Error(fallback);
  const msg = String(error.message || '');
  if (error.code === '42501' || /row-level security|permission denied/i.test(msg)) {
    return new Error('You don’t have permission to do that. You can only change your own profile, issues, tasks and comments.');
  }
  if (error.code === '23514' || /check constraint/i.test(msg)) return new Error('Some of that information isn’t valid. Please check it and try again.');
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return new Error('Can’t reach the server. Check your connection and try again.');
  if (/JWT|session/i.test(msg)) return new Error('Your session expired. Please log in again.');
  return new Error(msg || fallback);
}

const must = ({ data, error }) => {
  if (error) throw friendly(error);
  return data;
};

/** Updates/deletes blocked by RLS return zero rows instead of an error. */
const mustAffect = (res, message) => {
  const rows = must(res);
  if (!rows || !rows.length) throw new Error(message);
  return rows;
};

const byCreated = (a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id;

function shapeIssue(r) {
  const tasks = r.tasks || [];
  const seen = new Map();
  for (const t of tasks) if (t.owner && !seen.has(t.owner.id)) seen.set(t.owner.id, t.owner);
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    starts_at: r.starts_at,
    is_open: r.is_open,
    created_at: r.created_at,
    owner: r.owner,
    task_count: tasks.length,
    done_count: tasks.filter((t) => t.done).length,
    comment_count: tasks.reduce((n, t) => n + (t.comments?.length || 0), 0),
    contributors: [...seen.values()].sort((a, b) => a.name.localeCompare(b.name)),
    tasks,
  };
}

const issueOrder = (a, b) =>
  Number(b.is_open) - Number(a.is_open) ||
  Number(a.starts_at == null) - Number(b.starts_at == null) ||
  (a.starts_at || '').localeCompare(b.starts_at || '') ||
  b.created_at.localeCompare(a.created_at);

const ISSUE_LIST_SELECT = `*, owner:profiles!issues_owner_fk(${OWNER_COLS}), tasks:tasks!tasks_issue_fk(id,done,owner:profiles!tasks_owner_fk(id,name,color),comments:comments!comments_task_fk(id,author_id))`;

const data = {
  async loadMe(userId) {
    return must(await sb.from('profiles').select(PROFILE_COLS).eq('id', userId).single());
  },

  async issues() {
    const [rows, count] = await Promise.all([
      sb.from('issues').select(ISSUE_LIST_SELECT),
      sb.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    const issues = must(rows).map(shapeIssue).sort(issueOrder);
    if (count.error) throw friendly(count.error);
    const myOpen = issues.filter((i) => i.is_open).flatMap((i) => i.tasks).filter((t) => t.owner.id === state.me.id && !t.done).length;
    return { issues, stats: { members: count.count ?? 0, my_open_tasks: myOpen } };
  },

  async issue(id) {
    const row = must(
      await sb
        .from('issues')
        .select(
          `*, owner:profiles!issues_owner_fk(${OWNER_COLS}),
           tasks:tasks!tasks_issue_fk(*, owner:profiles!tasks_owner_fk(id,name,color),
             comments:comments!comments_task_fk(*, author:profiles!comments_author_fk(id,name,color)))`
        )
        .eq('id', id)
        .maybeSingle()
    );
    if (!row) throw notFoundError('That issue could not be found. It may have been deleted.');
    const tasks = (row.tasks || []).sort(byCreated).map((t) => ({
      id: t.id,
      issue_id: t.issue_id,
      title: t.title,
      done: t.done,
      created_at: t.created_at,
      edited: t.updated_at !== t.created_at,
      owner: t.owner,
      comments: (t.comments || []).sort(byCreated).map((c) => ({
        id: c.id,
        task_id: c.task_id,
        body: c.body,
        created_at: c.created_at,
        edited: c.updated_at !== c.created_at,
        author: c.author,
      })),
    }));
    const issue = shapeIssue({ ...row, tasks });
    delete issue.tasks;
    return { issue, tasks };
  },

  async createIssue(payload) {
    return must(await sb.from('issues').insert(payload).select('id').single());
  },

  async updateIssue(id, patch) {
    mustAffect(await sb.from('issues').update(patch).eq('id', id).select('id'), 'Only the person who created this issue can change it.');
  },

  async addTask(issueId, title) {
    const res = await sb.from('tasks').insert({ issue_id: issueId, title }).select('id').single();
    if (res.error && /row-level security/i.test(res.error.message)) throw new Error('This issue is closed, so new tasks can’t be added.');
    return must(res);
  },

  async updateTask(id, patch) {
    mustAffect(await sb.from('tasks').update(patch).eq('id', id).select('id'), 'Only the member who owns this task can change it.');
  },

  async deleteTask(id) {
    mustAffect(
      await sb.from('tasks').delete().eq('id', id).select('id'),
      'This task can’t be deleted because other members have commented on it.'
    );
  },

  async addComment(taskId, body) {
    return must(await sb.from('comments').insert({ task_id: taskId, body }).select('id').single());
  },

  async updateComment(id, body) {
    mustAffect(await sb.from('comments').update({ body }).eq('id', id).select('id'), 'You can only edit your own comments.');
  },

  async deleteComment(id) {
    mustAffect(await sb.from('comments').delete().eq('id', id).select('id'), 'You can only delete your own comments.');
  },

  async members() {
    const rows = must(
      await sb
        .from('profiles')
        .select(`${PROFILE_COLS}, issues:issues!issues_owner_fk(id), tasks:tasks!tasks_owner_fk(id)`)
        .order('name')
    );
    return rows.map(({ issues, tasks, ...m }) => ({ ...m, issue_count: issues.length, task_count: tasks.length }));
  },

  async member(id) {
    if (!UUID_RE.test(id)) throw notFoundError('That member could not be found.');
    const [p, iss, tks] = await Promise.all([
      sb.from('profiles').select(PROFILE_COLS).eq('id', id).maybeSingle(),
      sb.from('issues').select(ISSUE_LIST_SELECT).eq('owner_id', id),
      sb.from('tasks').select('id,title,done,created_at, issue:issues!tasks_issue_fk(id,title,is_open)').eq('owner_id', id),
    ]);
    const member = must(p);
    if (!member) throw notFoundError('That member could not be found.');
    const issues = must(iss).map(shapeIssue).sort(issueOrder);
    const tasks = must(tks).sort(
      (a, b) => Number(b.issue.is_open) - Number(a.issue.is_open) || Number(a.done) - Number(b.done) || b.created_at.localeCompare(a.created_at)
    );
    return { member, issues, tasks };
  },

  async updateProfile(patch) {
    const rows = mustAffect(
      await sb.from('profiles').update(patch).eq('id', state.me.id).select(PROFILE_COLS),
      'You can only edit your own profile.'
    );
    return rows[0];
  },
};

/* ---------- Toasts ---------- */

function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `${icon(type === 'error' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
  $('#toasts').append(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 260);
  }, type === 'error' ? 4800 : 3000);
}

/* ---------- Modal ---------- */

let modalClose = null;

function openModal({ title, subtitle = '', body, submitLabel = 'Save', danger = false, size = '', onSubmit, onCancel }) {
  if (modalClose) modalClose(true);
  const root = $('#modal-root');
  const prevFocus = document.activeElement;
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal ${size ? `modal--${size}` : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <form class="modal__form">
          <header class="modal__head">
            <div>
              <h2 id="modal-title">${title}</h2>
              ${subtitle ? `<p>${subtitle}</p>` : ''}
            </div>
            <button type="button" class="icon-btn" data-modal-close aria-label="Close">${icon('x')}</button>
          </header>
          <div class="modal__body">
            ${body}
            <div class="form-error" hidden></div>
          </div>
          <footer class="modal__foot">
            <button type="button" class="btn btn--ghost" data-modal-close>Cancel</button>
            <button type="submit" class="btn ${danger ? 'btn--danger' : 'btn--primary'}">${submitLabel}</button>
          </footer>
        </form>
      </div>
    </div>`;
  const backdrop = root.firstElementChild;
  const form = $('form', root);
  let closed = false;

  const close = (cancelled) => {
    if (closed) return;
    closed = true;
    root.innerHTML = '';
    document.body.classList.remove('modal-open');
    modalClose = null;
    if (cancelled && onCancel) onCancel();
    if (prevFocus && document.contains(prevFocus)) prevFocus.focus();
  };
  modalClose = close;

  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) close(true);
  });
  root.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', () => close(true)));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    setFormError(form, '');
    btn.disabled = true;
    try {
      await onSubmit(new FormData(form), form);
      close(false);
    } catch (err) {
      setFormError(form, err.message);
      btn.disabled = false;
    }
  });

  document.body.classList.add('modal-open');
  requestAnimationFrame(() => {
    const first = form.querySelector('input:not([type="radio"]):not([type="hidden"]), textarea') || form.querySelector('[type="submit"]');
    first?.focus();
  });
}

function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = true }) {
  return new Promise((resolve) => {
    openModal({
      title,
      size: 'sm',
      body: `<p class="confirm-text">${message}</p>`,
      submitLabel: confirmLabel,
      danger,
      onSubmit: async () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

function setFormError(form, message) {
  const el = form.querySelector(':scope > .form-error, :scope .form-error');
  if (!el) return false;
  el.textContent = message;
  el.hidden = !message;
  return true;
}

/* ---------- Form building blocks ---------- */

function field({ label, name, type = 'text', value = '', required = false, placeholder = '', hint = '', attrs = '', cls = '' }) {
  return `
    <label class="field ${cls}">
      <span class="field__label">${label}${required ? '' : ' <em>optional</em>'}</span>
      <input class="input" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${required ? 'required' : ''} ${attrs}>
      ${hint ? `<span class="field__hint">${hint}</span>` : ''}
    </label>`;
}

function textarea({ label, name, value = '', placeholder = '', rows = 4, required = false, attrs = '', cls = '' }) {
  return `
    <label class="field ${cls}">
      <span class="field__label">${label}${required ? '' : ' <em>optional</em>'}</span>
      <textarea class="input" name="${name}" rows="${rows}" placeholder="${esc(placeholder)}" ${required ? 'required' : ''} ${attrs}>${esc(value)}</textarea>
    </label>`;
}

/* ---------- Shared UI pieces ---------- */


const statusPill = (open) =>
  `<span class="status status--${open ? 'open' : 'closed'}"><i></i>${open ? 'Open' : 'Closed'}</span>`;

const emptyState = ({ iconName = 'inbox', title, text, action = '' }) => `
  <div class="empty">
    <span class="empty__icon">${icon(iconName)}</span>
    <h3>${title}</h3>
    <p>${text}</p>
    ${action}
  </div>`;

const skeletonCards = (n = 6) =>
  `<div class="skeleton skeleton--head"></div><div class="issue-grid">${'<div class="skeleton skeleton--card"></div>'.repeat(n)}</div>`;

function contactLinks(m, cls = '') {
  return `
    <a class="contact-link ${cls}" href="mailto:${esc(m.email)}">${icon('mail')}<span>${esc(m.email)}</span></a>
    ${
      m.phone
        ? `<a class="contact-link ${cls}" href="tel:${esc(m.phone.replace(/[^0-9+]/g, ''))}">${icon('phone')}<span>${esc(m.phone)}</span></a>`
        : `<span class="contact-link contact-link--none ${cls}">${icon('phone')}<span>No phone listed</span></span>`
    }`;
}

/* ---------- Cover art & confetti ---------- */

const COVER_PALETTE = [
    ['#ff7a59', '#ffb347', '#ff4f81'],
    ['#f76b1c', '#fbbf24', '#f43f5e'],
    ['#ff5e62', '#ff9966', '#ffd166'],
    ['#ec4899', '#fb923c', '#facc15'],
    ['#5b6cff', '#38bdf8', '#a78bfa'],
    ['#4f46e5', '#22d3ee', '#818cf8'],
    ['#2563eb', '#2dd4bf', '#c084fc'],
    ['#7c3aed', '#60a5fa', '#34d399'],
    ['#0ea5a4', '#84cc16', '#22d3ee'],
    ['#db2777', '#8b5cf6', '#f472b6'],
];
const paletteFor = (seed) => COVER_PALETTE[(Number(seed) * 3) % COVER_PALETTE.length];
const coverColor = (seed) => paletteFor(seed)[0];
const monogram = (title) => esc((String(title).trim().match(/[\p{L}\p{N}]/u) || ['#'])[0].toUpperCase());
let coverSeq = 0;

/** Deterministic, playful SVG cover for an issue (same id → same art). */
function coverArt(seed) {
  let x = (Number(seed) * 2654435761) % 4294967296;
  const rnd = () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const [a, b, c] = paletteFor(seed);
  const id = `cv${++coverSeq}`;
  const blob = (cx, cy, r, fill, op) => `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${op}"/>`;
  const dots = Array.from({ length: 14 }, () => `<circle cx="${(rnd() * 400).toFixed(0)}" cy="${(rnd() * 160).toFixed(0)}" r="${(1.5 + rnd() * 2.5).toFixed(1)}" fill="#fff" opacity="${(0.35 + rnd() * 0.45).toFixed(2)}"/>`).join('');
  const w1 = 95 + rnd() * 30;
  const w2 = 70 + rnd() * 50;
  const w3 = 120 + rnd() * 30;
  return `<svg class="cover-art" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <filter id="${id}b"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="400" height="160" fill="url(#${id})"/>
    <g filter="url(#${id}b)">
      ${blob(rnd() * 400, rnd() * 160, 60 + rnd() * 40, c, 0.85)}
      ${blob(rnd() * 400, rnd() * 160, 50 + rnd() * 40, '#ffffff', 0.35)}
    </g>
    <circle cx="${(260 + rnd() * 120).toFixed(0)}" cy="${(rnd() * 60).toFixed(0)}" r="${(34 + rnd() * 26).toFixed(0)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="10"/>
    ${blob(40 + rnd() * 120, 120 + rnd() * 50, 26 + rnd() * 20, '#ffffff', 0.18)}
    <path d="M0 ${w1.toFixed(0)} C 110 ${w2.toFixed(0)}, 230 ${w3.toFixed(0)}, 400 ${(w1 - 20).toFixed(0)} L400 160 L0 160Z" fill="#fff" opacity=".16"/>
    <path d="M0 ${(w1 + 26).toFixed(0)} C 140 ${(w3 - 10).toFixed(0)}, 250 ${(w2 + 40).toFixed(0)}, 400 ${(w1 + 14).toFixed(0)} L400 160 L0 160Z" fill="#000" opacity=".07"/>
    ${dots}
  </svg>`;
}

/** Lightweight confetti burst from a screen point. */
function confetti(x, y, count = 90) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const colors = ['#ff6b4a', '#ffb347', '#2fbf8f', '#5b6cff', '#ff4f81', '#facc15', '#38bdf8'];
  const parts = Array.from({ length: count }, () => {
    const ang = Math.random() * Math.PI * 2;
    const sp = 4 + Math.random() * 8;
    return {
      x, y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 6,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
      round: Math.random() < 0.3,
    };
  });
  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 1700);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < 1700) requestAnimationFrame(frame);
    else canvas.remove();
  })(start);
}

/* ==========================================================================
   Routing & shell
   ========================================================================== */

function currentRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { section: parts[0] || 'issues', id: parts[1] ? decodeURIComponent(parts[1]) : null };
}

async function render() {
  const seq = ++renderSeq;
  closeMenu();
  if (!CONFIGURED) {
    renderSetup();
    return;
  }
  if (!state.me) {
    renderAuth();
    return;
  }
  const { section, id } = currentRoute();
  renderShell(section);
  const view = $('#view');

  const pathKey = `${section}/${id ?? ''}`;
  if (pathKey !== lastPath) {
    window.scrollTo({ top: 0 });
    state.editing = null;
    lastPath = pathKey;
  }

  try {
    if (section === 'issues' && id) {
      if (!/^\d+$/.test(id)) throw notFoundError('That issue could not be found.');
      await IssuePage(view, seq, Number(id));
    }
    else if (section === 'issues') await IssuesPage(view, seq);
    else if (section === 'members' && id) await MemberPage(view, seq, id);
    else if (section === 'members') await MembersPage(view, seq);
    else if (section === 'profile') ProfilePage(view);
    else view.innerHTML = notFound('page');
  } catch (err) {
    if (seq !== renderSeq) return;
    view.innerHTML =
      err.status === 404
        ? notFound(section === 'members' ? 'member' : 'issue', err.message)
        : emptyState({ iconName: 'alert', title: 'Something went wrong', text: esc(err.message), action: `<button class="btn btn--secondary" data-action="reload">Try again</button>` });
  }
}

function notFound(what, message = '') {
  const back = what === 'member' ? `<a class="btn btn--secondary" href="#/members">See all members</a>` : `<a class="btn btn--secondary" href="#/">Back to issues</a>`;
  return emptyState({ iconName: 'search', title: `We couldn’t find that ${what}`, text: esc(message || 'The link may be broken, or it may have been deleted.'), action: back });
}

function renderShell(section) {
  const app = $('#app');
  if (!$('#view')) {
    app.innerHTML = `
      <header class="topbar" id="topbar"></header>
      <main id="view" class="container view" tabindex="-1"></main>
      <footer class="site-foot container">${LOGO}<span>Common Ground · built for communities that show up</span></footer>`;
  }
  const me = state.me;
  const active = (s) => (section === s ? 'is-active' : '');
  $('#topbar').innerHTML = `
    <div class="topbar__inner container">
      <a class="brand" href="#/">${LOGO}<span class="brand__name">Common Ground</span></a>
      <nav class="nav" aria-label="Main">
        <a href="#/" class="nav__link ${active('issues')}">${icon('grid')}<span>Issues</span></a>
        <a href="#/members" class="nav__link ${active('members')}">${icon('users')}<span>Members</span></a>
      </nav>
      <div class="me">
        <button class="me__btn" data-action="toggle-menu" aria-haspopup="menu" aria-expanded="false" aria-controls="me-menu">
          ${avatar(me, 'sm')}<span class="me__name">${esc(firstName(me.name))}</span>${icon('chevronDown', 'icon--sm')}
        </button>
        <div class="menu" id="me-menu" role="menu" hidden>
          <div class="menu__head">${avatar(me, 'md')}<div><strong>${esc(me.name)}</strong><span>${esc(me.email)}</span></div></div>
          <a href="#/profile" class="menu__item" role="menuitem">${icon('user')} Edit profile</a>
          <a href="#/members/${me.id}" class="menu__item" role="menuitem">${icon('eye')} View my public profile</a>
          ${installPrompt ? `<button class="menu__item" data-action="install" role="menuitem">${icon('download')} Install app</button>` : ''}
          <div class="menu__sep"></div>
          <button class="menu__item" data-action="logout" role="menuitem">${icon('logout')} Log out</button>
        </div>
      </div>
    </div>`;
}

function renderSetup() {
  $('#app').innerHTML = `
    <div class="setup container">
      ${emptyState({
        iconName: 'key',
        title: 'Almost there: connect a database',
        text: 'This copy of Common Ground isn’t connected to Supabase yet. Run <code>node scripts/provision.mjs</code> (see the README) to create the database and fill in <code>config.js</code>.',
      })}
    </div>`;
}

function closeMenu() {
  const menu = $('#me-menu');
  if (menu && !menu.hidden) {
    menu.hidden = true;
    $('.me__btn')?.setAttribute('aria-expanded', 'false');
  }
}

/* ==========================================================================
   Auth
   ========================================================================== */

function renderAuth() {
  const login = state.authMode === 'login';
  $('#app').innerHTML = `
    <div class="auth">
      <section class="auth__hero">
        <a class="brand brand--light" href="#/">${LOGO}<span class="brand__name">Common Ground</span></a>
        <div class="auth__pitch">
          <h1>Where your community <em>shows up</em> for each other.</h1>
          <p>Plan potlucks, park cleanups and community projects in one place. See who’s bringing what, claim a task, and keep the conversation going.</p>
        </div>
        <div class="auth__cards" aria-hidden="true">
          ${floatCard({ name: 'John Okafor', color: '#e07a4f' }, 'I’ll bring the chips', 'Fall Community Potluck', false, '-2.5deg', '0s', '0px')}
          ${floatCard({ name: 'Jane Alvarez', color: '#2f6f5e' }, 'I’ll bring the sodas', 'Fall Community Potluck', false, '1.5deg', '-2s', '36px')}
          ${floatCard({ name: 'Marcus Lee', color: '#c2577a' }, 'Truck to haul bags to the dump', 'Saturday Park Cleanup', true, '-1deg', '-4s', '12px')}
        </div>
      </section>
      <section class="auth__panel">
        <div class="auth__card">
          <div class="tabs" role="tablist">
            <button class="tab ${login ? 'is-active' : ''}" role="tab" aria-selected="${login}" data-action="auth-mode" data-mode="login">Log in</button>
            <button class="tab ${!login ? 'is-active' : ''}" role="tab" aria-selected="${!login}" data-action="auth-mode" data-mode="signup">Sign up</button>
          </div>
          ${login ? loginForm() : signupForm()}
        </div>
      </section>
    </div>`;
  requestAnimationFrame(() => $('.auth-form input')?.focus());
}

function floatCard(m, text, issue, done, rot, delay, x) {
  return `
    <div class="float-card" style="--r:${rot};--d:${delay};--x:${x}">
      ${avatar(m, 'md')}
      <div><strong>${esc(text)}</strong><small>${esc(firstName(m.name))} · ${esc(issue)}</small></div>
      <span class="check ${done ? 'is-checked' : ''}">${icon('check')}</span>
    </div>`;
}

function loginForm() {
  return `
    <h2>Welcome back</h2>
    <p class="lead">Log in to see what’s happening in your community.</p>
    <form class="auth-form" data-form="login">
      ${field({ label: 'Email', name: 'email', type: 'email', required: true, placeholder: 'you@example.com', attrs: 'autocomplete="email"' })}
      ${field({ label: 'Password', name: 'password', type: 'password', required: true, placeholder: '••••••••', attrs: 'autocomplete="current-password"' })}
      <div class="form-error" hidden></div>
      <button class="btn btn--primary btn--lg btn--block" type="submit">Log in</button>
    </form>
    <div class="demo-hint">
      <div>${icon('sparkle', 'icon--sm')} <span>Demo account: <code>jane@example.com</code> · <code>community123</code></span></div>
      <button class="btn btn--secondary btn--sm" data-action="fill-demo">Use demo</button>
    </div>
    <p class="auth__switch">New here? <button class="link-btn" data-action="auth-mode" data-mode="signup">Create an account</button></p>`;
}

function signupForm() {
  return `
    <h2>Join your community</h2>
    <p class="lead">Create an account to organize issues and pitch in on tasks.</p>
    <form class="auth-form" data-form="signup">
      ${field({ label: 'Full name', name: 'name', required: true, placeholder: 'Jane Alvarez', attrs: 'autocomplete="name" maxlength="80"' })}
      ${field({ label: 'Email', name: 'email', type: 'email', required: true, placeholder: 'you@example.com', attrs: 'autocomplete="email"' })}
      ${field({ label: 'Phone', name: 'phone', type: 'tel', placeholder: '(555) 010-1234', hint: 'Visible to other members so they can reach you.', attrs: 'autocomplete="tel" maxlength="30"' })}
      ${field({ label: 'Password', name: 'password', type: 'password', required: true, placeholder: 'At least 8 characters', attrs: 'autocomplete="new-password" minlength="8"' })}
      <div class="form-error" hidden></div>
      <button class="btn btn--primary btn--lg btn--block" type="submit">Create account</button>
    </form>
    <p class="auth__switch">Already a member? <button class="link-btn" data-action="auth-mode" data-mode="login">Log in</button></p>`;
}

/* ==========================================================================
   Issues list
   ========================================================================== */

async function IssuesPage(view, seq) {
  if (!state.issues) view.innerHTML = skeletonCards();
  const { issues, stats } = await data.issues();
  if (seq !== renderSeq) return;
  state.issues = issues;
  state.stats = stats;
  drawIssues();
}

const isInvolved = (i) => i.owner.id === state.me.id || i.contributors.some((c) => c.id === state.me.id);

function filteredIssues() {
  const q = state.issueQuery.trim().toLowerCase();
  return state.issues.filter((i) => {
    if (state.issueFilter === 'open' && !i.is_open) return false;
    if (state.issueFilter === 'closed' && i.is_open) return false;
    if (state.issueFilter === 'mine' && !isInvolved(i)) return false;
    if (!q) return true;
    return [i.title, i.description, i.location, i.owner.name].some((s) => s && s.toLowerCase().includes(q));
  });
}

function drawIssues() {
  const view = $('#view');
  const all = state.issues;
  const open = all.filter((i) => i.is_open);
  const counts = { open: open.length, closed: all.length - open.length, mine: all.filter(isInvolved).length, all: all.length };

  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const nextEvent = open
    .filter((i) => i.starts_at && i.starts_at.slice(0, 10) >= todayKey)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

  const filters = [
    ['open', 'Open'],
    ['mine', 'Involving me'],
    ['closed', 'Closed'],
    ['all', 'All'],
  ];

  view.innerHTML = `
    <section class="hero">
      <div class="hero__orbs" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="hero__grid">
        <div class="hero__content">
          <p class="hero__eyebrow">${greeting()}, ${esc(firstName(state.me.name))} <span class="wave" aria-hidden="true">👋</span></p>
          <h1 class="hero__title">What’s happening in your <em>community</em></h1>
          <p class="hero__sub">Everything your community is working on, big or small. Jump in wherever you can help.</p>
          <button class="btn btn--accent btn--lg" data-action="new-issue">${icon('plus')} New issue</button>
        </div>
        <div class="hero__stats" aria-label="Community at a glance">
          <div class="stat">
            <span class="stat__icon stat__icon--brand">${icon('grid')}</span>
            <div><div class="stat__value">${counts.open}</div><div class="stat__label">Open issues</div></div>
          </div>
          <div class="stat">
            <span class="stat__icon stat__icon--accent">${icon('check')}</span>
            <div><div class="stat__value">${state.stats.my_open_tasks}</div><div class="stat__label">Tasks on your plate</div></div>
          </div>
          <a class="stat" href="#/members">
            <span class="stat__icon stat__icon--project">${icon('users')}</span>
            <div><div class="stat__value">${state.stats.members}</div><div class="stat__label">Members</div></div>
          </a>
          ${
            nextEvent
              ? `<a class="stat" href="#/issues/${nextEvent.id}">
                   <span class="stat__icon stat__icon--event">${icon('calendar')}</span>
                   <div class="min0"><div class="stat__value stat__value--sm">${esc(relativeDay(nextEvent.starts_at))}</div><div class="stat__label">Next: ${esc(nextEvent.title)}</div></div>
                 </a>`
              : `<div class="stat">
                   <span class="stat__icon stat__icon--event">${icon('calendar')}</span>
                   <div><div class="stat__value stat__value--sm">Nothing yet</div><div class="stat__label">Nothing scheduled</div></div>
                 </div>`
          }
        </div>
      </div>
    </section>

    <div class="toolbar">
      <div class="segmented" role="tablist" aria-label="Filter issues">
        ${filters
          .map(
            ([key, label]) =>
              `<button role="tab" aria-selected="${state.issueFilter === key}" class="${state.issueFilter === key ? 'is-active' : ''}" data-action="set-filter" data-filter="${key}">${label}<span class="count">${counts[key]}</span></button>`
          )
          .join('')}
      </div>
      <label class="search">
        ${icon('search')}
        <span class="sr-only">Search issues</span>
        <input class="input" type="search" placeholder="Search issues, places, people…" value="${esc(state.issueQuery)}" data-input="issue-search">
      </label>
    </div>

    <div id="issue-grid"></div>`;
  drawIssueGrid();
}

function drawIssueGrid() {
  const host = $('#issue-grid');
  if (!host) return;
  const list = filteredIssues();
  if (!list.length) {
    const q = state.issueQuery.trim();
    host.innerHTML = q
      ? emptyState({ iconName: 'search', title: 'No matches', text: `Nothing matches “${esc(q)}” here. Try another word, or check the other tabs.` })
      : {
          open: emptyState({ iconName: 'sparkle', title: 'No open issues', text: 'Everything is wrapped up. Got an idea for the community?', action: `<button class="btn btn--primary" data-action="new-issue">${icon('plus')} Start an issue</button>` }),
          mine: emptyState({ iconName: 'user', title: 'You’re not involved in anything yet', text: 'Pick an open issue and add a task, or start your own.', action: `<button class="btn btn--secondary" data-action="set-filter" data-filter="open">Browse open issues</button>` }),
          closed: emptyState({ iconName: 'lock', title: 'No closed issues', text: 'Issues show up here once their organizer marks them as done.' }),
          all: emptyState({ iconName: 'sparkle', title: 'No issues yet', text: 'Be the first to rally the community.', action: `<button class="btn btn--primary" data-action="new-issue">${icon('plus')} Start an issue</button>` }),
        }[state.issueFilter];
    return;
  }
  host.innerHTML = `<div class="issue-grid">${list.map(issueCard).join('')}</div>`;
}

function issueCard(i, idx = 0) {
  const pct = i.task_count ? Math.round((i.done_count / i.task_count) * 100) : 0;
  const when = parseLocal(i.starts_at)?.date;
  const mine = i.owner.id === state.me.id;
  return `
    <a class="issue-card ${i.is_open ? '' : 'is-closed'}" href="#/issues/${i.id}" style="animation-delay:${Math.min(idx, 8) * 50}ms;--k:${coverColor(i.id)}">
      <div class="issue-card__cover">
        ${coverArt(i.id)}
        <span class="cover-badge">${monogram(i.title)}</span>
        ${when ? `<div class="date-tile" aria-hidden="true"><span>${when.toLocaleDateString(undefined, { month: 'short' })}</span><strong>${when.getDate()}</strong></div>` : ''}
        ${i.is_open ? '' : `<span class="cover-closed">${icon('lock', 'icon--sm')} Closed</span>`}
      </div>
      <div class="issue-card__body">
        <div class="pills">${statusPill(i.is_open)}</div>
        <h3 class="issue-card__title">${esc(i.title)}</h3>
        ${i.description ? `<p class="issue-card__desc">${esc(i.description)}</p>` : ''}
        ${
          i.starts_at || i.location
            ? `<ul class="meta">
                ${i.starts_at ? `<li>${icon('calendar')}<span>${esc(formatWhen(i.starts_at))}</span></li>` : ''}
                ${i.location ? `<li>${icon('pin')}<span>${esc(i.location)}</span></li>` : ''}
              </ul>`
            : ''
        }
        <div>
          <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Tasks done"><span style="width:${pct}%"></span></div>
          <span class="progress-label">${i.task_count ? `<strong>${i.done_count}</strong> of ${plural(i.task_count, 'task')} done` : i.is_open ? 'No tasks yet. Be the first to pitch in!' : 'No tasks'}</span>
        </div>
        <div class="issue-card__foot">
          <span class="by">${avatar(i.owner, 'xs')}<span>${mine ? 'Organized by you' : `by ${esc(i.owner.name)}`}</span></span>
          <span class="foot-right">
            ${i.comment_count ? `<span class="mini-count" title="${plural(i.comment_count, 'comment')}">${icon('message', 'icon--sm')}${i.comment_count}</span>` : ''}
            ${avatarStack(i.contributors)}
          </span>
        </div>
      </div>
    </a>`;
}

/* ==========================================================================
   Issue detail
   ========================================================================== */

async function IssuePage(view, seq, id) {
  if (!state.issue || state.issue.issue.id !== id) {
    state.issue = null;
    state.openComments.clear();
    view.innerHTML = `<div class="skeleton skeleton--hero"></div><div class="skeleton skeleton--row"></div><div class="skeleton skeleton--row"></div>`;
  }
  const result = await data.issue(id);
  if (seq !== renderSeq) return;
  state.issue = result;
  drawIssue();
}

async function reloadIssue() {
  if (!state.issue) return;
  state.issue = await data.issue(state.issue.issue.id);
  drawIssue();
}

function drawIssue() {
  const view = $('#view');
  const { issue, tasks } = state.issue;
  const me = state.me;
  const isOwner = issue.owner.id === me.id;
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  // Contributors with task counts.
  const people = new Map();
  for (const t of tasks) {
    const p = people.get(t.owner.id) || { ...t.owner, n: 0 };
    p.n += 1;
    people.set(t.owner.id, p);
  }

  view.innerHTML = `
    <a class="back" href="#/">${icon('arrowLeft', 'icon--sm')} All issues</a>
    <div class="issue-layout">
      <div class="issue-main">
        <article class="issue-hero ${issue.is_open ? '' : 'is-closed'}" style="--k:${coverColor(issue.id)}">
          <div class="issue-hero__band">${coverArt(issue.id)}<span class="cover-badge cover-badge--lg">${monogram(issue.title)}</span></div>
          <div class="issue-hero__body">
            <div class="issue-hero__top">
              <div class="pills">${statusPill(issue.is_open)}</div>
              ${
                isOwner
                  ? `<div class="owner-controls">
                      <label class="switch" title="${issue.is_open ? 'Switch off when this issue is over' : 'Switch on to reopen this issue'}">
                        <input type="checkbox" data-change="toggle-open" ${issue.is_open ? 'checked' : ''}>
                        <span class="switch__track"></span>
                        <span class="switch__text">${issue.is_open ? 'Open' : 'Closed'}</span>
                      </label>
                      <button class="icon-btn icon-btn--bordered" data-action="edit-issue" aria-label="Edit issue" title="Edit issue">${icon('edit')}</button>
                    </div>`
                  : ''
              }
            </div>
            <h1 class="display">${esc(issue.title)}</h1>
            <div class="meta-row">
              ${issue.starts_at ? `<span>${icon('calendar')}${esc(formatWhen(issue.starts_at))} <em class="rel">${esc(relativeDay(issue.starts_at))}</em></span>` : ''}
              ${issue.location ? `<span>${icon('pin')}${esc(issue.location)}</span>` : ''}
              <span>${icon('clock')}Posted ${esc(timeAgo(issue.created_at))}</span>
            </div>
            ${issue.description ? `<p class="issue-desc">${esc(issue.description)}</p>` : isOwner ? `<p class="issue-desc muted">No description yet. <button class="link-btn" data-action="edit-issue">Add one</button></p>` : ''}
          </div>
        </article>

        ${
          issue.is_open
            ? ''
            : `<div class="banner">${icon('lock')}<span>${
                isOwner
                  ? 'You closed this issue, so new tasks are paused. Flip the switch to reopen it.'
                  : 'This issue is closed. New tasks are paused, but you can still comment.'
              }</span></div>`
        }

        <section class="section">
          <div class="section-head">
            <h2 class="section-title"><span class="title-badge">${icon('check')}</span>Tasks <span class="count">${tasks.length}</span></h2>
            ${
              tasks.length
                ? `<div class="progress-inline"><div class="progress"><span style="width:${pct}%"></span></div><span>${done}/${tasks.length} done</span></div>`
                : ''
            }
          </div>

          ${
            issue.is_open
              ? `<form class="composer" data-form="add-task">
                  ${avatar(me, 'sm')}
                  <label class="sr-only" for="new-task">New task</label>
                  <input id="new-task" class="input" name="title" placeholder="${esc(taskPlaceholder(issue))}" maxlength="200" required autocomplete="off">
                  <button class="btn btn--primary" type="submit">${icon('plus')} Add task</button>
                  <div class="form-error" hidden></div>
                </form>`
              : ''
          }

          ${
            tasks.length
              ? `<ul class="task-list">${tasks.map((t) => taskHTML(t, issue)).join('')}</ul>`
              : emptyState({
                  iconName: 'clipboard',
                  title: 'No tasks yet',
                  text: issue.is_open ? 'Add the first one above. What can you bring, build or help with?' : 'Nobody added tasks before this issue closed.',
                })
          }
        </section>
      </div>

      <aside class="issue-side">
        <div class="side-card">
          <h3>Organizer</h3>
          <a class="person" href="#/members/${issue.owner.id}">
            ${avatar(issue.owner, 'md')}
            <span><strong>${esc(issue.owner.name)}${isOwner ? ' <span class="you-chip">You</span>' : ''}</strong><small>Created this issue</small></span>
          </a>
          <div class="contact-list">${contactLinks(issue.owner)}</div>
        </div>
        <div class="side-card">
          <h3>Pitching in <span class="count count--sm">${people.size}</span></h3>
          ${
            people.size
              ? `<ul class="people-list">${[...people.values()]
                  .map(
                    (p) => `<li><a href="#/members/${p.id}">${avatar(p, 'sm')}<span>${esc(p.name)}${p.id === me.id ? ' <span class="you-chip">You</span>' : ''}</span><span class="n">${plural(p.n, 'task')}</span></a></li>`
                  )
                  .join('')}</ul>`
              : `<p class="muted small">No one yet. Be the first!</p>`
          }
        </div>
      </aside>
    </div>`;

  // Restore focus for inline editors.
  if (state.editing) {
    const el = $(`#${state.editing.type}-${state.editing.id} .inline-edit .input`);
    if (el) {
      el.focus();
      el.setSelectionRange?.(el.value.length, el.value.length);
    }
  }
}

function taskPlaceholder(issue) {
  const t = issue.title.toLowerCase();
  if (/potluck|dinner|party|picnic|bbq|barbecue/.test(t)) return 'What are you bringing? e.g. “I’ll bring the chips”';
  if (/clean/.test(t)) return 'How will you help? e.g. “Bringing trash bags”';
  return 'How will you pitch in? e.g. “I can handle the flyers”';
}

function taskHTML(t, issue) {
  const me = state.me;
  const canEdit = t.owner.id === me.id;
  const canDelete = canEdit; // only the task's owner may change or remove it
  const editing = state.editing?.type === 'task' && state.editing.id === t.id;
  const showComments = state.openComments.has(t.id);
  const n = t.comments.length;

  const check = canEdit
    ? `<button class="check ${t.done ? 'is-checked' : ''}" data-action="toggle-done" data-id="${t.id}" aria-pressed="${t.done}" aria-label="${t.done ? 'Mark as not done' : 'Mark as done'}" title="${t.done ? 'Mark as not done' : 'Mark as done'}">${icon('check')}</button>`
    : `<span class="check check--static ${t.done ? 'is-checked' : ''}" title="${t.done ? 'Done' : 'Not done yet'}">${icon('check')}</span>`;

  return `
    <li class="task ${t.done ? 'is-done' : ''} ${showComments ? 'has-comments-open' : ''}" id="task-${t.id}" style="--oc:${esc(t.owner.color)}">
      <div class="task__row">
        ${check}
        <div class="task__body">
          ${
            editing
              ? `<form class="inline-edit" data-form="edit-task" data-id="${t.id}">
                  <input class="input" name="title" value="${esc(t.title)}" maxlength="200" required aria-label="Task">
                  <div class="inline-edit__actions">
                    <button type="button" class="btn btn--ghost btn--sm" data-action="cancel-edit">Cancel</button>
                    <button type="submit" class="btn btn--primary btn--sm">Save</button>
                  </div>
                  <div class="form-error" hidden></div>
                </form>`
              : `<p class="task__title">${esc(t.title)}</p>`
          }
          <div class="task__meta">
            <a href="#/members/${t.owner.id}" class="task__owner">${avatar(t.owner, 'xs')}${t.owner.id === me.id ? 'You' : esc(t.owner.name)}</a>
            <span aria-hidden="true">·</span><span>${esc(timeAgo(t.created_at))}${t.edited ? ' · edited' : ''}</span>
            ${t.done ? `<span class="done-tag">${icon('check', 'icon--sm')}Done</span>` : ''}
          </div>
        </div>
        <div class="task__actions">
          <button class="chip-btn ${showComments ? 'is-active' : ''}" data-action="toggle-comments" data-id="${t.id}" aria-expanded="${showComments}" aria-label="${plural(n, 'comment')}">
            ${icon('message')}<span>${n || 'Comment'}</span>
          </button>
          ${canEdit && !editing ? `<button class="icon-btn icon-btn--sm hover-reveal" data-action="edit-task" data-id="${t.id}" aria-label="Edit task" title="Edit">${icon('edit')}</button>` : ''}
          ${canDelete ? `<button class="icon-btn icon-btn--sm icon-btn--danger hover-reveal" data-action="delete-task" data-id="${t.id}" aria-label="Delete task" title="Delete">${icon('trash')}</button>` : ''}
        </div>
      </div>
      ${showComments ? commentsHTML(t) : ''}
    </li>`;
}

function commentsHTML(t) {
  return `
    <div class="comments">
      ${t.comments.length ? t.comments.map(commentHTML).join('') : `<p class="comments__empty">No comments yet. Ask a question or say thanks.</p>`}
      <form class="comment-composer" data-form="add-comment" data-task-id="${t.id}">
        ${avatar(state.me, 'sm')}
        <input class="input" name="body" placeholder="Write a comment…" maxlength="1000" required autocomplete="off" aria-label="Write a comment">
        <button class="btn btn--primary btn--round" type="submit" aria-label="Post comment">${icon('send')}</button>
        <div class="form-error" hidden></div>
      </form>
    </div>`;
}

function commentHTML(c) {
  const mine = c.author.id === state.me.id;
  const editing = state.editing?.type === 'comment' && state.editing.id === c.id;
  return `
    <div class="comment" id="comment-${c.id}">
      <a href="#/members/${c.author.id}" aria-label="${esc(c.author.name)}">${avatar(c.author, 'sm')}</a>
      <div class="comment__bubble">
        <div class="comment__head">
          <a href="#/members/${c.author.id}" class="comment__author">${mine ? 'You' : esc(c.author.name)}</a>
          <span class="comment__time">${esc(timeAgo(c.created_at))}${c.edited ? ' · edited' : ''}</span>
          ${
            mine && !editing
              ? `<span class="comment__actions">
                  <button class="icon-btn icon-btn--xs hover-reveal" data-action="edit-comment" data-id="${c.id}" aria-label="Edit comment" title="Edit">${icon('edit')}</button>
                  <button class="icon-btn icon-btn--xs icon-btn--danger hover-reveal" data-action="delete-comment" data-id="${c.id}" aria-label="Delete comment" title="Delete">${icon('trash')}</button>
                </span>`
              : ''
          }
        </div>
        ${
          editing
            ? `<form class="inline-edit" data-form="edit-comment" data-id="${c.id}">
                <textarea class="input" name="body" rows="2" maxlength="1000" required aria-label="Comment">${esc(c.body)}</textarea>
                <div class="inline-edit__actions">
                  <button type="button" class="btn btn--ghost btn--sm" data-action="cancel-edit">Cancel</button>
                  <button type="submit" class="btn btn--primary btn--sm">Save</button>
                </div>
                <div class="form-error" hidden></div>
              </form>`
            : `<p class="comment__body">${esc(c.body)}</p>`
        }
      </div>
    </div>`;
}

function issueModal(existing) {
  const i = existing || { title: '', description: '', location: '', starts_at: '' };
  const [date = '', time = ''] = (i.starts_at || '').split('T');
  openModal({
    title: existing ? 'Edit issue' : 'Start a new issue',
    subtitle: existing ? '' : 'Anything your community wants to get done: a gathering, a fundraiser, a project, a question.',
    submitLabel: existing ? 'Save changes' : 'Create issue',
    body: `
      ${field({ label: 'Title', name: 'title', value: i.title, required: true, placeholder: 'e.g. Spring fundraiser, Study group, Team potluck', attrs: 'maxlength="120"' })}
      <div class="field-row">
        ${field({ label: 'Date', name: 'date', type: 'date', value: date })}
        ${field({ label: 'Time', name: 'time', type: 'time', value: time })}
      </div>
      ${field({ label: 'Location', name: 'location', value: i.location, placeholder: 'e.g. Room 204, Zoom, Central Park', attrs: 'maxlength="160"' })}
      ${textarea({ label: 'Description', name: 'description', value: i.description, placeholder: 'What is it, and how can people help?', rows: 5, attrs: 'maxlength="4000"' })}
    `,
    async onSubmit(fd) {
      const d = fd.get('date');
      const t = fd.get('time');
      if (t && !d) throw new Error('Add a date to go with the time.');
      const payload = {
        title: String(fd.get('title')).trim(),
        starts_at: d ? (t ? `${d}T${t}` : d) : null,
        location: String(fd.get('location')).trim(),
        description: String(fd.get('description')).trim(),
      };
      if (!payload.title) throw new Error('Please give the issue a title.');
      if (existing) {
        await data.updateIssue(existing.id, payload);
        await reloadIssue();
        toast('Issue updated');
      } else {
        const created = await data.createIssue(payload);
        state.issues = null;
        location.hash = `#/issues/${created.id}`;
        toast('Issue created. Now add some tasks!');
        confetti(window.innerWidth / 2, window.innerHeight / 3, 140);
      }
    },
  });
}

/* ==========================================================================
   Members
   ========================================================================== */

async function MembersPage(view, seq) {
  if (!state.members) view.innerHTML = skeletonCards(6);
  const members = await data.members();
  if (seq !== renderSeq) return;
  state.members = members;
  view.innerHTML = `
    <section class="hero hero--compact">
      <div class="hero__orbs" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="hero__row">
      <div>
        <p class="hero__eyebrow">Directory</p>
        <h1 class="hero__title">Your <em>community</em></h1>
        <p class="hero__sub">${plural(members.length, 'member')} on Common Ground. Reach out, say hi, coordinate.</p>
      </div>
      <label class="search search--wide">
        ${icon('search')}
        <span class="sr-only">Search members</span>
        <input class="input" type="search" placeholder="Search by name, email or phone…" value="${esc(state.memberQuery)}" data-input="member-search">
      </label>
      </div>
    </section>
    <div id="member-grid"></div>`;
  drawMemberGrid();
}

function drawMemberGrid() {
  const host = $('#member-grid');
  if (!host) return;
  const q = state.memberQuery.trim().toLowerCase();
  const list = state.members.filter((m) => !q || [m.name, m.email, m.phone, m.bio].some((s) => s && s.toLowerCase().includes(q)));
  host.innerHTML = list.length
    ? `<div class="member-grid">${list.map((m) => memberCard(m)).join('')}</div>`
    : emptyState({ iconName: 'users', title: 'No members found', text: `Nobody matches “${esc(state.memberQuery)}”.` });
}

function memberCard(m, { preview = false } = {}) {
  const isMe = m.id === state.me.id;
  const Top = preview ? 'div' : 'a';
  return `
    <article class="member-card" style="--c:${esc(m.color)}">
      <div class="member-card__cover" aria-hidden="true"></div>
      <${Top} class="member-card__top" ${preview ? '' : `href="#/members/${m.id}"`}>
        ${avatar(m, 'lg')}
        <div class="min0">
          <h3 class="member-card__name"><span>${esc(m.name || 'Your name')}</span>${isMe ? '<span class="you-chip">You</span>' : ''}</h3>
          <p class="muted small">Member since ${esc(joined(m.created_at))}</p>
        </div>
      </${Top}>
      <p class="member-card__bio">${m.bio ? esc(m.bio) : '<span class="muted">No bio yet.</span>'}</p>
      <div class="contact-list">${contactLinks(m)}</div>
      ${
        preview
          ? ''
          : `<footer class="member-card__foot">
              <span>${icon('grid', 'icon--sm')}${plural(m.issue_count, 'issue')} organized</span>
              <span>${icon('check', 'icon--sm')}${plural(m.task_count, 'task')}</span>
            </footer>`
      }
    </article>`;
}

async function MemberPage(view, seq, id) {
  view.innerHTML = `<div class="skeleton skeleton--hero"></div><div class="skeleton skeleton--row"></div>`;
  const { member: m, issues, tasks } = await data.member(id);
  if (seq !== renderSeq) return;
  const isMe = m.id === state.me.id;
  view.innerHTML = `
    <a class="back" href="#/members">${icon('arrowLeft', 'icon--sm')} All members</a>
    <section class="profile-hero" style="--c:${esc(m.color)}">
      <div class="profile-hero__band"></div>
      <div class="profile-hero__body">
        ${avatar(m, 'xl')}
        <div class="profile-hero__info">
          <h1 class="display">${esc(m.name)} ${isMe ? '<span class="you-chip you-chip--lg">You</span>' : ''}</h1>
          <p class="muted">Member since ${esc(joined(m.created_at))}</p>
        </div>
        ${isMe ? `<a class="btn btn--secondary" href="#/profile">${icon('edit')} Edit profile</a>` : ''}
      </div>
      ${m.bio ? `<p class="profile-hero__bio">${esc(m.bio)}</p>` : ''}
      <div class="profile-hero__contact">${contactLinks(m, 'contact-link--pill')}</div>
    </section>

    <div class="two-col">
      <section class="panel">
        <h2 class="panel__title">Organizing <span class="count">${issues.length}</span></h2>
        ${
          issues.length
            ? `<ul class="row-list">${issues
                .map(
                  (i) => `
              <li><a class="row-item" href="#/issues/${i.id}">
                <span class="dot" style="background:${coverColor(i.id)}"></span>
                <span class="row-item__main"><span class="row-item__title">${esc(i.title)}</span><span class="row-item__sub">${i.starts_at ? `${esc(formatWhen(i.starts_at))} · ` : ''}${plural(i.task_count, 'task')}</span></span>
                ${statusPill(i.is_open)}
              </a></li>`
                )
                .join('')}</ul>`
            : `<p class="muted small panel__empty">${isMe ? 'You haven’t' : `${esc(firstName(m.name))} hasn’t`} organized any issues yet.</p>`
        }
      </section>
      <section class="panel">
        <h2 class="panel__title">Pitching in on <span class="count">${tasks.length}</span></h2>
        ${
          tasks.length
            ? `<ul class="row-list">${tasks
                .map(
                  (t) => `
              <li><a class="row-item" href="#/issues/${t.issue.id}">
                <span class="check check--static check--sm ${t.done ? 'is-checked' : ''}">${icon('check')}</span>
                <span class="row-item__main"><span class="row-item__title ${t.done ? 'is-done' : ''}">${esc(t.title)}</span><span class="row-item__sub">for ${esc(t.issue.title)}${t.issue.is_open ? '' : ' (closed)'}</span></span>
              </a></li>`
                )
                .join('')}</ul>`
            : `<p class="muted small panel__empty">${isMe ? 'You haven’t' : `${esc(firstName(m.name))} hasn’t`} taken on any tasks yet.</p>`
        }
      </section>
    </div>`;
}

/* ==========================================================================
   Profile
   ========================================================================== */

function ProfilePage(view) {
  const me = state.me;
  view.innerHTML = `
    <section class="hero hero--compact">
      <div class="hero__orbs" aria-hidden="true"><span></span><span></span><span></span></div>
      <div>
        <p class="hero__eyebrow">Your account</p>
        <h1 class="hero__title">Profile &amp; <em>settings</em></h1>
        <p class="hero__sub">Your name, email and phone number are visible to other members so people can reach you.</p>
      </div>
    </section>
    <div class="profile-layout">
      <div class="stack-lg">
        <section class="panel">
          <h2 class="panel__title">${icon('user')} Contact information</h2>
          <p class="panel__sub">Keep this current so people can coordinate with you.</p>
          <form class="form-grid" data-form="profile" data-input="profile-preview">
            ${field({ label: 'Full name', name: 'name', value: me.name, required: true, attrs: 'maxlength="80" autocomplete="name"', cls: 'field--full' })}
            ${field({ label: 'Contact email', name: 'email', type: 'email', value: me.email, required: true, attrs: 'autocomplete="email"', hint: `Shown to members. You log in with ${esc(state.authEmail)}.` })}
            ${field({ label: 'Phone', name: 'phone', type: 'tel', value: me.phone, placeholder: '(555) 010-1234', attrs: 'maxlength="30" autocomplete="tel"' })}
            ${textarea({ label: 'About you', name: 'bio', value: me.bio, placeholder: 'A sentence or two: what street you’re on, what you’re good at, how you like to help…', rows: 3, attrs: 'maxlength="500"', cls: 'field--full' })}
            <fieldset class="field field--full">
              <legend class="field__label">Avatar color</legend>
              <div class="swatches">
                ${COLORS.map((c) => `<label class="swatch" style="--c:${c}"><input type="radio" name="color" value="${c}" ${c === me.color ? 'checked' : ''} aria-label="Color ${c}"><span></span></label>`).join('')}
              </div>
            </fieldset>
            <div class="form-error field--full" hidden></div>
            <div class="form-actions field--full"><button class="btn btn--primary" type="submit">Save changes</button></div>
          </form>
        </section>

        <section class="panel">
          <h2 class="panel__title">${icon('key')} Password</h2>
          <p class="panel__sub">Changing your password signs you out on other devices.</p>
          <form class="form-grid" data-form="password">
            ${field({ label: 'Current password', name: 'current_password', type: 'password', required: true, attrs: 'autocomplete="current-password"', cls: 'field--full' })}
            ${field({ label: 'New password', name: 'new_password', type: 'password', required: true, placeholder: 'At least 8 characters', attrs: 'minlength="8" autocomplete="new-password"' })}
            ${field({ label: 'Confirm new password', name: 'confirm_password', type: 'password', required: true, attrs: 'minlength="8" autocomplete="new-password"' })}
            <div class="form-error field--full" hidden></div>
            <div class="form-actions field--full"><button class="btn btn--secondary" type="submit">Update password</button></div>
          </form>
        </section>

        <section class="panel panel--note">
          <h2 class="panel__title">${icon('shield')} Who can change what</h2>
          <ul class="rules">
            <li>Only <strong>you</strong> can edit your profile.</li>
            <li>Only an issue’s <strong>organizer</strong> can edit it or close it. Issues are never deleted; closing keeps the history.</li>
            <li>Only a task’s <strong>owner</strong> can edit it, check it off or delete it.</li>
            <li>Only a comment’s <strong>author</strong> can edit or delete it.</li>
            <li>A task other members have commented on can’t be deleted.</li>
          </ul>
        </section>
      </div>

      <aside class="profile-preview">
        <p class="eyebrow">Live preview</p>
        <div id="preview-card">${memberCard(me, { preview: true })}</div>
        <p class="muted small">This is how you appear to other members.</p>
      </aside>
    </div>`;
}

function updateProfilePreview(form) {
  const fd = new FormData(form);
  const m = {
    ...state.me,
    name: String(fd.get('name') || '').trim(),
    email: String(fd.get('email') || '').trim(),
    phone: String(fd.get('phone') || '').trim(),
    bio: String(fd.get('bio') || '').trim(),
    color: fd.get('color') || state.me.color,
  };
  $('#preview-card').innerHTML = memberCard(m, { preview: true });
}

/* ==========================================================================
   Actions (clicks), forms (submits), changes and inputs
   ========================================================================== */

const findTask = (id) => state.issue?.tasks.find((t) => t.id === id);

const actions = {
  reload: () => render(),

  'auth-mode': (el) => {
    state.authMode = el.dataset.mode;
    renderAuth();
  },

  'fill-demo': () => {
    const f = $('form[data-form="login"]');
    f.email.value = 'jane@example.com';
    f.password.value = 'community123';
    f.requestSubmit();
  },

  'toggle-menu': (el) => {
    const menu = $('#me-menu');
    menu.hidden = !menu.hidden;
    el.setAttribute('aria-expanded', String(!menu.hidden));
    if (!menu.hidden) menu.querySelector('.menu__item')?.focus();
  },

  install: async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    closeMenu();
  },

  logout: async () => {
    await sb.auth.signOut();
    state.me = null;
    state.authMode = 'login';
    resetState();
    lastPath = '';
    history.replaceState(null, '', '#/');
    render();
    toast('You’ve been logged out. See you soon!');
  },

  'new-issue': () => issueModal(),
  'edit-issue': () => issueModal(state.issue.issue),

  'set-filter': (el) => {
    state.issueFilter = el.dataset.filter;
    drawIssues();
  },

  'toggle-done': async (el) => {
    const t = findTask(Number(el.dataset.id));
    if (!t) return;
    const rect = el.getBoundingClientRect();
    t.done = !t.done; // optimistic
    drawIssue();
    if (t.done) confetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    try {
      await data.updateTask(t.id, { done: t.done });
    } catch (err) {
      t.done = !t.done;
      drawIssue();
      throw err;
    }
    if (t.done) toast('Nice work! Task marked done.');
  },

  'edit-task': (el) => {
    state.editing = { type: 'task', id: Number(el.dataset.id) };
    drawIssue();
  },

  'edit-comment': (el) => {
    state.editing = { type: 'comment', id: Number(el.dataset.id) };
    drawIssue();
  },

  'cancel-edit': () => {
    state.editing = null;
    drawIssue();
  },

  'delete-task': async (el) => {
    const t = findTask(Number(el.dataset.id));
    if (!t) return;
    if (t.comments.some((c) => c.author.id !== state.me.id)) {
      toast('Other members have commented on this task, so it can’t be deleted. You can still edit it or check it off.', 'error');
      return;
    }
    const ok = await confirmDialog({
      title: 'Delete this task?',
      message: `“${esc(t.title)}”${t.comments.length ? ` and your ${plural(t.comments.length, 'comment')} on it` : ''} will be removed.`,
      confirmLabel: 'Delete task',
    });
    if (!ok) return;
    await data.deleteTask(t.id);
    state.openComments.delete(t.id);
    await reloadIssue();
    toast('Task deleted');
  },

  'toggle-comments': (el) => {
    const id = Number(el.dataset.id);
    if (state.openComments.has(id)) state.openComments.delete(id);
    else state.openComments.add(id);
    drawIssue();
    if (state.openComments.has(id)) $(`form[data-form="add-comment"][data-task-id="${id}"] .input`)?.focus();
  },

  'delete-comment': async (el) => {
    const ok = await confirmDialog({ title: 'Delete comment?', message: 'This comment will be permanently removed.', confirmLabel: 'Delete' });
    if (!ok) return;
    await data.deleteComment(Number(el.dataset.id));
    await reloadIssue();
    toast('Comment deleted');
  },
};

const forms = {
  async login(form) {
    const { data: res, error } = await sb.auth.signInWithPassword({
      email: form.email.value.trim().toLowerCase(),
      password: form.password.value,
    });
    if (error) throw new Error(/invalid/i.test(error.message) ? 'That email and password combination didn’t work.' : error.message);
    await startSession(res.session);
    toast(`Welcome back, ${firstName(state.me.name)}!`);
  },

  async signup(form) {
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    if (phone && !PHONE_RE.test(phone)) throw new Error('Phone numbers can only contain digits, spaces and + ( ) - .');
    if (form.password.value.length < 8) throw new Error('Password must be at least 8 characters.');
    const { data: res, error } = await sb.auth.signUp({
      email: form.email.value.trim().toLowerCase(),
      password: form.password.value,
      options: { data: { name, phone, color: COLORS[Math.floor(Math.random() * COLORS.length)] } },
    });
    if (error) {
      throw new Error(/already registered|already exists/i.test(error.message) ? 'An account with that email already exists. Try logging in instead.' : error.message);
    }
    // With email confirmation off, Supabase returns a session right away. A
    // repeated sign-up for an existing email returns a user with no identities.
    if (res.user && Array.isArray(res.user.identities) && res.user.identities.length === 0) {
      throw new Error('An account with that email already exists. Try logging in instead.');
    }
    if (!res.session) {
      toast('Check your email to confirm your account, then log in.');
      state.authMode = 'login';
      renderAuth();
      return;
    }
    await startSession(res.session);
    toast(`Welcome to Common Ground, ${firstName(state.me.name)}!`);
  },

  async 'add-task'(form) {
    const title = form.title.value.trim();
    if (!title) throw new Error('Describe the task first.');
    await data.addTask(state.issue.issue.id, title);
    await reloadIssue();
    $('#new-task')?.focus();
    toast('Task added. Thanks for pitching in!');
  },

  async 'edit-task'(form) {
    const title = form.title.value.trim();
    if (!title) throw new Error('A task can’t be empty.');
    await data.updateTask(Number(form.dataset.id), { title });
    state.editing = null;
    await reloadIssue();
    toast('Task updated');
  },

  async 'add-comment'(form) {
    const taskId = Number(form.dataset.taskId);
    const body = form.body.value.trim();
    if (!body) throw new Error('Write something first.');
    await data.addComment(taskId, body);
    await reloadIssue();
    $(`form[data-form="add-comment"][data-task-id="${taskId}"] .input`)?.focus();
  },

  async 'edit-comment'(form) {
    const body = form.body.value.trim();
    if (!body) throw new Error('A comment can’t be empty.');
    await data.updateComment(Number(form.dataset.id), body);
    state.editing = null;
    await reloadIssue();
    toast('Comment updated');
  },

  async profile(form) {
    const fd = new FormData(form);
    const patch = {
      name: String(fd.get('name')).trim(),
      email: String(fd.get('email')).trim().toLowerCase(),
      phone: String(fd.get('phone')).trim(),
      bio: String(fd.get('bio')).trim(),
      color: fd.get('color') || state.me.color,
    };
    if (!patch.name) throw new Error('Name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) throw new Error('Please enter a valid email address.');
    if (patch.phone && !PHONE_RE.test(patch.phone)) throw new Error('Phone numbers can only contain digits, spaces and + ( ) - .');
    state.me = await data.updateProfile(patch);
    state.members = null;
    renderShell('profile');
    toast('Profile saved');
  },

  async password(form) {
    if (form.new_password.value.length < 8) throw new Error('New password must be at least 8 characters.');
    if (form.new_password.value !== form.confirm_password.value) throw new Error('The new passwords don’t match.');
    // Re-verify the current password before changing it.
    const check = await sb.auth.signInWithPassword({ email: state.authEmail, password: form.current_password.value });
    if (check.error) throw new Error('Your current password is incorrect.');
    const { error } = await sb.auth.updateUser({ password: form.new_password.value });
    if (error) throw new Error(error.message);
    form.reset();
    toast('Password updated');
  },
};

const changes = {
  async 'toggle-open'(el) {
    const open = el.checked;
    const rect = el.closest('.switch').getBoundingClientRect();
    el.disabled = true;
    try {
      await data.updateIssue(state.issue.issue.id, { is_open: open });
    } catch (err) {
      el.checked = !open;
      el.disabled = false;
      throw err;
    }
    state.issues = null;
    await reloadIssue();
    if (!open) confetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 160);
    toast(open ? 'Issue reopened' : 'Issue closed. Nice work, everyone!');
  },
};

const inputs = {
  'issue-search': (el) => {
    state.issueQuery = el.value;
    drawIssueGrid();
  },
  'member-search': (el) => {
    state.memberQuery = el.value;
    drawMemberGrid();
  },
  'profile-preview': (el) => updateProfilePreview(el.closest('form')),
};

/* ---------- Global listeners ---------- */

document.addEventListener('click', async (e) => {
  if (!e.target.closest('.me')) closeMenu();
  const el = e.target.closest('[data-action]');
  if (!el || !actions[el.dataset.action]) return;
  e.preventDefault();
  try {
    await actions[el.dataset.action](el, e);
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.addEventListener('submit', async (e) => {
  const form = e.target;
  const handler = forms[form.dataset?.form];
  if (!handler) return;
  e.preventDefault();
  if (form.dataset.busy) return;
  form.dataset.busy = '1';
  const btn = form.querySelector('[type="submit"]');
  if (btn) btn.disabled = true;
  setFormError(form, '');
  try {
    await handler(form);
  } catch (err) {
    if (!setFormError(form, err.message)) toast(err.message, 'error');
  } finally {
    delete form.dataset.busy;
    if (btn) btn.disabled = false;
  }
});

document.addEventListener('change', async (e) => {
  const el = e.target.closest('[data-change]');
  if (!el || !changes[el.dataset.change]) return;
  try {
    await changes[el.dataset.change](el, e);
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (el && inputs[el.dataset.input]) inputs[el.dataset.input](el, e);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modalClose) modalClose(true);
  else if (state.editing) {
    state.editing = null;
    drawIssue();
  } else closeMenu();
});

window.addEventListener('hashchange', render);

/* ---------- Session & boot ---------- */

async function startSession(session) {
  state.authEmail = session.user.email;
  state.me = await data.loadMe(session.user.id);
  render();
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  toast('Common Ground is installed!');
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

(async function boot() {
  if (!CONFIGURED) return render();
  try {
    const { data: res } = await sb.auth.getSession();
    if (res.session) {
      await startSession(res.session);
      return;
    }
  } catch {
    state.me = null;
  }
  render();
})();

if (sb) {
  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' && state.me) {
      state.me = null;
      resetState();
      render();
    }
  });
}
