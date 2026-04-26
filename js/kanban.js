/* ============================================================
   kanban.js  —  Kanban Board Module
   ============================================================ */

let dragTask     = null;   // ID of task being dragged
let kanbanFilter = 'all';  // Active priority filter

/* ── Column definitions ─────────────────────────────────────── */
const COLUMNS = [
  { key: 'todo',       label: 'To Do',       color: '#8A90B0' },
  { key: 'inprogress', label: 'In Progress',  color: '#F5A623' },
  { key: 'done',       label: 'Done',         color: '#5BCBAF' },
  { key: 'blocked',    label: 'Blocked',      color: '#E2514A' }
];

/* ── Main render ────────────────────────────────────────────── */
function renderKanban() {
  let tasks = data.tasks;
  if (kanbanFilter !== 'all') {
    tasks = tasks.filter(t => t.priority === kanbanFilter);
  }

  document.getElementById('kanban-board').innerHTML = COLUMNS.map(col => {
    const colTasks = tasks.filter(t => t.status === col.key);
    return `
      <div class="kb-col"
        ondragover="dragOver(event)"
        ondrop="drop(event, '${col.key}')"
        data-col="${col.key}">

        <div class="kb-col-head">
          <div class="kb-col-title">
            <span style="color:${col.color}">●</span>
            ${col.label}
            <span class="kb-count">${colTasks.length}</span>
          </div>
        </div>

        ${colTasks.map(t => renderKbTask(t)).join('')}

        <button class="kb-add-btn" onclick="openAddTask('${col.key}')">
          + Add task
        </button>
      </div>`;
  }).join('');
}

/* ── Single task card ───────────────────────────────────────── */
function renderKbTask(t) {
  const member  = data.members.find(x => x.id === t.member);
  const project = data.projects.find(x => x.id === t.project);

  /* Overdue check */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = t.due ? new Date(t.due) : null;
  const isOverdue = due && due < today && t.status !== 'done';
  const dueStr    = due ? fmtDate(t.due) : null;

  /* Member avatar */
  const mIdx = member ? data.members.indexOf(member) : 0;
  const av   = member
    ? `<div class="sm-avatar" style="background:${AVATARS[mIdx % AVATARS.length]}33;color:${AVATARS[mIdx % AVATARS.length]}">
         ${initials(member.name)}
       </div>`
    : '';

  /* Priority tag color */
  const tagClass = { high: 'tag-red', medium: 'tag-amber', low: 'tag-green' }[t.priority] || 'tag-amber';

  return `
    <div class="kb-task"
      draggable="true"
      ondragstart="dragStart(event, ${t.id})"
      ondragend="dragEnd(event)"
      data-id="${t.id}">

      <!-- Title row -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <div class="kb-task-title">${t.title}</div>
        <div class="priority-dot p-${t.priority}" style="margin-top:4px;flex-shrink:0"></div>
      </div>

      <!-- Project label -->
      ${project
        ? `<div style="font-size:10px;color:${project.color};margin-bottom:6px;font-weight:500">${project.name}</div>`
        : ''}

      <!-- Meta row -->
      <div class="kb-task-meta">
        <span class="tag ${tagClass}">${t.priority}</span>
        <div style="display:flex;align-items:center;gap:6px">
          ${dueStr ? `<span class="due-badge${isOverdue ? ' overdue' : ''}">${isOverdue ? '⚠ ' : ''}${dueStr}</span>` : ''}
          ${av}
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:6px;margin-top:8px">
        <button
          onclick="editTask(${t.id})"
          style="flex:1;padding:4px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text3);font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif"
          onmouseover="this.style.color='var(--accent)'"
          onmouseout="this.style.color='var(--text3)'">
          Edit
        </button>
        <button
          onclick="deleteTask(${t.id})"
          style="padding:4px 8px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text3);font-size:11px;cursor:pointer"
          onmouseover="this.style.color='var(--danger)'"
          onmouseout="this.style.color='var(--text3)'">
          ✕
        </button>
      </div>
    </div>`;
}

/* ── Drag & Drop handlers ───────────────────────────────────── */
function dragStart(e, id) {
  dragTask = id;
  setTimeout(() => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.classList.add('dragging');
  }, 0);
}

function dragEnd() {
  document.querySelectorAll('.kb-task').forEach(el => el.classList.remove('dragging', 'drag-over'));
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e, col) {
  e.preventDefault();
  if (dragTask) {
    const t = data.tasks.find(x => x.id === dragTask);
    if (t) {
      t.status = col;
      save();
      renderKanban();
      renderDashboard();
      showToast('Task moved to ' + COLUMNS.find(c => c.key === col).label, 'green');
    }
  }
  dragTask = null;
}

/* ── Priority filter ────────────────────────────────────────── */
function filterKanban(filter, el) {
  kanbanFilter = filter;
  document.querySelectorAll('#kanban-filters .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderKanban();
}

/* ── Search overlay ─────────────────────────────────────────── */
function searchTasks(q) {
  if (!q) { renderKanban(); return; }

  const results = data.tasks.filter(t => t.title.toLowerCase().includes(q.toLowerCase()));

  document.getElementById('kanban-board').innerHTML = COLUMNS.map(col => {
    const ct = results.filter(t => t.status === col.key);
    return `
      <div class="kb-col">
        <div class="kb-col-head">
          <div class="kb-col-title">
            <span style="color:${col.color}">●</span>
            ${col.label}
            <span class="kb-count">${ct.length}</span>
          </div>
        </div>
        ${ct.map(t => renderKbTask(t)).join('')}
        <button class="kb-add-btn" onclick="openAddTask('${col.key}')">+ Add task</button>
      </div>`;
  }).join('');
}

/* ── Task CRUD ──────────────────────────────────────────────── */
let editTaskId = null;

function openAddTask(status) {
  editTaskId = null;
  document.getElementById('task-modal-title').textContent = 'Add New Task';
  document.getElementById('t-title').value   = '';
  document.getElementById('t-desc').value    = '';
  document.getElementById('t-status').value  = status || 'todo';
  document.getElementById('t-priority').value = 'medium';
  document.getElementById('t-due').valueAsDate = new Date();
  populateTaskSelects();
  openModal('task-modal');
}

function editTask(id) {
  const t = data.tasks.find(x => x.id === id);
  if (!t) return;
  editTaskId = id;
  document.getElementById('task-modal-title').textContent = 'Edit Task';
  document.getElementById('t-title').value    = t.title;
  document.getElementById('t-desc').value     = t.desc || '';
  document.getElementById('t-priority').value = t.priority;
  document.getElementById('t-status').value   = t.status;
  document.getElementById('t-due').value      = t.due || '';
  populateTaskSelects();
  document.getElementById('t-member').value  = t.member;
  document.getElementById('t-project').value = t.project;
  openModal('task-modal');
}

function saveTask() {
  const title = document.getElementById('t-title').value.trim();
  if (!title) {
    document.getElementById('t-title').style.borderColor = 'var(--danger)';
    setTimeout(() => document.getElementById('t-title').style.borderColor = '', 1200);
    return;
  }

  const taskData = {
    title,
    priority: document.getElementById('t-priority').value,
    status:   document.getElementById('t-status').value,
    member:   parseInt(document.getElementById('t-member').value),
    project:  parseInt(document.getElementById('t-project').value),
    due:      document.getElementById('t-due').value,
    desc:     document.getElementById('t-desc').value
  };

  if (editTaskId) {
    const t = data.tasks.find(x => x.id === editTaskId);
    Object.assign(t, taskData);
    showToast('Task updated', 'green');
  } else {
    data.tasks.push({ id: data.nextId++, ...taskData });
    data.activity.unshift({
      text:  `<strong>You</strong> added "${title}"`,
      time:  'Just now',
      color: '#7B6CF6'
    });
    if (data.activity.length > 8) data.activity.pop();
    showToast('Task created!', 'green');
  }

  save();
  closeModal('task-modal');
  renderDashboard();
  renderKanban();
}

function deleteTask(id) {
  data.tasks = data.tasks.filter(t => t.id !== id);
  save();
  renderKanban();
  renderDashboard();
  showToast('Task deleted', 'red');
}
