/* ============================================================
   team.js  —  Team Management Module
   ============================================================ */

let teamChart = null;

/* ── Main render ────────────────────────────────────────────── */
function renderTeam() {
  document.getElementById('team-grid').innerHTML = data.members.map((m, i) => {
    const mt     = data.tasks.filter(t => t.member === m.id);
    const done   = mt.filter(t => t.status === 'done').length;
    const inprog = mt.filter(t => t.status === 'inprogress').length;
    const color  = AVATARS[i % AVATARS.length];

    return `
      <div class="team-card">
        <div class="tc-avatar" style="background:${color}22;color:${color}">
          ${initials(m.name)}
        </div>
        <div class="tc-name">${m.name}</div>
        <div class="tc-role">${m.role}</div>

        <!-- Skill tags -->
        <div style="margin-bottom:12px">
          ${(m.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>

        <!-- Stats -->
        <div class="tc-stats">
          <div class="tc-stat">
            <div class="tcs-val" style="color:var(--accent)">${mt.length}</div>
            <div class="tcs-label">Total</div>
          </div>
          <div class="tc-stat">
            <div class="tcs-val" style="color:var(--accent3)">${inprog}</div>
            <div class="tcs-label">Active</div>
          </div>
          <div class="tc-stat">
            <div class="tcs-val" style="color:var(--accent2)">${done}</div>
            <div class="tcs-label">Done</div>
          </div>
        </div>
      </div>`;
  }).join('');

  renderTeamChart();
}

/* ── Team bar chart ─────────────────────────────────────────── */
function renderTeamChart() {
  if (teamChart) teamChart.destroy();

  const ctx = document.getElementById('team-chart');
  if (!ctx) return;

  teamChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.members.map(m => m.name.split(' ')[0]),
      datasets: [
        {
          label: 'Total',
          data: data.members.map(m => data.tasks.filter(t => t.member === m.id).length),
          backgroundColor: 'rgba(123,108,246,0.3)',
          borderColor: '#7B6CF6',
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'Done',
          data: data.members.map(m => data.tasks.filter(t => t.member === m.id && t.status === 'done').length),
          backgroundColor: 'rgba(91,203,175,0.3)',
          borderColor: '#5BCBAF',
          borderWidth: 2,
          borderRadius: 6
        }
      ]
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
        y: { ticks: { color: '#8A90B0', font: { family: 'DM Sans' } }, grid: { color: '#252A40' } }
      }
    }
  });
}

/* ── Add Member ─────────────────────────────────────────────── */
function openAddMember() {
  document.getElementById('m-first').value  = '';
  document.getElementById('m-last').value   = '';
  document.getElementById('m-role').value   = '';
  document.getElementById('m-skills').value = '';
  openModal('member-modal');
}

function saveMember() {
  const first = document.getElementById('m-first').value.trim();
  const last  = document.getElementById('m-last').value.trim();
  if (!first || !last) {
    showToast('Please enter first and last name', 'red');
    return;
  }

  data.members.push({
    id:     data.nextId++,
    name:   first + ' ' + last,
    role:   document.getElementById('m-role').value || 'Team Member',
    skills: document.getElementById('m-skills').value
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
  });

  save();
  closeModal('member-modal');
  renderTeam();
  renderProjects();   // refresh project sidebar + task selects
  showToast('Member added!', 'green');
}
