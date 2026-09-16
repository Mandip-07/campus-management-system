/* ===========================================================
   Campus Management System — Vanilla JS SPA
   Storage:
     localStorage: cms_users, cms_students, cms_teachers,
                   cms_attendance, cms_results, cms_notices, cms_theme
     sessionStorage: cms_session  (current logged-in user email)
   =========================================================== */

/* ---------- Storage helpers ---------- */
const LS = {
  get: (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const SS = {
  get: (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => sessionStorage.setItem(k, JSON.stringify(v)),
  clear: () => sessionStorage.clear(),
};

/* ---------- State ---------- */
const savedUsers = LS.get('cms_users', []);
const savedStudents = LS.get('cms_students', []);
const savedTeachers = LS.get('cms_teachers', []);
const savedAttendance = LS.get('cms_attendance', {});
const savedResults = LS.get('cms_results', {});
const savedNotices = LS.get('cms_notices', []);
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
const State = {
  users:       Array.isArray(savedUsers) ? savedUsers.filter(isRecord) : [],
  students:    Array.isArray(savedStudents) ? savedStudents.filter(isRecord) : [],
  teachers:    Array.isArray(savedTeachers) ? savedTeachers.filter(isRecord) : [],
  attendance:  isRecord(savedAttendance) ? savedAttendance : {}, // { 'YYYY-MM-DD': { studentId: 'present'|'absent' } }
  results:     isRecord(savedResults) ? savedResults : {},       // { studentId: [ {subject, score} ] }
  notices:     Array.isArray(savedNotices) ? savedNotices.filter(isRecord) : [],
};
const persist = {
  users:      () => LS.set('cms_users', State.users),
  students:   () => LS.set('cms_students', State.students),
  teachers:   () => LS.set('cms_teachers', State.teachers),
  attendance: () => LS.set('cms_attendance', State.attendance),
  results:    () => LS.set('cms_results', State.results),
  notices:    () => LS.set('cms_notices', State.notices),
};

/* ---------- Theme ---------- */
const initTheme = () => {
  const saved = localStorage.getItem('cms_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
};
const toggleTheme = () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cms_theme', next);
  toast(`${next === 'dark' ? '🌙' : '☀️'} ${next} mode`, 'info');
};
initTheme();

/* ---------- Utilities ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const escape = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayStr = () => new Date().toISOString().slice(0, 10);
const initials = (name = '?') => name.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Premium SVG Icon Library ---------- */
const ICONS = {
  dashboard: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>',
  students:  '<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-8 1.7-8 5v3h16v-3c0-3.3-4.7-5-8-5z"/>',
  teachers:  '<path d="M3 4h18v12H5.2L3 18.2V4zm4 3v2h10V7H7zm0 4v2h7v-2H7z"/>',
  attendance:'<path d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm5.5 9.5l-2 2 1.5 1.5L11 15l4-4-1.5-1.5L11 12z"/>',
  results:   '<path d="M3 3v18h18v-2H5V3H3zm4 12l4-4 3 3 5-6 1.5 1.5L14 17l-3-3-4 4-1-1z"/>',
  notices:   '<path d="M3 11v2l4 1v3l2 1v-3l9 2V8L9 10H4a1 1 0 0 0-1 1zm17-4v10l2-1V8l-2-1z"/>',
  profile:   '<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z"/>',
  logout:    '<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5v-2H5V6h5V4zm5 4l-1.4 1.4L16.2 12H9v2h7.2l-2.6 2.6L15 18l5-5-5-5z"/>',
  add:       '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/>',
  edit:      '<path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
  trash:     '<path d="M9 3v1H4v2h16V4h-5V3H9zm-3 5l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12H6z"/>',
  search:    '<path d="M10 4a6 6 0 1 0 3.74 10.66l4.3 4.3 1.42-1.42-4.3-4.3A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>',
  check:     '<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>',
  back:      '<path d="M14.7 5.3L13.3 3.9 5.2 12l8.1 8.1 1.4-1.4L8.5 12l6.2-6.7z"/>',
  shield:    '<path d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/>',
  cap:       '<path d="M12 3L1 9l11 6 9-4.9V17h2V9L12 3zm-7 9.2V16c0 2 4 4 7 4s7-2 7-4v-3.8l-7 3.8-7-3.8z"/>',
  bell:      '<path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 0 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/>',
  chart:     '<path d="M5 9h3v12H5V9zm5-6h3v18h-3V3zm5 9h3v9h-3v-9z"/>'
};
function icon(name, size = 18) {
  return `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------- Toast ---------- */
function toast(msg, type = 'info', ms = 2500) {
  const c = $('#toast-container'); if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, ms);
}

/* ---------- Confirm modal ---------- */
function confirmAction({ title = 'Are you sure?', text = 'This action cannot be undone.', okText = 'Delete' }) {
  return new Promise(resolve => {
    const m = $('#confirm-modal');
    $('#confirm-title').textContent = title;
    $('#confirm-text').textContent = text;
    $('#confirm-ok').textContent = okText;
    m.classList.remove('hidden');
    const cleanup = () => {
      m.classList.add('hidden');
      $('#confirm-ok').onclick = null;
      $('#confirm-cancel').onclick = null;
    };
    $('#confirm-ok').onclick = () => { cleanup(); resolve(true); };
    $('#confirm-cancel').onclick = () => { cleanup(); resolve(false); };
  });
}

/* ---------- Router (hash-based) ---------- */
const Routes = {};
function route(path, render) { Routes[path] = render; }
function navigate(hash) { if (location.hash !== hash) location.hash = hash; else render(); }
function currentRoute() { return location.hash.replace(/^#/, '') || '/'; }

function render() {
  const path = currentRoute();
  const session = SS.get('cms_session');
  const protectedAdmin = ['/admin', '/admin/students', '/admin/teachers', '/admin/attendance', '/admin/results', '/admin/notices', '/admin/profile'];
  const protectedStudent = ['/student', '/student/attendance', '/student/results', '/student/notices', '/student/profile'];

  if (protectedAdmin.includes(path) && (!session || session.role !== 'admin')) return navigate('#/login');
  if (protectedStudent.includes(path) && (!session || session.role !== 'student')) return navigate('#/login');

  const fn = Routes[path] || Routes['/'];
  const app = $('#app');
  app.innerHTML = '';
  try {
    fn(app);
  } catch (error) {
    console.error('Unable to render this page:', error);
    app.innerHTML = `<div class="page-error"><h1>Unable to load this page</h1><p>Please refresh once. If the problem continues, log out and log in again.</p><a class="btn btn-primary" href="#/">Go to home</a></div>`;
  }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

/* ===========================================================
   LANDING PAGE
   =========================================================== */
route('/', (app) => {
  app.innerHTML = `
    <div class="landing-page">
    <nav class="navbar landing-nav">
      <a href="#/" class="brand"><span class="brand-logo" aria-hidden="true"><svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L4 14l16 8 12-6v8a2 2 0 1 0 2 0V14L20 6z" fill="#fff" fill-opacity=".95"/><path d="M10 20v6c0 2.5 4.5 5 10 5s10-2.5 10-5v-6l-10 5-10-5z" fill="#fff" fill-opacity=".8"/></svg></span><span class="brand-text">CMS</span></a>
      <div class="nav-links" id="nav-links">
        <span class="nav-note">For the people who keep campus moving</span>
        <a href="#/login">Sign in</a>
        <a href="#/signup" class="nav-cta">Open CMS</a>
        <button class="theme-toggle" id="theme-toggle" title="Toggle theme">◐</button>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <header class="hero landing-hero">
      <div class="hero-copy">
        <p class="hero-kicker">Campus operations, made calmer</p>
        <h1>The day-to-day,<br><em>in one place.</em></h1>
        <p class="hero-lede">A clear, practical workspace for the people behind a thriving campus. Keep records tidy, attendance current, and everyone on the same page.</p>
        <div class="hero-actions">
          <a href="#/signup" class="btn btn-primary">Start your workspace <span aria-hidden="true">↗</span></a>
          <a href="#/login" class="text-link">I already have an account <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <div class="campus-preview" aria-label="Campus overview preview">
        <div class="preview-topline"><span class="preview-dot"></span><span>Tuesday, 14 October</span><span class="preview-menu">•••</span></div>
        <div class="preview-heading"><div><span class="preview-eyebrow">Good morning, admin</span><strong>Your campus at a glance</strong></div><span class="preview-avatar">AM</span></div>
        <div class="preview-stats"><div><strong>842</strong><span>Students</span></div><div><strong>96%</strong><span>Attendance</span></div><div><strong>24</strong><span>Notices</span></div></div>
        <div class="preview-list"><div class="preview-list-title">Today&rsquo;s rhythm <span>View all</span></div><div class="preview-row"><span class="preview-icon">${icon('attendance', 16)}</span><div><strong>Attendance is up to date</strong><small>All classes checked in</small></div><span class="preview-check">${icon('check', 15)}</span></div><div class="preview-row"><span class="preview-icon coral">${icon('bell', 16)}</span><div><strong>2 new notices posted</strong><small>Last updated 12 min ago</small></div><span class="preview-arrow">→</span></div></div>
      </div>
    </header>

    <section class="section landing-section">
      <div class="section-title landing-section-title">
        <p class="hero-kicker">The useful bits</p>
        <h2>Less hunting.<br>More doing.</h2>
        <p>Simple tools for the small tasks that make a big difference.</p>
      </div>
      <div class="features-grid landing-features">
        ${[
          ['students','Students','Find the right record in a few clicks.'],
          ['teachers','Teachers','Keep staff details and subjects together.'],
          ['attendance','Attendance','Mark the day while it is still fresh.'],
          ['results','Results','Record marks and let the totals do themselves.'],
        ].map(([i,t,d], index) => `
          <div class="feature-card glass"><span class="feature-number">0${index + 1}</span>
            <div class="feature-icon">${icon(i, 24)}</div>
            <h3>${t}</h3><p>${d}</p>
          </div>`).join('')}
      </div>
    </section>

    <footer class="footer landing-footer"><span>CMS</span><span>Campus Management System · ${new Date().getFullYear()}</span><a href="#/signup">Make a start <span aria-hidden="true">↗</span></a></footer>
    </div>
  `;
  $('#hamburger').onclick = (e) => {
    e.currentTarget.classList.toggle('active');
    $('#nav-links').classList.toggle('open');
  };
  $('#theme-toggle').onclick = toggleTheme;
});

/* ===========================================================
   AUTH — SIGNUP
   =========================================================== */
route('/signup', (app) => {
  app.innerHTML = `
    <div class="auth-wrap auth-page">
      <div class="auth-card">
        <a href="#/" class="auth-wordmark">CMS</a>
        <h1>Create an account</h1>
        <p class="sub">Set up your campus account to get started.</p>
        <form id="signup-form" novalidate>
          <div class="form-group">
            <label>Full name</label>
            <input class="input" name="name" placeholder="Jane Doe" />
            <small class="field-error" data-for="name"></small>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="input" name="email" type="email" placeholder="you@school.edu" />
            <small class="field-error" data-for="email"></small>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Password</label>
              <div class="password-wrap">
                <input class="input" name="password" type="password" placeholder="••••••••" />
                <button type="button" class="toggle-pass">SHOW</button>
              </div>
              <small class="field-error" data-for="password"></small>
            </div>
            <div class="form-group">
              <label>Confirm</label>
              <div class="password-wrap">
                <input class="input" name="confirm" type="password" placeholder="••••••••" />
                <button type="button" class="toggle-pass">SHOW</button>
              </div>
              <small class="field-error" data-for="confirm"></small>
            </div>
          </div>
          <div class="form-group">
            <label>Select Role</label>
            <div class="select-wrap">
              <select class="input select" name="role" required>
                <option value="">Select Role</option>
                <option value="admin">🛡️ Admin</option>
                <option value="student">🎓 Student</option>
              </select>
              <span class="select-caret">${icon('back',14)}</span>
            </div>
            <small class="field-error" data-for="role"></small>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Create account</button>
        </form>
        <p class="auth-switch">Already a member? <a href="#/login">Log in</a></p>
        <a href="#/" class="auth-back">${icon('back',14)} Back to home</a>
      </div>
    </div>
  `;
  bindPasswordToggles(app);
  $('#signup-form').addEventListener('submit', handleSignup);
});

function bindPasswordToggles(scope) {
  $$('.toggle-pass', scope).forEach(btn => {
    btn.onclick = () => {
      const inp = btn.parentElement.querySelector('input');
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.textContent = inp.type === 'password' ? 'SHOW' : 'HIDE';
    };
  });
}

function setError(form, name, msg) {
  const el = form.querySelector(`.field-error[data-for="${name}"]`);
  if (el) el.textContent = msg || '';
}

function handleSignup(e) {
  e.preventDefault();
  const f = e.target;
  const data = Object.fromEntries(new FormData(f).entries());
  ['name','email','password','confirm'].forEach(n => setError(f, n, ''));

  let ok = true;
  if (!data.name.trim()) { setError(f,'name','Name is required'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setError(f,'email','Enter a valid email'); ok = false; }
  if ((data.password || '').length < 6) { setError(f,'password','At least 6 characters'); ok = false; }
  if (data.password !== data.confirm) { setError(f,'confirm','Passwords do not match'); ok = false; }
  if (!data.role) { setError(f,'role','Please select a role'); ok = false; }
  if (!ok) return;

  if (State.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    setError(f,'email','Email already registered'); return;
  }
  const user = { id: uid(), name: data.name.trim(), email: data.email.trim(), password: data.password, role: data.role };
  State.users.push(user); persist.users();

  if (user.role === 'student') {
    // auto-create a student record so the student panel has data
    if (!State.students.some(s => s.email.toLowerCase() === user.email.toLowerCase())) {
      State.students.push({ id: uid(), name: user.name, email: user.email, roll: 'R-' + Math.floor(1000+Math.random()*9000), class: '—', userId: user.id });
      persist.students();
    }
  }

  toast('Account created! Please log in.', 'success');
  navigate('#/login');
}

/* ===========================================================
   AUTH — LOGIN
   =========================================================== */
route('/login', (app) => {
  app.innerHTML = `
    <div class="auth-wrap auth-page">
      <div class="auth-card">
        <a href="#/" class="auth-wordmark">CMS</a>
        <h1>Sign in</h1>
        <p class="sub">Use your account to open the campus workspace.</p>
        <form id="login-form" novalidate>
          <div class="form-group">
            <label>Select Role</label>
            <div class="select-wrap">
              <select class="input select" name="role" required>
                <option value="">Select Role</option>
                <option value="admin">🛡️ Admin</option>
                <option value="student">🎓 Student</option>
              </select>
              <span class="select-caret">${icon('back',14)}</span>
            </div>
            <small class="field-error" data-for="role"></small>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="input" name="email" type="email" placeholder="you@school.edu" />
            <small class="field-error" data-for="email"></small>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrap">
              <input class="input" name="password" type="password" placeholder="••••••••" />
              <button type="button" class="toggle-pass">SHOW</button>
            </div>
            <small class="field-error" data-for="password"></small>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Log in</button>
        </form>
        <p class="auth-switch">No account? <a href="#/signup">Sign up</a></p>
        <a href="#/" class="auth-back">${icon('back',14)} Back to home</a>
      </div>
    </div>
  `;
  bindPasswordToggles(app);
  $('#login-form').addEventListener('submit', handleLogin);
});

function handleLogin(e) {
  e.preventDefault();
  const f = e.target;
  const data = Object.fromEntries(new FormData(f).entries());
  ['email','password','role'].forEach(n => setError(f, n, ''));

  let ok = true;
  if (!data.role) { setError(f,'role','Please select a role'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setError(f,'email','Enter a valid email'); ok = false; }
  if (!data.password) { setError(f,'password','Password required'); ok = false; }
  if (!ok) return;

  const user = State.users.find(u => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password);
  if (!user) { setError(f,'password','Invalid email or password'); return; }
  if (data.role && user.role !== data.role) { setError(f,'password',`This account is not a ${data.role}. Try logging in as ${user.role}.`); return; }

  SS.set('cms_session', { id: user.id, email: user.email, name: user.name, role: user.role });
  toast(`Welcome, ${user.name.split(' ')[0]}!`, 'success');
  navigate(user.role === 'admin' ? '#/admin' : '#/student');
}

/* ===========================================================
   SHARED SHELL (sidebar + topbar)
   =========================================================== */
function renderShell(app, opts) {
  // opts: { active, links, title, content(node) }
  const session = SS.get('cms_session');
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <a href="#/" class="brand"><span class="brand-logo" aria-hidden="true"><svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L4 14l16 8 12-6v8a2 2 0 1 0 2 0V14L20 6z" fill="#fff" fill-opacity=".95"/><path d="M10 20v6c0 2.5 4.5 5 10 5s10-2.5 10-5v-6l-10 5-10-5z" fill="#fff" fill-opacity=".8"/></svg></span><span class="brand-text">CMS</span></a>
        ${opts.links.map(l => `
          <a href="${l.href}" class="side-link ${l.key === opts.active ? 'active' : ''}">
            <span class="icon">${icon(l.icon, 20)}</span> ${l.label}
          </a>
        `).join('')}
        <a href="#" class="side-link logout" id="logout-btn">
          <span class="icon">${icon('logout', 20)}</span> Logout
        </a>
      </aside>
      <div class="sidebar-backdrop" id="sb-backdrop"></div>
      <div class="main">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:.8rem">
            <button class="mobile-menu-btn" id="open-sb">☰</button>
            <h2>${escape(opts.title)}</h2>
          </div>
          <div class="topbar-right">
            <button class="theme-toggle" id="theme-toggle" title="Toggle theme">🌓</button>
            <div class="user-chip">
              <div class="avatar">${initials(session.name)}</div>
              <span>${escape(session.name)}</span>
            </div>
          </div>
        </div>
        <main class="content fade-in" id="content"></main>
      </div>
    </div>
  `;
  $('#theme-toggle').onclick = toggleTheme;
  $('#logout-btn').onclick = (e) => { e.preventDefault(); SS.clear(); toast('Logged out','info'); navigate('#/login'); };
  const sb = $('#sidebar'), bd = $('#sb-backdrop');
  $('#open-sb').onclick = () => { sb.classList.add('open'); bd.classList.add('show'); };
  bd.onclick = () => { sb.classList.remove('open'); bd.classList.remove('show'); };
  $$('.side-link', sb).forEach(a => a.addEventListener('click', () => { sb.classList.remove('open'); bd.classList.remove('show'); }));

  return $('#content');
}

const adminLinks = [
  { key:'dashboard',  href:'#/admin',            icon:'dashboard',  label:'Dashboard' },
  { key:'students',   href:'#/admin/students',   icon:'students',   label:'Students' },
  { key:'teachers',   href:'#/admin/teachers',   icon:'teachers',   label:'Teachers' },
  { key:'attendance', href:'#/admin/attendance', icon:'attendance', label:'Attendance' },
  { key:'results',    href:'#/admin/results',    icon:'results',    label:'Results' },
  { key:'notices',    href:'#/admin/notices',    icon:'notices',    label:'Notices' },
  { key:'profile',    href:'#/admin/profile',    icon:'profile',    label:'Profile' },
];
const studentLinks = [
  { key:'dashboard',  href:'#/student',            icon:'dashboard',  label:'Dashboard' },
  { key:'attendance', href:'#/student/attendance', icon:'attendance', label:'My Attendance' },
  { key:'results',    href:'#/student/results',    icon:'results',    label:'My Results' },
  { key:'notices',    href:'#/student/notices',    icon:'notices',    label:'Notices' },
  { key:'profile',    href:'#/student/profile',    icon:'profile',    label:'Profile' },
];

/* ===========================================================
   ADMIN — DASHBOARD
   =========================================================== */
route('/admin', (app) => {
  const c = renderShell(app, { active:'dashboard', links: adminLinks, title:'Admin Dashboard' });
  const totalStudents = State.students.length;
  const totalTeachers = State.teachers.length;
  const today = State.attendance[todayStr()] || {};
  const present = Object.values(today).filter(v => v === 'present').length;
  const attPct = totalStudents ? Math.round((present / totalStudents) * 100) : 0;

  c.innerHTML = `
    <div class="page-header dashboard-heading"><div><p class="dashboard-kicker">Admin</p><h1>Today</h1></div><span class="dashboard-date">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}</span></div>
    <div class="dashboard-actions">
      <a class="btn btn-primary" href="#/admin/students">${icon('add',16)} Add student</a>
      <a class="btn btn-ghost" href="#/admin/attendance">${icon('attendance',16)} Mark attendance</a>
      <a class="btn btn-ghost" href="#/admin/notices">${icon('notices',16)} Post notice</a>
    </div>
    <div class="stats-grid">
      ${statCard(icon('students',28),'Total Students', totalStudents,'bg-1')}
      ${statCard(icon('teachers',28),'Total Teachers', totalTeachers,'bg-2')}
      ${statCard(icon('check',28),'Today\'s Attendance', attPct + '%','bg-3')}
      ${statCard(icon('notices',28),'Notices', State.notices.length,'bg-4')}
    </div>
    <div class="dashboard-split">
      <div class="glass dashboard-panel">
        <div class="panel-heading"><div><h3>Recent notices</h3></div><a href="#/admin/notices" class="panel-link">Manage notices &rarr;</a></div>
        ${State.notices.length === 0 ? emptyState('No notices yet','Add your first announcement from the Notices tab.') :
          `<div class="notice-grid">${State.notices.slice(-4).reverse().map(noticeCard).join('')}</div>`}
      </div>
      <div class="dashboard-note">
        <h3>Attendance today</h3>
        <p>${present} of ${totalStudents} students marked present.</p>
        <div class="progress-line"><span style="width:${attPct}%"></span></div>
        <p>${totalStudents ? attPct + '% attendance recorded' : 'Add students to start tracking attendance.'}</p>
      </div>
    </div>
  `;
});

function statCard(icon, label, value, bg) {
  return `
    <div class="stat-card glass">
      <div class="stat-icon ${bg}">${icon}</div>
      <div class="stat-info">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </div>
    </div>`;
}
function emptyState(title, msg, emoji='📭') {
  return `<div class="empty"><div class="emoji">${emoji}</div><h3>${escape(title)}</h3><p>${escape(msg)}</p></div>`;
}

/* ===========================================================
   ADMIN — STUDENTS
   =========================================================== */
route('/admin/students', (app) => {
  const c = renderShell(app, { active:'students', links: adminLinks, title:'Students' });
  let query = '';

  const renderTable = () => {
    const list = State.students.filter(s =>
      !query || [s.name, s.roll, s.class, s.email].join(' ').toLowerCase().includes(query.toLowerCase())
    );
    return list.length === 0
      ? emptyState('No students found','Click "Add Student" to create one.','🎓')
      : `<div class="table-wrap"><table>
          <thead><tr><th>Name</th><th>Roll No</th><th>Class</th><th>Email</th><th></th></tr></thead>
          <tbody>${list.map(s => `
            <tr>
              <td>${escape(s.name)}</td>
              <td>${escape(s.roll)}</td>
              <td>${escape(s.class)}</td>
              <td>${escape(s.email)}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-edit="${s.id}" title="Edit">${icon('edit',16)}</button>
                <button class="icon-btn danger" data-del="${s.id}" title="Delete">${icon('trash',16)}</button>
              </div></td>
            </tr>`).join('')}
          </tbody></table></div>`;
  };

  const bindRowActions = () => {
    $$('[data-edit]', c).forEach(b => b.onclick = () => openStudentModal(b.dataset.edit));
    $$('[data-del]', c).forEach(b => b.onclick = async () => {
      if (await confirmAction({ title:'Delete student?', text:'This will permanently remove the student record.' })) {
        State.students = State.students.filter(s => s.id !== b.dataset.del);
        persist.students(); toast('Student deleted','success'); refresh();
      }
    });
  };

  const refresh = () => {
    const tbl = $('#st-list', c);
    if (tbl) tbl.innerHTML = renderTable();
    bindRowActions();
  };

  const draw = () => {
    c.innerHTML = `
      <div class="page-header">
        <h1>Students</h1>
        <button class="btn btn-primary" id="add-st">${icon('add',16)} Add Student</button>
      </div>
      <div class="toolbar">
        <span class="search-wrap"><span class="search-ico">${icon('search',16)}</span><input class="input search-input" id="search" placeholder="Search by name, roll, class..." value="${escape(query)}" autocomplete="off" /></span>
      </div>
      <div class="glass" style="padding:1rem" id="st-list">${renderTable()}</div>
    `;
    $('#add-st').onclick = () => openStudentModal();
    const searchEl = $('#search');
    searchEl.oninput = (e) => { query = e.target.value; refresh(); };
    bindRowActions();
  };

  function openStudentModal(id) {
    const editing = id ? State.students.find(s => s.id === id) : null;
    showFormModal({
      title: editing ? 'Edit student' : 'Add student',
      fields: [
        { name:'name',  label:'Full name', value: editing?.name || '' },
        { name:'roll',  label:'Roll No',   value: editing?.roll || '' },
        { name:'class', label:'Class',     value: editing?.class || '' },
        { name:'email', label:'Email', type:'email', value: editing?.email || '' },
      ],
      onSubmit: (data, setErr) => {
        if (!data.name.trim()) return setErr('name','Required');
        if (!data.roll.trim()) return setErr('roll','Required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setErr('email','Invalid email');
        const duplicate = State.students.some(s => s.id !== editing?.id && String(s.email || '').toLowerCase() === data.email.toLowerCase());
        if (duplicate) return setErr('email','A student with this email already exists');
        if (editing) { Object.assign(editing, data); toast('Student updated','success'); }
        else { State.students.push({ id: uid(), ...data }); toast('Student added','success'); }
        persist.students(); draw(); return true;
      }
    });
  }
  draw();
});

/* ===========================================================
   ADMIN — TEACHERS
   =========================================================== */
route('/admin/teachers', (app) => {
  const c = renderShell(app, { active:'teachers', links: adminLinks, title:'Teachers' });
  let query = '';

  const renderTable = () => {
    const list = State.teachers.filter(t => !query || [t.name,t.subject,t.email].join(' ').toLowerCase().includes(query.toLowerCase()));
    return list.length === 0 ? emptyState('No teachers yet','Add your first teacher to get started.','👩‍🏫') :
      `<div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Subject</th><th>Email</th><th></th></tr></thead>
        <tbody>${list.map(t => `
          <tr>
            <td>${escape(t.name)}</td>
            <td>${escape(t.subject)}</td>
            <td>${escape(t.email)}</td>
            <td><div class="row-actions">
              <button class="icon-btn" data-edit="${t.id}" title="Edit">${icon('edit',16)}</button>
              <button class="icon-btn danger" data-del="${t.id}" title="Delete">${icon('trash',16)}</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table></div>`;
  };

  const bindRowActions = () => {
    $$('[data-edit]', c).forEach(b => b.onclick = () => openTeacherModal(b.dataset.edit));
    $$('[data-del]', c).forEach(b => b.onclick = async () => {
      if (await confirmAction({ title:'Delete teacher?', text:'Remove this teacher from the system?' })) {
        State.teachers = State.teachers.filter(t => t.id !== b.dataset.del);
        persist.teachers(); toast('Teacher deleted','success'); refresh();
      }
    });
  };

  const refresh = () => {
    const tbl = $('#tc-list', c);
    if (tbl) tbl.innerHTML = renderTable();
    bindRowActions();
  };

  const draw = () => {
    c.innerHTML = `
      <div class="page-header">
        <h1>Teachers</h1>
        <button class="btn btn-primary" id="add-tc">${icon('add',16)} Add Teacher</button>
      </div>
      <div class="toolbar">
        <span class="search-wrap"><span class="search-ico">${icon('search',16)}</span><input class="input search-input" id="search" placeholder="Search teachers..." value="${escape(query)}" autocomplete="off" /></span>
      </div>
      <div class="glass" style="padding:1rem" id="tc-list">${renderTable()}</div>
    `;
    $('#search').oninput = (e) => { query = e.target.value; refresh(); };
    $('#add-tc').onclick = () => openTeacherModal();
    bindRowActions();
  };

  function openTeacherModal(id) {
    const editing = id ? State.teachers.find(t => t.id === id) : null;
    showFormModal({
      title: editing ? 'Edit teacher' : 'Add teacher',
      fields: [
        { name:'name', label:'Full name', value: editing?.name || '' },
        { name:'subject', label:'Subject', value: editing?.subject || '' },
        { name:'email', label:'Email', type:'email', value: editing?.email || '' },
      ],
      onSubmit: (data, setErr) => {
        if (!data.name.trim()) return setErr('name','Required');
        if (!data.subject.trim()) return setErr('subject','Required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setErr('email','Invalid email');
        const duplicate = State.teachers.some(t => t.id !== editing?.id && String(t.email || '').toLowerCase() === data.email.toLowerCase());
        if (duplicate) return setErr('email','A teacher with this email already exists');
        if (editing) { Object.assign(editing, data); toast('Teacher updated','success'); }
        else { State.teachers.push({ id: uid(), ...data }); toast('Teacher added','success'); }
        persist.teachers(); draw(); return true;
      }
    });
  }
  draw();
});

/* ===========================================================
   ADMIN — ATTENDANCE
   =========================================================== */
route('/admin/attendance', (app) => {
  const c = renderShell(app, { active:'attendance', links: adminLinks, title:'Attendance' });
  let date = todayStr();

  const draw = () => {
    const day = State.attendance[date] || {};
    c.innerHTML = `
      <div class="page-header">
        <h1>Mark Attendance</h1>
        <input class="input" type="date" id="date" value="${date}" style="max-width:200px" />
      </div>
      <div class="glass" style="padding:1.2rem">
        ${State.students.length === 0 ? emptyState('No students to mark','Add students first.','🎓') : `
          <div class="attendance-list">
            ${State.students.map(s => `
              <div class="att-row">
                <div class="who">
                  <div class="avatar">${initials(s.name)}</div>
                  <div>
                    <div style="font-weight:600">${escape(s.name)}</div>
                    <div class="roll">${escape(s.roll)} · ${escape(s.class)}</div>
                  </div>
                </div>
                <div class="att-actions">
                  <button class="att-btn ${day[s.id]==='present'?'active present':''}" data-mark="present" data-id="${s.id}">Present</button>
                  <button class="att-btn ${day[s.id]==='absent'?'active absent':''}" data-mark="absent" data-id="${s.id}">Absent</button>
                </div>
              </div>`).join('')}
          </div>
        `}
      </div>

      <h2 style="margin:2rem 0 1rem;font-size:1.2rem">Past records</h2>
      <div class="glass" style="padding:1rem">
        ${Object.keys(State.attendance).length === 0 ? emptyState('No past records','Marked attendance will appear here.','🗓️') : `
          <div class="table-wrap"><table>
            <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Total</th></tr></thead>
            <tbody>${Object.keys(State.attendance).sort().reverse().map(d => {
              const v = Object.values(State.attendance[d] || {});
              const p = v.filter(x=>x==='present').length, a = v.filter(x=>x==='absent').length;
              return `<tr><td>${d}</td><td><span class="badge badge-success">${p}</span></td><td><span class="badge badge-danger">${a}</span></td><td>${p+a}</td></tr>`;
            }).join('')}</tbody>
          </table></div>`}
      </div>
    `;
    $('#date').onchange = (e) => { date = e.target.value || todayStr(); draw(); };
    $$('[data-mark]', c).forEach(b => b.onclick = () => {
      State.attendance[date] = State.attendance[date] || {};
      State.attendance[date][b.dataset.id] = b.dataset.mark;
      persist.attendance(); draw();
    });
  };
  draw();
});

/* ===========================================================
   ADMIN — RESULTS
   =========================================================== */
route('/admin/results', (app) => {
  const c = renderShell(app, { active:'results', links: adminLinks, title:'Results' });

  const draw = () => {
    c.innerHTML = `
      <div class="page-header"><h1>Student Results</h1></div>
      <div class="glass" style="padding:1rem">
        ${State.students.length === 0 ? emptyState('No students','Add students before entering results.','🎓') : `
          <div class="table-wrap"><table>
            <thead><tr><th>Student</th><th>Roll</th><th>Subjects</th><th>Total</th><th>%</th><th></th></tr></thead>
            <tbody>${State.students.map(s => {
              const marks = State.results[s.id] || [];
              const total = marks.reduce((a,m)=>a+Number(m.score||0),0);
              const max = marks.length * 100;
              const pct = max ? Math.round((total/max)*100) : 0;
              return `<tr>
                <td>${escape(s.name)}</td>
                <td>${escape(s.roll)}</td>
                <td>${marks.length || '<span style="color:var(--text-dim)">—</span>'}</td>
                <td>${marks.length ? total : '—'}</td>
                <td>${marks.length ? pct + '%' : '—'}</td>
                <td><button class="btn btn-sm btn-primary" data-edit="${s.id}">Enter Marks</button></td>
              </tr>`;
            }).join('')}</tbody>
          </table></div>`}
      </div>
    `;
    $$('[data-edit]', c).forEach(b => b.onclick = () => openResultModal(b.dataset.edit));
  };

  function openResultModal(studentId) {
    const stu = State.students.find(s => s.id === studentId);
    let rows = [...(State.results[studentId] || [])];
    if (rows.length === 0) rows = [{ subject:'', score:'' }];

    const m = $('#confirm-modal');
    // Build a tailored modal manually
    const overlay = document.createElement('div');
    overlay.className = 'modal form-modal';
    overlay.innerHTML = `
      <div class="modal-card glass">
        <h3>Marks · ${escape(stu.name)}</h3>
        <p>Add subjects and scores (out of 100).</p>
        <div id="rows" style="display:flex;flex-direction:column;gap:.6rem;margin-bottom:1rem;max-height:50vh;overflow-y:auto"></div>
        <button type="button" class="btn btn-ghost btn-sm" id="add-row">+ Add subject</button>
        <div class="modal-actions" style="margin-top:1.2rem">
          <button class="btn btn-ghost" id="r-cancel">Cancel</button>
          <button class="btn btn-primary" id="r-save">Save</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const renderRows = () => {
      const wrap = overlay.querySelector('#rows');
      wrap.innerHTML = rows.map((r,i) => `
        <div style="display:grid;grid-template-columns:1fr 110px 40px;gap:.5rem">
          <input class="input" placeholder="Subject" data-i="${i}" data-k="subject" value="${escape(r.subject)}" />
          <input class="input" placeholder="Score" type="number" min="0" max="100" data-i="${i}" data-k="score" value="${escape(r.score)}" />
          <button class="icon-btn danger" data-del="${i}" title="Remove">✕</button>
        </div>`).join('');
      $$('input', wrap).forEach(inp => inp.oninput = (e) => {
        rows[+e.target.dataset.i][e.target.dataset.k] = e.target.value;
      });
      $$('[data-del]', wrap).forEach(b => b.onclick = () => { rows.splice(+b.dataset.del,1); if(rows.length===0) rows.push({subject:'',score:''}); renderRows(); });
    };
    renderRows();

    overlay.querySelector('#add-row').onclick = () => { rows.push({ subject:'', score:'' }); renderRows(); };
    overlay.querySelector('#r-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#r-save').onclick = () => {
      const invalid = rows.some(r => (r.subject.trim() || r.score !== '') && (!r.subject.trim() || r.score === '' || Number(r.score) < 0 || Number(r.score) > 100));
      if (invalid) { toast('Enter a subject and a score from 0 to 100', 'error'); return; }
      const cleaned = rows.filter(r => r.subject.trim() && r.score !== '').map(r => ({ subject: r.subject.trim(), score: Number(r.score) }));
      State.results[studentId] = cleaned;
      persist.results();
      toast('Results saved','success');
      overlay.remove();
      draw();
    };
  }
  draw();
});

/* ===========================================================
   ADMIN — NOTICES
   =========================================================== */
route('/admin/notices', (app) => {
  const c = renderShell(app, { active:'notices', links: adminLinks, title:'Notices' });

  const draw = () => {
    c.innerHTML = `
      <div class="page-header">
        <h1>Notices</h1>
        <button class="btn btn-primary" id="add-n">+ New Notice</button>
      </div>
      ${State.notices.length === 0 ? `<div class="glass" style="padding:1rem">${emptyState('No notices','Post your first announcement.','📢')}</div>` :
        `<div class="notice-grid">${State.notices.slice().reverse().map(n => `
          <div class="notice glass">
            <div class="meta">
              <span class="badge badge-info">Notice</span>
              <span class="date">${n.date}</span>
            </div>
            <h4>${escape(n.title)}</h4>
            <p>${escape(n.body)}</p>
            <div class="row-actions" style="margin-top:.8rem">
              <button class="icon-btn" data-edit="${n.id}" title="Edit">${icon('edit',16)}</button>
              <button class="icon-btn danger" data-del="${n.id}" title="Delete">${icon('trash',16)}</button>
            </div>
          </div>`).join('')}</div>`}
    `;
    $('#add-n').onclick = () => openNoticeModal();
    $$('[data-edit]', c).forEach(b => b.onclick = () => openNoticeModal(b.dataset.edit));
    $$('[data-del]', c).forEach(b => b.onclick = async () => {
      if (await confirmAction({ title:'Delete notice?', text:'Remove this announcement?' })) {
        State.notices = State.notices.filter(n => n.id !== b.dataset.del);
        persist.notices(); toast('Notice deleted','success'); draw();
      }
    });
  };

  function openNoticeModal(id) {
    const editing = id ? State.notices.find(n => n.id === id) : null;
    showFormModal({
      title: editing ? 'Edit notice' : 'New notice',
      fields: [
        { name:'title', label:'Title', value: editing?.title || '' },
        { name:'body',  label:'Message', value: editing?.body || '', type:'textarea' },
      ],
      onSubmit: (data, setErr) => {
        if (!data.title.trim()) return setErr('title','Required');
        if (!data.body.trim()) return setErr('body','Required');
        if (editing) { Object.assign(editing, data); toast('Notice updated','success'); }
        else { State.notices.push({ id: uid(), title:data.title, body:data.body, date: todayStr() }); toast('Notice posted','success'); }
        persist.notices(); draw(); return true;
      }
    });
  }
  draw();
});

function noticeCard(n) {
  return `
    <div class="notice glass">
      <div class="meta"><span class="badge badge-info">Notice</span><span class="date">${n.date}</span></div>
      <h4>${escape(n.title)}</h4>
      <p>${escape(n.body)}</p>
    </div>`;
}

/* ===========================================================
   ADMIN — PROFILE
   =========================================================== */
route('/admin/profile', (app) => {
  const c = renderShell(app, { active:'profile', links: adminLinks, title:'Profile' });
  c.appendChild(buildProfileView('admin'));
});

/* ===========================================================
   STUDENT — DASHBOARD
   =========================================================== */
route('/student', (app) => {
  const c = renderShell(app, { active:'dashboard', links: studentLinks, title:'Student Panel' });
  const session = SS.get('cms_session');
  const me = State.students.find(s => s.email.toLowerCase() === session.email.toLowerCase());
  const myAtt = computeMyAttendance(me?.id);
  const myResults = me ? (State.results[me.id] || []) : [];
  const total = myResults.reduce((a,m)=>a+Number(m.score||0),0);
  const pct = myResults.length ? Math.round((total/(myResults.length*100))*100) : 0;

  c.innerHTML = `
    <div class="page-header dashboard-heading"><div><p class="dashboard-kicker">Student</p><h1>Welcome, ${escape(session.name.split(' ')[0])}</h1></div><span class="dashboard-date">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}</span></div>
    <div class="dashboard-actions">
      <a class="btn btn-ghost" href="#/student/attendance">${icon('attendance',16)} View attendance</a>
      <a class="btn btn-ghost" href="#/student/results">${icon('results',16)} View results</a>
      <a class="btn btn-ghost" href="#/student/notices">${icon('notices',16)} Read notices</a>
    </div>
    <div class="stats-grid">
      ${statCard(icon('profile',28),'Roll No', escape(me?.roll || '—'),'bg-1')}
      ${statCard(icon('attendance',28),'Attendance', myAtt.pct + '%','bg-2')}
      ${statCard(icon('results',28),'Result %', myResults.length ? pct + '%' : '—','bg-3')}
      ${statCard(icon('notices',28),'Notices', State.notices.length,'bg-4')}
    </div>
    <div class="dashboard-split">
      <div class="glass dashboard-panel">
        <div class="panel-heading"><div><h3>Latest notices</h3></div><a href="#/student/notices" class="panel-link">See all &rarr;</a></div>
        ${State.notices.length === 0 ? emptyState('No notices','Check back later.') :
          `<div class="notice-grid">${State.notices.slice(-4).reverse().map(noticeCard).join('')}</div>`}
      </div>
      <div class="dashboard-note">
        <h3>Your attendance</h3>
        <p>${myAtt.total ? `${myAtt.present} present days out of ${myAtt.total} recorded.` : 'No attendance records have been added yet.'}</p>
        <div class="progress-line"><span style="width:${myAtt.pct}%"></span></div>
        <p>${myAtt.total ? myAtt.pct + '% attendance' : 'Your percentage will appear here.'}</p>
      </div>
    </div>
  `;
});

function computeMyAttendance(studentId) {
  if (!studentId) return { present:0, absent:0, total:0, pct:0 };
  let present = 0, absent = 0;
  Object.values(State.attendance).forEach(day => {
    if (day[studentId] === 'present') present++;
    else if (day[studentId] === 'absent') absent++;
  });
  const total = present + absent;
  return { present, absent, total, pct: total ? Math.round((present/total)*100) : 0 };
}

/* ===========================================================
   STUDENT — ATTENDANCE
   =========================================================== */
route('/student/attendance', (app) => {
  const c = renderShell(app, { active:'attendance', links: studentLinks, title:'My Attendance' });
  const session = SS.get('cms_session');
  const me = State.students.find(s => s.email.toLowerCase() === session.email.toLowerCase());
  const stats = computeMyAttendance(me?.id);

  const rows = Object.keys(State.attendance).sort().reverse().map(d => {
    const status = State.attendance[d][me?.id];
    if (!status) return '';
    return `<tr><td>${d}</td><td><span class="badge badge-${status==='present'?'success':'danger'}">${status}</span></td></tr>`;
  }).filter(Boolean).join('');

  c.innerHTML = `
    <div class="page-header"><h1>My Attendance</h1></div>
    <div class="stats-grid">
      ${statCard('✅','Present', stats.present,'bg-3')}
      ${statCard('❌','Absent', stats.absent,'bg-4')}
      ${statCard('📊','Percentage', stats.pct + '%','bg-1')}
    </div>
    <div class="glass" style="padding:1rem">
      ${rows ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` :
        emptyState('No records yet','Your attendance will appear here once marked.','🗓️')}
    </div>
  `;
});

/* ===========================================================
   STUDENT — RESULTS
   =========================================================== */
route('/student/results', (app) => {
  const c = renderShell(app, { active:'results', links: studentLinks, title:'My Results' });
  const session = SS.get('cms_session');
  const me = State.students.find(s => s.email.toLowerCase() === session.email.toLowerCase());
  const marks = me ? (State.results[me.id] || []) : [];
  const total = marks.reduce((a,m)=>a+Number(m.score||0),0);
  const max = marks.length * 100;
  const pct = max ? Math.round((total/max)*100) : 0;

  c.innerHTML = `
    <div class="page-header"><h1>My Results</h1></div>
    <div class="glass" style="padding:1.2rem">
      ${marks.length === 0 ? emptyState('No results yet','Your scores will be published here.','📈') : `
        <div class="table-wrap"><table>
          <thead><tr><th>Subject</th><th>Score</th><th>Out of</th></tr></thead>
          <tbody>${marks.map(m => `<tr><td>${escape(m.subject)}</td><td><strong>${escape(m.score)}</strong></td><td>100</td></tr>`).join('')}</tbody>
        </table></div>
        <div class="result-summary">
          <div><div style="font-size:.85rem;opacity:.85">Total</div><div class="big">${total}/${max}</div></div>
          <div style="text-align:right"><div style="font-size:.85rem;opacity:.85">Percentage</div><div class="big">${pct}%</div></div>
        </div>
      `}
    </div>
  `;
});

/* ===========================================================
   STUDENT — NOTICES
   =========================================================== */
route('/student/notices', (app) => {
  const c = renderShell(app, { active:'notices', links: studentLinks, title:'Notices' });
  c.innerHTML = `
    <div class="page-header"><h1>Notices</h1></div>
    ${State.notices.length === 0 ? `<div class="glass" style="padding:1rem">${emptyState('No notices','Check back later.','📢')}</div>` :
      `<div class="notice-grid">${State.notices.slice().reverse().map(noticeCard).join('')}</div>`}
  `;
});

/* ===========================================================
   STUDENT — PROFILE
   =========================================================== */
route('/student/profile', (app) => {
  const c = renderShell(app, { active:'profile', links: studentLinks, title:'Profile' });
  c.appendChild(buildProfileView('student'));
});

/* ===========================================================
   PROFILE VIEW (shared)
   =========================================================== */
function buildProfileView(role) {
  const session = SS.get('cms_session');
  const user = State.users.find(u => u.id === session.id);
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="page-header"><h1>My Profile</h1></div>
    <div class="profile-card glass">
      <div class="profile-head">
        <div class="avatar">${initials(user.name)}</div>
        <div>
          <h2>${escape(user.name)}</h2>
          <div class="role">${escape(user.email)} · <span class="badge badge-info">${user.role}</span></div>
        </div>
      </div>
      <form id="profile-form">
        <div class="form-group">
          <label>Full name</label>
          <input class="input" name="name" value="${escape(user.name)}" />
          <small class="field-error" data-for="name"></small>
        </div>
        <div class="form-group">
          <label>New password (leave blank to keep current)</label>
          <div class="password-wrap">
            <input class="input" name="password" type="password" placeholder="••••••••" />
            <button type="button" class="toggle-pass">SHOW</button>
          </div>
          <small class="field-error" data-for="password"></small>
        </div>
        <button class="btn btn-primary" type="submit">Save changes</button>
      </form>
    </div>
  `;
  setTimeout(() => {
    bindPasswordToggles(wrap);
    wrap.querySelector('#profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const f = e.target;
      setError(f,'name',''); setError(f,'password','');
      if (!data.name.trim()) return setError(f,'name','Required');
      if (data.password && data.password.length < 6) return setError(f,'password','At least 6 characters');
      user.name = data.name.trim();
      if (data.password) user.password = data.password;
      persist.users();
      // sync student record
      const st = State.students.find(s => s.email.toLowerCase() === user.email.toLowerCase());
      if (st) { st.name = user.name; persist.students(); }
      // update session
      SS.set('cms_session', { ...session, name: user.name });
      toast('Profile updated','success');
      render();
    });
  }, 0);
  return wrap;
}

/* ===========================================================
   GENERIC FORM MODAL
   =========================================================== */
function showFormModal({ title, fields, onSubmit }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal form-modal';
  overlay.innerHTML = `
    <div class="modal-card glass">
      <h3>${escape(title)}</h3>
      <p style="margin-bottom:1.2rem">Fill in the details below.</p>
      <form id="fm-form">
        ${fields.map(f => `
          <div class="form-group">
            <label>${escape(f.label)}</label>
            ${f.type === 'textarea'
              ? `<textarea class="input" name="${f.name}" rows="4">${escape(f.value || '')}</textarea>`
              : `<input class="input" name="${f.name}" type="${f.type || 'text'}" value="${escape(f.value || '')}" />`}
            <small class="field-error" data-for="${f.name}"></small>
          </div>`).join('')}
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="fm-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  const form = overlay.querySelector('#fm-form');
  const setErr = (n, m) => { setError(form, n, m); return false; };
  overlay.querySelector('#fm-cancel').onclick = () => overlay.remove();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach(f => setError(form, f.name, ''));
    const data = Object.fromEntries(new FormData(form).entries());
    const ok = onSubmit(data, setErr);
    if (ok) overlay.remove();
  });
}

/* ===========================================================
   BOOTSTRAP
   =========================================================== */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => $('#loader')?.classList.add('hidden'), 400);
  // Use replaceState so the bare URL doesn't pollute history (back button works to landing)
  if (!location.hash) history.replaceState(null, '', '#/');
  render();
});
