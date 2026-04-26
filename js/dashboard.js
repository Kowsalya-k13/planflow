/* ============================================================
   dashboard.js  —  Dashboard Module
   ============================================================ */

/* Holds the Chart.js instance so we can destroy before re-render */
let priorityChart = null;

/* ── Main render function ───────────────────────────────────── */
function renderDashboard() {
  const tasks   = data.tasks;
  const done    = tasks.filter(t => t.status === 'done').length;
  const inprog  = tasks.filter(t => t.status === 'inprogress').length;
  const high    = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const pct     = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  /* ── Stat cards ─────────────────────────────────────────── */
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card">
      <div class="sc-label">Total Tasks</div>
      <div class="sc-val" style="color:var(--accent)">${tasks.length}</div>
      <div class="progress-track"><div class="progress-fill" style="width:100%;background:var(--accent)"></div></div>
      <div class="sc-sub">across ${data.projects.length} projects</div>
    </div>

    <div class="stat-card">
      <div class="sc-label">Completed</div>
      <div class="sc-val" style="color:var(--accent2)">${done}</div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:var(--accent2)"></div></div>
      <div class="sc-sub">${pct}% of total tasks</div>
    </div>

    <div class="stat-card">
      <div class="sc-label">In Progress</div>
      <div class="sc-val" style="color:var(--accent3)">${inprog}</div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${tasks.length ? Math.round(inprog/tasks.length*100) : 0}%;background:var(--accent3)"></div>
      </div>
      <div class="sc-sub">actively being worked</div>
    </div>

    <div class="stat-card">
      <div class="sc-label">High Priority</div>
      <div class="sc-val" style="color:var(--danger)">${high}</div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${tasks.length ? Math.round(high/tasks.length*100) : 0}%;background:var(--danger)"></div>
      </div>
      <div class="sc-sub">need attention</div>
    </div>
  `;

  /* ── Recent tasks ───────────────────────────────────────── */
  const recent = [...tasks].sort((a, b) => b.id - a.id).slice(0, 6);
  document.getElementById('recent-tasks-list').innerHTML = recent.map(t => {
    const m  = data.members.find(x => x.id === t.member);
    const sc = { todo:'s-todo', inprogress:'s-inprog', done:'s-done', blocked:'s-blocked' }[t.status] || 's-todo';
    return `
      <div class="task-row">
        <div class="status-dot ${sc}"></div>
        <div class="tr-name">${t.title}</div>
        <div class="tr-meta">${m ? m.name.split(' ')[0] : '—'}</div>
      </div>`;
  }).join('');

  /* ── Team workload ──────────────────────────────────────── */
  const workload = data.members.map(m => {
    const mt   = tasks.filter(t => t.member === m.id);
    const mdone = mt.filter(t => t.status === 'done').length;
    return { ...m, total: mt.length, done: mdone, pct: mt.length ? Math.round(mdone / mt.length * 100) : 0 };
  }).sort((a, b) => b.total - a.total);

  document.getElementById('workload-list').innerHTML = workload.map((m, i) => `
    <div class="member-row">
      <div class="avatar" style="width:28px;height:28px;font-size:10px;background:${AVATARS[i % AVATARS.length]}22;color:${AVATARS[i % AVATARS.length]}">
        ${initials(m.name)}
      </div>
      <div class="mr-info">
        <div class="mr-name">${m.name}</div>
        <div class="mr-tasks">${m.total} tasks · ${m.done} done</div>
      </div>
      <div class="mini-bar">
        <div class="mini-bar-fill" style="width:${m.pct}%;background:${AVATARS[i % AVATARS.length]}"></div>
      </div>
    </div>`).join('');

  /* ── Activity feed ──────────────────────────────────────── */
  document.getElementById('activity-list').innerHTML = data.activity.map(a => `
    <div class="activity-item">
      <div class="act-icon" style="background:${a.color}22;color:${a.color}">●</div>
      <div>
        <div class="act-text">${a.text}</div>
        <div class="act-time">${a.time}</div>
      </div>
    </div>`).join('');

  /* ── Priority chart ─────────────────────────────────────── */
  renderPriorityChart();

  /* ── Update kanban badge ────────────────────────────────── */
  document.getElementById('kanban-badge').textContent = tasks.filter(t => t.status !== 'done').length;
}

/* ── Priority doughnut chart ────────────────────────────────── */
function renderPriorityChart() {
  if (priorityChart) priorityChart.destroy();

  const ctx = document.getElementById('priority-chart');
  if (!ctx) return;

  const h = data.tasks.filter(t => t.priority === 'high').length;
  const m = data.tasks.filter(t => t.priority === 'medium').length;
  const l = data.tasks.filter(t => t.priority === 'low').length;

  priorityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [h, m, l],
        backgroundColor: ['#E2514A', '#F5A623', '#5BCBAF'],
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#8A90B0', font: { family: 'DM Sans', size: 12 }, padding: 12, boxWidth: 12, borderRadius: 6 }
        }
      },
      cutout: '65%'
    }
  });
}
