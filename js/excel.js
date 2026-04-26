/* ============================================================
   excel.js  —  Excel Import / Export Module  (SheetJS)
   ============================================================ */

let parsedImport      = null;
let activePreviewSheet = 'tasks';

/* ============================================================
   EXPORT
   ============================================================ */
function exportToExcel() {
  const wb = XLSX.utils.book_new();

  /* Projects sheet */
  const projRows = [
    ['Name', 'Description', 'Color', 'Start Date', 'End Date'],
    ...data.projects.map(p => [p.name, p.desc || '', p.color, p.start || '', p.end || ''])
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(projRows);
  ws1['!cols'] = [{ wch:30 }, { wch:40 }, { wch:12 }, { wch:14 }, { wch:14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Projects');

  /* Members sheet */
  const memRows = [
    ['Name', 'Role', 'Skills'],
    ...data.members.map(m => [m.name, m.role, (m.skills || []).join(', ')])
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(memRows);
  ws2['!cols'] = [{ wch:25 }, { wch:25 }, { wch:40 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Members');

  /* Tasks sheet — resolve IDs → names for readability */
  const taskRows = [
    ['Title', 'Project', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Description'],
    ...data.tasks.map(t => {
      const proj = data.projects.find(p => p.id === t.project);
      const mem  = data.members.find(m => m.id === t.member);
      return [t.title, proj ? proj.name : '', mem ? mem.name : '', t.priority, t.status, t.due || '', t.desc || ''];
    })
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(taskRows);
  ws3['!cols'] = [{ wch:35 }, { wch:25 }, { wch:20 }, { wch:12 }, { wch:14 }, { wch:14 }, { wch:40 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Tasks');

  XLSX.writeFile(wb, 'planflow-export.xlsx');
  showToast('Exported to Excel!', 'green');
}

/* ============================================================
   DOWNLOAD TEMPLATE
   ============================================================ */
function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  /* Sample Projects */
  const projData = [
    ['Name', 'Description', 'Color', 'Start Date', 'End Date'],
    ['Library Management System', 'A web-based library management app', '#7B6CF6', '2026-03-01', '2026-05-30'],
    ['Hospital Portal',           'Patient and doctor management portal', '#5BCBAF', '2026-03-15', '2026-06-15']
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(projData);
  ws1['!cols'] = [{ wch:32 }, { wch:42 }, { wch:12 }, { wch:14 }, { wch:14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Projects');

  /* Sample Members */
  const memData = [
    ['Name', 'Role', 'Skills'],
    ['Lavanya Kumar',      'Full Stack Developer', 'HTML, CSS, JavaScript, MySQL'],
    ['Kowsalya Kumar',     'UI/UX Designer',       'Figma, CSS, React'],
    ['Madhumitha Murugan', 'Backend Developer',    'PHP, MySQL, REST API']
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(memData);
  ws2['!cols'] = [{ wch:25 }, { wch:28 }, { wch:40 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Members');

  /* Sample Tasks */
  const taskData = [
    ['Title', 'Project', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Description'],
    ['Design login page UI',    'Library Management System', 'Lavanya Kumar',      'high',   'done',       '2026-04-05', 'Create responsive login and signup screens'],
    ['Set up database schema',  'Library Management System', 'Kowsalya Kumar',     'high',   'inprogress', '2026-04-12', 'Define all tables and relationships in MySQL'],
    ['Book search module',      'Library Management System', 'Madhumitha Murugan', 'medium', 'todo',       '2026-04-20', 'Search by title, author, ISBN'],
    ['Design patient form',     'Hospital Portal',           'Kishore Kumar',      'high',   'todo',       '2026-04-18', 'Patient registration with validation']
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(taskData);
  ws3['!cols'] = [{ wch:35 }, { wch:28 }, { wch:20 }, { wch:12 }, { wch:14 }, { wch:14 }, { wch:45 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Tasks');

  /* README sheet */
  const notes = [
    ['=== PlanFlow Import Template ==='], [''],
    ['SHEET: Projects'],
    ['Column',     'Allowed Values / Notes'],
    ['Name',       'Any text — must be unique'],
    ['Description','Optional'],
    ['Color',      'Hex code e.g. #7B6CF6'],
    ['Start Date', 'YYYY-MM-DD'],
    ['End Date',   'YYYY-MM-DD'],
    [''],
    ['SHEET: Members'],
    ['Column', 'Allowed Values / Notes'],
    ['Name',   'Full name — must be unique'],
    ['Role',   'Job title'],
    ['Skills', 'Comma-separated e.g. HTML, CSS, JS'],
    [''],
    ['SHEET: Tasks'],
    ['Column',      'Allowed Values / Notes'],
    ['Title',       'Task title — required'],
    ['Project',     'Must match a Project Name exactly'],
    ['Assigned To', 'Must match a Member Name exactly'],
    ['Priority',    'high / medium / low   (lowercase)'],
    ['Status',      'todo / inprogress / done / blocked'],
    ['Due Date',    'YYYY-MM-DD'],
    ['Description', 'Optional'],
    [''],
    ['TIP: Use Merge to add on top of existing data.'],
    ['TIP: Use Replace All to wipe and load fresh.']
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(notes);
  ws4['!cols'] = [{ wch:20 }, { wch:60 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'README');

  XLSX.writeFile(wb, 'planflow-template.xlsx');
  showToast('Template downloaded!', 'amber');
}

/* ============================================================
   IMPORT — open modal
   ============================================================ */
function openImport() {
  parsedImport = null;
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('file-name').textContent         = 'Supports .xlsx and .xls files';
  document.getElementById('file-input').value              = '';
  document.getElementById('merge-btn').style.display       = 'none';
  document.getElementById('replace-btn').style.display     = 'none';
  openModal('import-modal');
}

/* Drag-over / leave / drop on drop zone */
function dzOver(e)  { e.preventDefault(); document.getElementById('drop-zone').classList.add('over'); }
function dzLeave()  { document.getElementById('drop-zone').classList.remove('over'); }
function dzDrop(e)  { e.preventDefault(); dzLeave(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }
function handleFile(inp) { if (inp.files[0]) processFile(inp.files[0]); }

/* ── Parse uploaded file ────────────────────────────────────── */
function processFile(file) {
  if (!file.name.match(/\.xlsx?$/i)) {
    showToast('Please upload an .xlsx or .xls file', 'red');
    return;
  }

  document.getElementById('file-name').textContent = 'Reading: ' + file.name + '...';

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const wb     = XLSX.read(e.target.result, { type: 'array' });
      const result = { projects: [], members: [], tasks: [], errors: [] };

      /* Projects sheet */
      const pSheet = wb.SheetNames.find(n => n.toLowerCase() === 'projects');
      if (pSheet) {
        XLSX.utils.sheet_to_json(wb.Sheets[pSheet], { defval: '' }).forEach((r, i) => {
          if (!r['Name']) { result.errors.push(`Projects row ${i+2}: Missing Name`); return; }
          result.projects.push({
            id:    Date.now() + Math.random(),
            name:  String(r['Name']),
            desc:  String(r['Description'] || ''),
            color: String(r['Color']       || '#7B6CF6'),
            start: String(r['Start Date']  || ''),
            end:   String(r['End Date']    || '')
          });
        });
      }

      /* Members sheet */
      const mSheet = wb.SheetNames.find(n => n.toLowerCase() === 'members');
      if (mSheet) {
        XLSX.utils.sheet_to_json(wb.Sheets[mSheet], { defval: '' }).forEach((r, i) => {
          if (!r['Name']) { result.errors.push(`Members row ${i+2}: Missing Name`); return; }
          result.members.push({
            id:     Date.now() + Math.random(),
            name:   String(r['Name']),
            role:   String(r['Role']   || 'Team Member'),
            skills: r['Skills'] ? String(r['Skills']).split(',').map(s => s.trim()).filter(Boolean) : []
          });
        });
      }

      /* Tasks sheet — store raw names; resolve IDs at commit time */
      const tSheet = wb.SheetNames.find(n => n.toLowerCase() === 'tasks');
      if (tSheet) {
        let nextId = Date.now();
        XLSX.utils.sheet_to_json(wb.Sheets[tSheet], { defval: '' }).forEach((r, i) => {
          if (!r['Title']) { result.errors.push(`Tasks row ${i+2}: Missing Title`); return; }
          const pri  = String(r['Priority'] || 'medium').toLowerCase();
          const stat = String(r['Status']   || 'todo').toLowerCase().replace(/\s/g, '');
          result.tasks.push({
            id:           nextId++,
            title:        String(r['Title']),
            _projectName: String(r['Project']     || ''),
            _memberName:  String(r['Assigned To'] || ''),
            priority:     ['high','medium','low'].includes(pri)                          ? pri  : 'medium',
            status:       ['todo','inprogress','done','blocked'].includes(stat)          ? stat : 'todo',
            due:          String(r['Due Date']    || ''),
            desc:         String(r['Description'] || '')
          });
        });
      }

      if (!pSheet && !mSheet && !tSheet) {
        showToast('No valid sheets found. Need: Projects, Members, Tasks', 'red');
        return;
      }

      parsedImport = result;
      document.getElementById('file-name').textContent = '✓ ' + file.name + ' — ready to import';
      showPreview(result);

    } catch (err) {
      showToast('Error reading file: ' + err.message, 'red');
    }
  };
  reader.readAsArrayBuffer(file);
}

/* ── Preview section ────────────────────────────────────────── */
function showPreview(result) {
  document.getElementById('import-summary').innerHTML = `
    <div class="import-box"><div class="ib-val" style="color:var(--accent)">${result.projects.length}</div><div class="ib-label">Projects</div></div>
    <div class="import-box"><div class="ib-val" style="color:var(--accent2)">${result.members.length}</div><div class="ib-label">Members</div></div>
    <div class="import-box"><div class="ib-val" style="color:var(--accent3)">${result.tasks.length}</div><div class="ib-label">Tasks</div></div>`;

  activePreviewSheet = result.tasks.length   ? 'tasks'
                     : result.members.length ? 'members'
                     : 'projects';

  buildSheetTabs(result);
  renderPreviewTable(result, activePreviewSheet);

  const errEl = document.getElementById('import-error');
  if (result.errors.length) {
    errEl.style.display = 'block';
    errEl.textContent   = '⚠ ' + result.errors.join(' | ');
  } else {
    errEl.style.display = 'none';
  }

  document.getElementById('preview-section').style.display = 'block';
  document.getElementById('merge-btn').style.display        = 'inline-block';
  document.getElementById('replace-btn').style.display      = 'inline-block';
}

function buildSheetTabs(result) {
  const tabs = [
    { key: 'projects', label: `Projects (${result.projects.length})` },
    { key: 'members',  label: `Members (${result.members.length})`   },
    { key: 'tasks',    label: `Tasks (${result.tasks.length})`       }
  ];
  document.getElementById('sheet-tabs').innerHTML = tabs.map(t =>
    `<div class="sheet-tab${activePreviewSheet === t.key ? ' active' : ''}" onclick="switchTab('${t.key}')">${t.label}</div>`
  ).join('');
}

function switchTab(key) {
  activePreviewSheet = key;
  buildSheetTabs(parsedImport);
  renderPreviewTable(parsedImport, key);
}

function renderPreviewTable(result, sheet) {
  const tbl = document.getElementById('preview-table');
  if (sheet === 'projects') {
    tbl.innerHTML = `<thead><tr><th>Name</th><th>Description</th><th>Color</th><th>Start Date</th><th>End Date</th></tr></thead>
      <tbody>${result.projects.map(p =>
        `<tr><td>${p.name}</td><td>${p.desc || '—'}</td>
         <td><span style="display:inline-flex;align-items:center;gap:5px">
           <span style="width:10px;height:10px;border-radius:50%;background:${p.color};display:inline-block"></span>${p.color}
         </span></td>
         <td>${p.start || '—'}</td><td>${p.end || '—'}</td></tr>`).join('')}
      </tbody>`;
  } else if (sheet === 'members') {
    tbl.innerHTML = `<thead><tr><th>Name</th><th>Role</th><th>Skills</th></tr></thead>
      <tbody>${result.members.map(m =>
        `<tr><td>${m.name}</td><td>${m.role}</td><td>${(m.skills||[]).join(', ')||'—'}</td></tr>`).join('')}
      </tbody>`;
  } else {
    tbl.innerHTML = `<thead><tr><th>Title</th><th>Project</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th></tr></thead>
      <tbody>${result.tasks.map(t =>
        `<tr><td>${t.title}</td><td>${t._projectName||'—'}</td><td>${t._memberName||'—'}</td>
         <td>${t.priority}</td><td>${t.status}</td><td>${t.due||'—'}</td></tr>`).join('')}
      </tbody>`;
  }
}

/* ── Commit import ──────────────────────────────────────────── */
function confirmImport(replace) {
  if (!parsedImport) return;
  const r = parsedImport;

  if (replace) {
    data.projects = [];
    data.members  = [];
    data.tasks    = [];
    data.nextId   = 1;
  }

  /* Merge projects (skip duplicates by name) */
  r.projects.forEach(p => {
    if (!data.projects.find(x => x.name.toLowerCase() === p.name.toLowerCase()))
      data.projects.push({ ...p, id: data.nextId++ });
  });

  /* Merge members */
  r.members.forEach(m => {
    if (!data.members.find(x => x.name.toLowerCase() === m.name.toLowerCase()))
      data.members.push({ ...m, id: data.nextId++ });
  });

  /* Merge tasks — resolve project & member names to IDs */
  r.tasks.forEach(t => {
    const proj = data.projects.find(p => p.name.toLowerCase() === t._projectName.toLowerCase());
    const mem  = data.members.find(m => m.name.toLowerCase() === t._memberName.toLowerCase());
    const task = {
      ...t,
      id:      data.nextId++,
      project: proj ? proj.id : (data.projects[0] ? data.projects[0].id : 1),
      member:  mem  ? mem.id  : (data.members[0]  ? data.members[0].id  : 1)
    };
    delete task._projectName;
    delete task._memberName;

    if (replace || !data.tasks.find(x => x.title.toLowerCase() === task.title.toLowerCase()))
      data.tasks.push(task);
  });

  data.activity.unshift({
    text:  `<strong>You</strong> imported ${r.tasks.length} tasks, ${r.members.length} members, ${r.projects.length} projects`,
    time:  'Just now',
    color: '#5BCBAF'
  });

  save();
  closeModal('import-modal');
  renderProjects();
  renderDashboard();
  renderKanban();
  showToast(`Imported ${r.tasks.length} tasks, ${r.members.length} members, ${r.projects.length} projects`, 'green');
}
