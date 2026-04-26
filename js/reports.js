/* ============================================================
   reports.js  —  Reports & Analytics Module
   ============================================================ */

let statusChart   = null;
let progressChart = null;

/* ── Main render ────────────────────────────────────────────── */
function renderReports() {
  const tasks = data.tasks;
  const done  = tasks.filter(t => t.status === 'done').length;
  const pct   = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  /* Summary metrics */
  document.getElementById('completion-rate').textContent = pct + '%';
  document.getElementById('avg-tasks').textContent =
    data.members.length ? Math.round(tasks.length / data.members.length) : 0;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  document.getElementById('overdue-count').textContent =
    tasks.filter(t => t.due && new Date(t.due) < today && t.status !== 'done').length;

  renderStatusChart(tasks, done);
  renderProgressChart(done);
  renderTimeline();
}

/* ── Status doughnut chart ──────────────────────────────────── */
function renderStatusChart(tasks, done) {
  if (statusChart) statusChart.destroy();

  const ctx = document.getElementById('status-chart');
  if (!ctx) return;

  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['To Do', 'In Progress', 'Done', 'Blocked'],
      datasets: [{
        data: [
          tasks.filter(t => t.status === 'todo').length,
          tasks.filter(t => t.status === 'inprogress').length,
          done,
          tasks.filter(t => t.status === 'blocked').length
        ],
        backgroundColor: ['#555B7A', '#F5A623', '#5BCBAF', '#E2514A'],
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
      cutout: '60%'
    }
  });
}

/* ── Weekly progress line chart ─────────────────────────────── */
function renderProgressChart(done) {
  if (progressChart) progressChart.destroy();

  const ctx = document.getElementById('progress-chart');
  if (!ctx) return;

  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [{
        label: 'Tasks Completed',
        data: [2, 3, 5, 4, 7, done],
        fill: true,
        backgroundColor: 'rgba(123,108,246,0.12)',
        borderColor: '#7B6CF6',
        tension: 0.4,
        pointBackgroundColor: '#7B6CF6',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#8A90B0', font: { family: 'DM Sans', size: 12 }, padding: 14 }
        }
      },
      scales: {
        x: { ticks: { color: '#8A90B0', font: { family: 'DM Sans' } }, grid: { color: '#252A40' } },
        y: { ticks: { color: '#8A90B0', font: { family: 'DM Sans' } }, grid: { color: '#252A40' }, beginAtZero: true }
      }
    }
  });
}

/* ── Project timeline ───────────────────────────────────────── */
function renderTimeline() {
  document.getElementById('timeline-list').innerHTML = data.projects.map(p => {
    const pt   = data.tasks.filter(t => t.project === p.id);
    const pd   = pt.filter(t => t.status === 'done').length;
    const pp   = pt.length ? Math.round(pd / pt.length * 100) : 0;
    const start = p.start ? fmtDate(p.start) : '—';
    const end   = p.end   ? fmtDate(p.end)   : '—';

    return `
      <div class="timeline-item">
        <div class="tl-date">${start}</div>
        <div class="tl-bar-wrap">
          <div class="tl-name">
            <span style="color:${p.color}">●</span>
            ${p.name}
            <span class="sub">${pd}/${pt.length} tasks · until ${end}</span>
          </div>
          <div class="tl-bar">
            <div class="tl-fill" style="width:${pp}%;background:${p.color}"></div>
          </div>
        </div>
        <div style="font-size:14px;font-weight:700;font-family:'Syne',sans-serif;color:${p.color};min-width:40px;text-align:right">
          ${pp}%
        </div>
      </div>`;
  }).join('');
}
