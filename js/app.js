/* ============================================================
   app.js  —  Navigation, Modals, Project CRUD, Toast, Init
   ============================================================ */

/* ── Page titles per view ───────────────────────────────────── */
const VIEW_META = {
  dashboard: ['Dashboard',    'Overview of your project workspace'],
  kanban:    ['Kanban Board', 'Drag tasks across columns to update status'],
  team:      ['Team',         'Manage team members and workload'],
  reports:   ['Reports',      'Progress analytics and timeline']
};

/* ── View switcher ──────────────────────────────────────────── */
function showView(name, el) {
  /* Hide all views */
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  /* Deactivate all nav items */
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  /* Show target view */
  document.getElementById('view-' + name).classList.add('active');
  if (el) el.classList.add('active');

  /* Update topbar text */
  const [title, sub] = VIEW_META[name];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-sub').textContent   = sub;

  /* Render the relevant module */
  if (name === 'dashboard') renderDashboard();
  if (name === 'kanban')    renderKanban();
  if (name === 'team')      renderTeam();
  if (name === 'reports')   renderReports();
}

/* ── Modal helpers ──────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* Close modal when clicking outside */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

/* ── Toast notification ─────────────────────────────────────── */
let toastTimer = null;

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  const dot   = document.getElementById('toast-dot');
  document.getElementById('toast-msg').textContent = msg;

  const colors = { green: 'var(--accent2)', red: 'var(--danger)', amber: 'var(--accent3)', blue: 'var(--accent)' };
  dot.style.background = colors[type] || colors.blue;

  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ── Project sidebar + task select population ───────────────── */
let selectedProjectColor = '#7B6CF6';

function renderProjects() {
  /* Sidebar list */
  document.getElementById('project-list').innerHTML =
    data.projects.map(p => `
      <div class="project-item active">
        <div class="dot" style="background:${p.color}"></div>
        ${p.name}
      </div>`).join('') +
    `<div class="project-item" onclick="openModal('project-modal')">
       <div class="dot" style="background:var(--text3);border:1px dashed var(--text3)"></div>
       New project
     </div>`;

  /* Task modal project select */
  document.getElementById('t-project').innerHTML =
    data.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

/* ── Populate task modal selects ────────────────────────────── */
function populateTaskSelects() {
  /* Members dropdown */
  document.getElementById('t-member').innerHTML =
    data.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

  /* Projects dropdown */
  document.getElementById('t-project').innerHTML =
    data.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

/* ── Project creation ───────────────────────────────────────── */
function selectColor(hex, el) {
  selectedProjectColor = hex;
  document.querySelectorAll('.color-opt').forEach(x => x.style.border = 'none');
  el.style.border = '2px solid white';
}

function saveProject() {
  const name = document.getElementById('pr-name').value.trim();
  if (!name) {
    showToast('Project name is required', 'red');
    return;
  }

  data.projects.push({
    id:    data.nextId++,
    name,
    color: selectedProjectColor,
    desc:  document.getElementById('pr-desc').value,
    start: document.getElementById('pr-start').value,
    end:   document.getElementById('pr-end').value
  });

  /* Clear inputs */
  document.getElementById('pr-name').value  = '';
  document.getElementById('pr-desc').value  = '';
  document.getElementById('pr-start').value = '';
  document.getElementById('pr-end').value   = '';

  save();
  closeModal('project-modal');
  renderProjects();
  showToast('Project created!', 'green');
}

/* ── Keyboard shortcut: Escape closes open modal ────────────── */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ============================================================
   INITIALISE APP
   ============================================================ */
(function init() {
  /* Set today as default due date in task form */
  document.getElementById('t-due').valueAsDate = new Date();

  /* Render sidebar projects */
  renderProjects();

  /* Render default view — Dashboard */
  renderDashboard();
  renderKanban();
})();
