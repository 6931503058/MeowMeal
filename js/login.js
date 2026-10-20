/* login.js – ระบบ Sign in / Forgot password / Register ที่แสดงในกรอบ .phone เดียวกับแอป
   ทำงานเป็น "ด่านตรวจ": ยังไม่ล็อกอิน = เห็นหน้า login คลุมแอป / ล็อกอินแล้ว = ซ่อนหน้า login
   ไม่ต้องพึ่ง App.register จึงไม่ยุ่งกับ router ใน app.js
   หมายเหตุ: เดโมฝั่งเบราว์เซอร์ (localStorage) ยังไม่ใช่ความปลอดภัยจริง ต้องมี backend */
(function () {
  'use strict';

  const USERS_KEY = 'meowmeal_users';
  const SESSION_KEY = 'meowmeal_session';

  /* ---- กติกา (แก้ที่นี่ที่เดียว ข้อความบนหน้าจอใช้ค่าเหล่านี้) ---- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const USERNAME_RE = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/;   // ตัวอักษร/ตัวเลข คั่นด้วยขีดกลางเดี่ยว ไม่ขึ้นต้น/ลงท้ายด้วยขีด
  const passwordOk = pw => pw.length >= 10 || (pw.length >= 8 && /\d/.test(pw) && /[a-z]/.test(pw));
  const MSG_USER = 'Use English letters and digits. A single hyphen may separate parts (not at the start or end).';
  const MSG_PW = 'Use at least 10 characters, or at least 8 with a digit and a lowercase letter.';

  const $ = id => document.getElementById(id);
  const overlay = $('auth-overlay');
  if (!overlay) return;                                   // ไม่มี markup = ไม่ทำอะไร
  const APP_PARTS = ['.app-header', '.content', '.tabbar']; // ส่วนของแอปที่ต้องกดไม่ได้ตอนยังไม่ล็อกอิน

  /* ---- localStorage ---- */
  function read(k, fb) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  const hex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));
  async function hash(pw, salt) { return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw))); }

  /* ---- ตัวช่วยแสดงผล ---- */
  function fieldError(id, msg) {
    $(id).classList.toggle('field-error', !!msg);
    const e = $(id + '-err'); e.hidden = !msg; e.textContent = msg || '';
  }
  function status(id, kind, msg) {
    const e = $(id); e.hidden = !msg; e.className = 'auth-status ' + (kind || ''); e.textContent = msg || '';
  }
  function showView(view) {
    ['signin', 'forgot', 'register'].forEach(v => { $('au-view-' + v).hidden = (v !== view); });
    overlay.querySelectorAll('input').forEach(i => { if (i.type === 'password') i.value = ''; i.classList.remove('field-error'); });
    overlay.querySelectorAll('.auth-err').forEach(e => { e.hidden = true; e.textContent = ''; });
    ['au-si-status', 'au-fp-status', 'au-rg-status'].forEach(id => status(id, '', ''));
  }
  function setAppInert(on) {                              // ล็อกโฟกัส/คลิกของแอปด้านหลังตอนแสดงหน้า login
    APP_PARTS.forEach(sel => { const el = document.querySelector(sel); if (el) el.inert = on; });
  }
  function fillAccount(session) {                         // แสดงชื่อผู้ใช้ในหน้า Settings
    const el = $('acct-name'); if (el) el.textContent = session ? session.username : '–';
  }

  function openAuth(view) {
    overlay.hidden = false; setAppInert(true); showView(view || 'signin');
    const first = overlay.querySelector('#au-view-' + (view || 'signin') + ' input'); if (first) first.focus();
  }
  function closeAuth(session) {
    overlay.hidden = true; setAppInert(false); fillAccount(session);
    const same = (location.hash === '#home');             // ถ้าอยู่ #home อยู่แล้ว hashchange จะไม่เกิด
    location.hash = '#home';                              // ล็อกอินแล้วไปหน้า Home
    if (same && typeof App !== 'undefined') App.refresh(); // จึงสั่ง router วาดหน้าใหม่เอง
  }

  /* ---- ลิงก์สลับหน้า ---- */
  overlay.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => showView(b.dataset.go)));

  /* ---- Sign in ---- */
  $('au-signin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('au-si-email').value.trim().toLowerCase(), pw = $('au-si-pw').value;
    const eErr = EMAIL_RE.test(email) ? '' : 'Please enter a valid email';
    const pErr = pw ? '' : 'Please enter your password';
    fieldError('au-si-email', eErr); fieldError('au-si-pw', pErr); status('au-si-status', '', '');
    if (eErr || pErr) return;
    $('au-si-btn').disabled = true;
    try {
      const user = read(USERS_KEY, []).find(u => u.email === email);
      const ok = user && (await hash(pw, user.salt)) === user.passwordHash;
      if (!ok) status('au-si-status', 'bad', 'Invalid email or password');       // ข้อความเดียวกันทุกกรณี
      else { const s = { userId: user.id, username: user.username }; write(SESSION_KEY, s); closeAuth(s); }
    } catch (err) {
      status('au-si-status', 'bad', 'Sign in is not available here. Open the app via localhost or https.');
    }
    $('au-si-btn').disabled = false;
  });

  /* ---- Forgot password (จำลอง: ยังไม่ส่งอีเมลจริง ต้องมี backend) ---- */
  $('au-forgot-form').addEventListener('submit', e => {
    e.preventDefault();
    const ok = EMAIL_RE.test($('au-fp-email').value.trim());
    fieldError('au-fp-email', ok ? '' : 'Please enter a valid email');
    status('au-fp-status', ok ? 'ok' : '', ok ? 'If this email has an account, a password reset link will be sent to it.' : '');
  });

  /* ---- Register ---- */
  $('au-register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('au-rg-email').value.trim().toLowerCase(), username = $('au-rg-user').value.trim(), pw = $('au-rg-pw').value;
    const users = read(USERS_KEY, []), err = {};
    if (!EMAIL_RE.test(email)) err.email = 'Please enter a valid email';
    else if (users.some(u => u.email === email)) err.email = 'This email is already in use';
    if (!USERNAME_RE.test(username)) err.user = MSG_USER;
    else if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) err.user = 'This username is already in use';
    if (!passwordOk(pw)) err.pw = MSG_PW;
    fieldError('au-rg-email', err.email); fieldError('au-rg-user', err.user); fieldError('au-rg-pw', err.pw);
    status('au-rg-status', '', '');
    if (Object.keys(err).length) return;
    $('au-rg-btn').disabled = true;
    try {
      const salt = newSalt();
      const user = { id: 'u-' + Date.now(), email, username, salt, passwordHash: await hash(pw, salt), createdAt: new Date().toISOString() };
      users.push(user);
      if (!write(USERS_KEY, users)) status('au-rg-status', 'bad', 'Unable to save the account. Browser storage may be full.');
      else { const s = { userId: user.id, username }; write(SESSION_KEY, s); closeAuth(s); }
    } catch (e2) {
      status('au-rg-status', 'bad', 'Account creation is not available here. Open the app via localhost or https.');
    }
    $('au-rg-btn').disabled = false;
  });

  /* ---- Sign out (ปุ่มอยู่ในหน้า Settings) ---- */
  const so = $('btn-signout');
  if (so) so.addEventListener('click', () => { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} fillAccount(null); openAuth('signin'); });

  /* ---- เริ่มต้น: ล็อกอินค้างอยู่ = เข้าแอปเลย / ไม่มี = แสดงหน้า login ---- */
  const session = read(SESSION_KEY, null);
  if (session && session.username) { overlay.hidden = true; setAppInert(false); fillAccount(session); }
  else openAuth('signin');

  window.MeowAuth = { getSession: () => read(SESSION_KEY, null), open: openAuth };   // เผื่อไฟล์อื่นเรียกใช้
})();
