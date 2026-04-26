/* ============================================================
   data.js  —  Application State & localStorage Persistence
   ============================================================ */

/* Shared color palette for member avatars */
const AVATARS = ['#7B6CF6','#5BCBAF','#F5A623','#E2514A','#7EC8E3','#C084FC','#FB923C'];

/* ── Load or initialise data ──────────────────────────────── */
let data = JSON.parse(localStorage.getItem('planflow') || 'null') || {

  projects: [
    {
      id: 1,
      name:  'Library Management',
      color: '#7B6CF6',
      desc:  'A web-based library system',
      start: '2026-03-01',
      end:   '2026-05-30'
    },
    {
      id: 2,
      name:  'Hospital Portal',
      color: '#5BCBAF',
      desc:  'Patient management portal',
      start: '2026-03-15',
      end:   '2026-06-15'
    }
  ],

  members: [
    { id: 1, name: 'Lavanya Kumar',      role: 'Full Stack Dev',   skills: ['HTML','CSS','JavaScript','MySQL'] },
    { id: 2, name: 'Kowsalya Kumar',     role: 'UI/UX Designer',   skills: ['Figma','CSS','React'] },
    { id: 3, name: 'Madhumitha Murugan', role: 'Backend Dev',      skills: ['PHP','MySQL','REST API'] },
    { id: 4, name: 'Karthik S',          role: 'Frontend Dev',     skills: ['HTML','CSS','Bootstrap'] },
    { id: 5, name: 'Kishore Kumar',      role: 'Database Admin',   skills: ['MySQL','MongoDB','SQL'] }
  ],

  tasks: [
    { id:1,  title: 'Design login page UI',              project:1, member:2, priority:'high',   status:'done',       due:'2026-04-05', desc:'' },
    { id:2,  title: 'Set up database schema',            project:1, member:5, priority:'high',   status:'done',       due:'2026-04-06', desc:'' },
    { id:3,  title: 'Build user authentication',         project:1, member:1, priority:'high',   status:'inprogress', due:'2026-04-12', desc:'' },
    { id:4,  title: 'Book search functionality',         project:1, member:3, priority:'medium', status:'inprogress', due:'2026-04-18', desc:'' },
    { id:5,  title: 'Issue / return module',             project:1, member:1, priority:'high',   status:'todo',       due:'2026-04-22', desc:'' },
    { id:6,  title: 'Admin dashboard',                   project:1, member:4, priority:'medium', status:'todo',       due:'2026-04-25', desc:'' },
    { id:7,  title: 'Reports & analytics page',          project:1, member:2, priority:'low',    status:'todo',       due:'2026-04-28', desc:'' },
    { id:8,  title: 'Design patient registration form',  project:2, member:2, priority:'high',   status:'done',       due:'2026-04-08', desc:'' },
    { id:9,  title: 'Doctor schedule module',            project:2, member:3, priority:'medium', status:'inprogress', due:'2026-04-20', desc:'' },
    { id:10, title: 'Appointment booking API',           project:2, member:1, priority:'high',   status:'todo',       due:'2026-04-24', desc:'' },
    { id:11, title: 'Patient history view',              project:2, member:4, priority:'medium', status:'todo',       due:'2026-04-30', desc:'' },
    { id:12, title: 'Responsive CSS for all pages',      project:1, member:4, priority:'low',    status:'inprogress', due:'2026-04-15', desc:'' }
  ],

  activity: [
    { text: '<strong>Lavanya</strong> marked "User authentication" as In Progress', time: '2 hours ago', color: '#7B6CF6' },
    { text: '<strong>Kowsalya</strong> completed "Design patient registration form"',  time: '4 hours ago', color: '#5BCBAF' },
    { text: '<strong>Kishore</strong> completed "Set up database schema"',              time: 'Yesterday',   color: '#F5A623' },
    { text: '<strong>Madhumitha</strong> added "Doctor schedule module"',                time: 'Yesterday',   color: '#E2514A' }
  ],

  nextId: 13
};

/* ── Persist to localStorage ────────────────────────────────── */
function save() {
  localStorage.setItem('planflow', JSON.stringify(data));
}

/* ── Helper — get member initials ───────────────────────────── */
function initials(name) {
  return name.split(' ').map(x => x[0]).join('');
}

/* ── Helper — format date for display ──────────────────────── */
function fmtDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
