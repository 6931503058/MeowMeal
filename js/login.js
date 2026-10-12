/*
   login_commented.js – หน้า Sign in / Forgot password / Create account (ฉบับมีคำอธิบายทุกบรรทัด)
   ทำงานเหมือน login.js เดิมทุกอย่าง ใช้แทนกันได้ (อย่าโหลดสองไฟล์พร้อมกัน)
   ต้องมีใน index.html:  <section id="login-root"></section>
   หมายเหตุ: เก็บบัญชีใน localStorage = ต้นแบบสำหรับสาธิต ยังไม่ใช่ความปลอดภัยจริง (ต้องมี backend)
*/

const Auth = (() => {                                                   // โมดูลจัดการบัญชี (ซ่อนตัวแปรภายในไว้)
  const USERS_KEY = 'meowmeal_users';                                   // key เก็บรายชื่อบัญชีทั้งหมด
  const SESSION_KEY = 'meowmeal_session';                               // key เก็บผู้ใช้ที่ล็อกอินอยู่

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;                        // อีเมลต้องมี @ และมีจุดหลัง @
  // ตัวอักษรหรือตัวเลข คั่นด้วยขีดกลางได้ทีละ 1 ตัว ; ห้ามขึ้นต้น/ลงท้าย/ขีดกลางติดกัน
  const USERNAME_RE = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/;                 // กฎชื่อผู้ใช้ (ตัวอักษรอังกฤษและตัวเลข)

  function read(key, fallback) {                                        // อ่านค่าจาก localStorage
    try {                                                               // กันแอปพังถ้าอ่านไม่ได้
      const raw = localStorage.getItem(key);                            // ดึงข้อความที่เก็บไว้
      return raw ? JSON.parse(raw) : fallback;                          // มี = แปลงเป็นข้อมูล / ไม่มี = ใช้ค่าสำรอง
    } catch (e) { return fallback; }                                    // ผิดพลาด = ใช้ค่าสำรอง
  }                                                                     // จบ read
  function write(key, value) {                                          // เขียนค่าลง localStorage
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } // แปลงเป็นข้อความแล้วเก็บ สำเร็จ = true
    catch (e) { return false; }                                         // เก็บไม่ได้ (เช่นเต็ม) = false
  }                                                                     // จบ write

  const isEmail = (s) => EMAIL_RE.test(s);                              // ตรวจรูปแบบอีเมล
  const usernameOk = (s) => USERNAME_RE.test(s);                        // ตรวจกฎชื่อผู้ใช้
  // ยาว >= 10 ตัว  หรือ  ยาว >= 8 ตัวและมีตัวเลข + ตัวพิมพ์เล็กอย่างน้อยอย่างละ 1
  const passwordOk = (pw) =>                                            // ตรวจกฎรหัสผ่านตอนสมัคร
    pw.length >= 10 || (pw.length >= 8 && /\d/.test(pw) && /[a-z]/.test(pw)); // กฎ 1 หรือ กฎ 2 อย่างใดอย่างหนึ่ง

  // แฮชรหัสผ่านด้วย SHA-256 + salt (ไม่เก็บรหัสผ่านจริง)
  async function hash(password, salt) {                                 // คืนค่าแฮชของรหัสผ่าน
    const data = new TextEncoder().encode(salt + ':' + password);       // รวม salt กับรหัสผ่านแล้วแปลงเป็นไบต์
    const buf = await crypto.subtle.digest('SHA-256', data);            // คำนวณ SHA-256 ด้วย Web Crypto
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); // แปลงเป็นข้อความ hex
  }                                                                     // จบ hash
  function newSalt() {                                                  // สร้าง salt สุ่มให้แต่ละบัญชี
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))       // สุ่ม 16 ไบต์
      .map(b => b.toString(16).padStart(2, '0')).join('');              // แปลงเป็นข้อความ hex
  }                                                                     // จบ newSalt

  const getUsers = () => read(USERS_KEY, []);                           // รายชื่อบัญชีทั้งหมด (ไม่มี = array ว่าง)
  const getSession = () => read(SESSION_KEY, null);                     // null = ยังไม่ได้เข้าสู่ระบบ
  const signOut = () => localStorage.removeItem(SESSION_KEY);           // ออกจากระบบ = ลบ session

  // คืน { ok:true } หรือ { errors:{ email, username, password } }
  async function register(email, username, password) {                 // สมัครสมาชิก
    email = email.trim().toLowerCase();                                 // ตัดช่องว่าง + ทำเป็นตัวพิมพ์เล็ก
    username = username.trim();                                         // ตัดช่องว่างหน้า/หลัง
    const errors = {};                                                  // รวมข้อความ error ของแต่ละช่อง
    if (!isEmail(email)) errors.email = 'Enter a valid email address.'; // อีเมลรูปแบบผิด
    if (!usernameOk(username)) {                                        // ชื่อผู้ใช้ผิดกฎ
      errors.username = 'Use letters and numbers, with single hyphens between them (no hyphen at the start or end).'; // ข้อความอธิบายกฎ
    }                                                                   // จบ if ชื่อผู้ใช้
    if (!passwordOk(password)) {                                        // รหัสผ่านไม่ผ่านกฎ
      errors.password = 'Use at least 10 characters, or at least 8 with a number and a lowercase letter.'; // ข้อความอธิบายกฎ
    }                                                                   // จบ if รหัสผ่าน
    const users = getUsers();                                           // บัญชีที่มีอยู่แล้ว
    if (!errors.email && users.some(u => u.email === email)) errors.email = 'This email is already registered.'; // กันอีเมลซ้ำ
    if (!errors.username && users.some(u => u.username.toLowerCase() === username.toLowerCase())) { // กันชื่อซ้ำ (ไม่สนตัวพิมพ์)
      errors.username = 'This username is already taken.';              // ข้อความชื่อซ้ำ
    }                                                                   // จบ if ชื่อซ้ำ
    if (Object.keys(errors).length > 0) return { errors };              // มี error = หยุด ไม่สร้างบัญชี

    const salt = newSalt();                                             // salt ใหม่สำหรับบัญชีนี้
    const user = {                                                      // ข้อมูลบัญชีที่จะเก็บ
      id: 'u-' + Date.now(), email, username, salt,                     // รหัสบัญชี อีเมล ชื่อผู้ใช้ และ salt
      passwordHash: await hash(password, salt),                         // เก็บเฉพาะแฮช ไม่เก็บรหัสจริง
      createdAt: new Date().toISOString()                               // เวลาที่สร้างบัญชี
    };                                                                  // จบ object user
    users.push(user);                                                   // เพิ่มเข้ารายชื่อ
    if (!write(USERS_KEY, users)) return { errors: { form: 'Could not save. Browser storage may be full.' } }; // เก็บไม่ได้ = แจ้ง error
    write(SESSION_KEY, { userId: user.id, username: user.username });   // สมัครเสร็จ = ล็อกอินให้เลย
    return { ok: true };                                                // สำเร็จ
  }                                                                     // จบ register

  // ข้อความผิดพลาดเดียวกันทุกกรณี เพื่อไม่บอกว่าอีเมลนี้มีบัญชีอยู่หรือไม่
  async function signIn(email, password) {                              // เข้าสู่ระบบ
    email = email.trim().toLowerCase();                                 // จัดรูปอีเมลให้เหมือนตอนสมัคร
    const user = getUsers().find(u => u.email === email);               // หาบัญชีที่อีเมลตรงกัน
    const ok = user && (await hash(password, user.salt)) === user.passwordHash; // แฮชรหัสที่กรอกแล้วเทียบกับที่เก็บไว้
    if (!ok) return { error: 'Incorrect email or password.' };          // ไม่พบบัญชีหรือรหัสไม่ตรง = ข้อความเดียวกัน
    write(SESSION_KEY, { userId: user.id, username: user.username });   // จำผู้ใช้ที่ล็อกอิน
    return { ok: true };                                                // สำเร็จ
  }                                                                     // จบ signIn

  // จำลอง: ยังไม่ส่งอีเมลจริง (ต้องใช้ backend) ตอบข้อความเดิมเสมอ
  function requestReset(email) {                                        // ขอลิงก์รีเซ็ตรหัสผ่าน
    return { ok: isEmail(email.trim()) };                               // ตรวจแค่รูปแบบอีเมล (ยังไม่ส่งจริง)
  }                                                                     // จบ requestReset

  return { isEmail, usernameOk, passwordOk, register, signIn, requestReset, getSession, signOut }; // ฟังก์ชันที่เปิดให้ไฟล์อื่นใช้
})();                                                                   // จบโมดูล Auth

/* ---------------- UI ---------------- */

// markup คงที่ ไม่มีข้อมูลผู้ใช้ปนอยู่ (ข้อความ error ใส่ด้วย textContent ทุกครั้ง)
const LOGIN_VIEWS = `
<section class="lg-view" id="lg-signin">                                <!-- หน้าเข้าสู่ระบบ -->
  <h2>Sign in</h2>                                                      <!-- หัวข้อ -->
  <form id="lg-signin-form" novalidate>                                 <!-- ฟอร์ม (ปิดการตรวจของเบราว์เซอร์ ใช้ของเราเอง) -->
    <label for="lg-si-email">Email</label>                              <!-- ป้ายช่องอีเมล -->
    <input id="lg-si-email" type="email" autocomplete="email">          <!-- ช่องกรอกอีเมล -->
    <div class="field-err" id="lg-si-email-err" hidden></div>           <!-- ที่แสดง error อีเมล -->

    <label for="lg-si-pw">Password</label>                              <!-- ป้ายช่องรหัสผ่าน -->
    <input id="lg-si-pw" type="password" autocomplete="current-password"> <!-- ช่องกรอกรหัสผ่าน -->
    <div class="field-err" id="lg-si-pw-err" hidden></div>              <!-- ที่แสดง error รหัสผ่าน -->

    <button type="submit" class="btn" id="lg-si-btn">Sign in</button>   <!-- ปุ่มเข้าสู่ระบบ -->
    <div class="status" id="lg-si-status" hidden></div>                 <!-- ข้อความสถานะรวม -->
  </form>
  <p><a href="#" data-go="forgot">Forgot password?</a></p>              <!-- ลิงก์ไปหน้าลืมรหัสผ่าน -->
  <p>No account yet? <a href="#" data-go="register">Create an account</a></p> <!-- ลิงก์ไปหน้าสมัครสมาชิก -->
</section>

<section class="lg-view" id="lg-forgot" hidden>                         <!-- หน้าลืมรหัสผ่าน (ซ่อนไว้ก่อน) -->
  <h2>Forgot password?</h2>                                             <!-- หัวข้อ -->
  <p>Enter your email and we will send you a link to reset your password.</p> <!-- คำอธิบาย -->
  <form id="lg-forgot-form" novalidate>                                 <!-- ฟอร์มขอลิงก์รีเซ็ต -->
    <label for="lg-fp-email">Email</label>                              <!-- ป้ายช่องอีเมล -->
    <input id="lg-fp-email" type="email" autocomplete="email">          <!-- ช่องกรอกอีเมล -->
    <div class="field-err" id="lg-fp-email-err" hidden></div>           <!-- ที่แสดง error อีเมล -->

    <button type="submit" class="btn">Send reset link</button>          <!-- ปุ่มส่งลิงก์รีเซ็ต -->
    <div class="status" id="lg-fp-status" hidden></div>                 <!-- ข้อความสถานะ -->
  </form>
  <p><a href="#" data-go="signin">Back to sign in</a></p>               <!-- กลับหน้าเข้าสู่ระบบ -->
</section>

<section class="lg-view" id="lg-register" hidden>                       <!-- หน้าสมัครสมาชิก (ซ่อนไว้ก่อน) -->
  <h2>Create an account</h2>                                            <!-- หัวข้อ -->
  <form id="lg-register-form" novalidate>                               <!-- ฟอร์มสมัคร -->
    <label for="lg-rg-email">Email</label>                              <!-- ป้ายช่องอีเมล -->
    <input id="lg-rg-email" type="email" autocomplete="email">          <!-- ช่องกรอกอีเมล -->
    <div class="field-err" id="lg-rg-email-err" hidden></div>           <!-- ที่แสดง error อีเมล -->

    <label for="lg-rg-user">Username</label>                            <!-- ป้ายช่องชื่อผู้ใช้ -->
    <input id="lg-rg-user" autocomplete="username">                     <!-- ช่องกรอกชื่อผู้ใช้ -->
    <div class="hint">Letters and numbers, with single hyphens between them. No hyphen at the start or end.</div> <!-- คำใบ้กฎชื่อผู้ใช้ -->
    <div class="field-err" id="lg-rg-user-err" hidden></div>            <!-- ที่แสดง error ชื่อผู้ใช้ -->

    <label for="lg-rg-pw">Password</label>                              <!-- ป้ายช่องรหัสผ่าน -->
    <input id="lg-rg-pw" type="password" autocomplete="new-password">   <!-- ช่องสร้างรหัสผ่าน -->
    <div class="hint">At least 10 characters, or at least 8 with a number and a lowercase letter.</div> <!-- คำใบ้กฎรหัสผ่าน -->
    <div class="field-err" id="lg-rg-pw-err" hidden></div>              <!-- ที่แสดง error รหัสผ่าน -->

    <button type="submit" class="btn" id="lg-rg-btn">Create account</button> <!-- ปุ่มสร้างบัญชี -->
    <div class="status" id="lg-rg-status" hidden></div>                 <!-- ข้อความสถานะ -->
  </form>
  <p>Already have an account? <a href="#" data-go="signin">Sign in</a></p> <!-- กลับไปเข้าสู่ระบบ -->
</section>`;                                                            // จบ template ของทั้ง 3 หน้า

// ใส่/ล้างข้อความ error ใต้ช่อง พร้อมไฮไลต์กรอบแดง (class เดียวกับ profile.js)
function lgFieldError(inputId, message) {                               // แสดง/ล้าง error ของช่องหนึ่ง
  const input = document.getElementById(inputId);                       // ช่องกรอก
  const err = document.getElementById(inputId + '-err');                // กล่องข้อความ error ใต้ช่อง
  input.classList.toggle('field-error', !!message);                     // มีข้อความ = ใส่กรอบแดง
  err.hidden = !message;                                                // ไม่มีข้อความ = ซ่อนกล่อง
  err.textContent = message || '';                                      // ใส่ข้อความด้วย textContent (ปลอดภัยจาก HTML)
}                                                                       // จบ lgFieldError

function lgStatus(id, kind, message) {                                  // แสดงข้อความสถานะรวมของฟอร์ม
  const el = document.getElementById(id);                               // กล่องสถานะ
  el.hidden = !message;                                                 // ไม่มีข้อความ = ซ่อน
  el.className = 'status ' + (kind || '');                              // kind = 'ok' (เขียว) หรือ 'bad' (แดง)
  el.textContent = message || '';                                       // ใส่ข้อความ
}                                                                       // จบ lgStatus

function lgShow(view) {                                                 // สลับหน้า: signin / forgot / register
  document.querySelectorAll('#login-root .lg-view').forEach(s => { s.hidden = (s.id !== 'lg-' + view); }); // แสดงเฉพาะหน้าที่เลือก
  document.querySelectorAll('#login-root input').forEach(i => {         // วนทุกช่องกรอก
    if (i.type === 'password') i.value = '';                            // ล้างรหัสผ่านทิ้งทุกครั้งที่สลับหน้า
    i.classList.remove('field-error');                                  // ล้างกรอบแดง
  });                                                                   // จบ forEach
  document.querySelectorAll('#login-root .field-err').forEach(e => { e.hidden = true; e.textContent = ''; }); // ล้างข้อความ error
  ['lg-si-status', 'lg-fp-status', 'lg-rg-status'].forEach(id => lgStatus(id, '', '')); // ล้างข้อความสถานะทั้ง 3 ฟอร์ม
}                                                                       // จบ lgShow

App.register('login', {                                                 // ลงทะเบียนหน้า 'login' ตามรูปแบบของทีม

  init() {                                                              // รันครั้งเดียวตอนโหลดแอป
    const root = document.getElementById('login-root');                 // กล่องหลักของหน้านี้
    root.innerHTML = LOGIN_VIEWS;                                       // วาดทั้ง 3 หน้าลงกล่อง

    // ลิงก์สลับหน้า: Forgot password / Create account / Back to sign in
    root.addEventListener('click', (e) => {                             // ดักคลิกทั้งกล่อง
      const link = e.target.closest('[data-go]');                       // หาลิงก์ที่มี data-go
      if (!link) return;                                                // ไม่ใช่ลิงก์สลับหน้า = ข้าม
      e.preventDefault();                                               // กันลิงก์เด้งขึ้นบนสุดของหน้า
      lgShow(link.dataset.go);                                          // ไปหน้าที่ระบุใน data-go
    });                                                                 // จบ handler คลิก

    // ---- Sign in ----
    document.getElementById('lg-signin-form').addEventListener('submit', async (e) => { // เมื่อกดเข้าสู่ระบบ
      e.preventDefault();                                               // กันหน้ารีโหลด
      const email = document.getElementById('lg-si-email').value;       // อ่านอีเมล
      const pw = document.getElementById('lg-si-pw').value;             // อ่านรหัสผ่าน

      const emailErr = Auth.isEmail(email.trim()) ? '' : 'Enter a valid email address.'; // ตรวจอีเมล
      const pwErr = pw ? '' : 'Enter your password.';                   // ตรวจว่ากรอกรหัสผ่านหรือยัง
      lgFieldError('lg-si-email', emailErr);                            // แสดง error อีเมล
      lgFieldError('lg-si-pw', pwErr);                                  // แสดง error รหัสผ่าน
      lgStatus('lg-si-status', '', '');                                 // ล้างสถานะเก่า
      if (emailErr || pwErr) return;                                    // มี error = หยุด

      const btn = document.getElementById('lg-si-btn');                 // ปุ่มเข้าสู่ระบบ
      btn.disabled = true;                                              // กันกดซ้ำระหว่างรอ
      try {                                                             // ดักข้อผิดพลาด (เช่น Web Crypto ใช้ไม่ได้)
        const result = await Auth.signIn(email, pw);                    // ลองเข้าสู่ระบบ
        if (result.ok) { location.hash = '#home'; }                     // สำเร็จ = ไปหน้า Home
        else { lgStatus('lg-si-status', 'bad', result.error); }         // ไม่สำเร็จ = แสดงข้อความ
      } catch (err) {                                                   // ถ้าเกิดข้อผิดพลาด
        lgStatus('lg-si-status', 'bad', 'Sign in is not available on this connection.'); // แจ้งให้เปิดผ่าน https/localhost
      }                                                                 // จบ try/catch
      btn.disabled = false;                                             // เปิดปุ่มกลับมา
    });                                                                 // จบ handler เข้าสู่ระบบ

    // ---- Forgot password ----
    document.getElementById('lg-forgot-form').addEventListener('submit', (e) => { // เมื่อกดส่งลิงก์รีเซ็ต
      e.preventDefault();                                               // กันหน้ารีโหลด
      const email = document.getElementById('lg-fp-email').value;       // อ่านอีเมล
      const ok = Auth.requestReset(email).ok;                           // ตรวจรูปแบบอีเมล
      lgFieldError('lg-fp-email', ok ? '' : 'Enter a valid email address.'); // แสดง/ล้าง error
      if (!ok) { lgStatus('lg-fp-status', '', ''); return; }            // ไม่ผ่าน = ล้างสถานะแล้วหยุด
      // ตอบเหมือนกันไม่ว่าอีเมลมีบัญชีหรือไม่
      lgStatus('lg-fp-status', 'ok', 'If an account exists for this email, a reset link has been sent.'); // ข้อความกลาง ๆ
    });                                                                 // จบ handler ลืมรหัสผ่าน

    // ---- Create account ----
    document.getElementById('lg-register-form').addEventListener('submit', async (e) => { // เมื่อกดสร้างบัญชี
      e.preventDefault();                                               // กันหน้ารีโหลด
      const btn = document.getElementById('lg-rg-btn');                 // ปุ่มสร้างบัญชี
      btn.disabled = true;                                              // กันกดซ้ำระหว่างรอ
      try {                                                             // ดักข้อผิดพลาด
        const result = await Auth.register(                             // ส่งข้อมูลไปสมัคร
          document.getElementById('lg-rg-email').value,                 // อีเมล
          document.getElementById('lg-rg-user').value,                  // ชื่อผู้ใช้
          document.getElementById('lg-rg-pw').value                     // รหัสผ่าน
        );                                                              // จบการเรียก register
        const errors = result.errors || {};                             // รวม error (ไม่มี = object ว่าง)
        lgFieldError('lg-rg-email', errors.email);                      // แสดง error อีเมล
        lgFieldError('lg-rg-user', errors.username);                    // แสดง error ชื่อผู้ใช้
        lgFieldError('lg-rg-pw', errors.password);                      // แสดง error รหัสผ่าน
        lgStatus('lg-rg-status', 'bad', errors.form || '');             // แสดง error ภาพรวมของฟอร์ม (ถ้ามี)
        if (result.ok) location.hash = '#home';                         // สำเร็จ = ไปหน้า Home
      } catch (err) {                                                   // ถ้าเกิดข้อผิดพลาด
        lgStatus('lg-rg-status', 'bad', 'Account creation is not available on this connection.'); // แจ้งผู้ใช้
      }                                                                 // จบ try/catch
      btn.disabled = false;                                             // เปิดปุ่มกลับมา
    });                                                                 // จบ handler สมัครสมาชิก
  },                                                                    // จบ init

  onShow() {                                                            // รันทุกครั้งที่เปิดหน้านี้
    lgShow('signin');                                                   // เริ่มที่หน้าเข้าสู่ระบบเสมอ
  }                                                                     // จบ onShow
});                                                                     // จบ App.register