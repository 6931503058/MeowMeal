/* =====================================================================
   storage.js – MeowStore: ที่เก็บข้อมูลของแอป (localStorage)
   ฉบับแยกข้อมูลตามบัญชี: ทุก key ต่อท้ายด้วย id ของผู้ใช้ที่ล็อกอินอยู่
   เช่น  meowmeal_profile__u-1728000000000
   ผู้ใช้คนใหม่ยังไม่มี key ของตัวเอง → ได้ค่าว่าง (null / []) ไม่เห็นข้อมูลของคนอื่น
   ===================================================================== */
const MeowStore = (() => {

  // key เดียวกับที่ js/login.js เขียนไว้ตอนล็อกอิน: { userId, username }
  const SESSION_KEY = 'meowmeal_session';

  // ชื่อ key ฐาน (ยังไม่ต่อท้ายผู้ใช้) รวมไว้ที่เดียว จะได้ไม่พิมพ์ผิด
  const BASE = {
    profile: 'meowmeal_profile',
    logs:    'meowmeal_logs',
    alerts:  'meowmeal_alerts'
  };

  // id ของผู้ใช้ที่ล็อกอินอยู่ (อ่านสดทุกครั้ง ไม่เก็บค้างในตัวแปร → สลับบัญชีแล้วตามทันที)
  function currentUserId() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      return (s && s.userId) || null;
    } catch (e) {
      return null;
    }
  }

  // ชื่อ key จริงของผู้ใช้ปัจจุบัน ; ถ้ายังไม่ล็อกอินใช้ 'guest' (แยกจากทุกบัญชีจริง)
  function keyFor(name) {
    return BASE[name] + '__' + (currentUserId() || 'guest');
  }

  // อ่านค่า: ถ้าไม่มี หรืออ่านไม่ได้ ให้คืนค่า fallback แทนที่จะให้แอปพัง
  function read(name, fallback) {
    try {
      const raw = localStorage.getItem(keyFor(name));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // เขียนค่า: คืน true ถ้าสำเร็จ / false ถ้าไม่สำเร็จ (เช่น พื้นที่เต็ม)
  function write(name, value) {
    try {
      localStorage.setItem(keyFor(name), JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  // % ที่แมวกิน = 100 - % ที่เหลือ  (log ขนมไม่มี % → คืน null)
  const eatenPct = (log) => (log.remainingPct == null ? null : 100 - log.remainingPct);

  /* ---- Profile (FR-1) ---- */
  const getProfile  = () => read('profile', null);   // null = ผู้ใช้นี้ยังไม่เคยสร้าง
  const saveProfile = (p) => write('profile', p);

  /* ---- Meal logs (FR-2 เขียน / FR-3, FR-4 อ่าน) ---- */
  const getLogs = () => read('logs', []);
  function addLog(log) {
    const logs = getLogs();
    // id สร้างจากเวลา + ตัวสุ่ม เพื่อให้ไม่ซ้ำกัน
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    logs.push({ id, ...log });
    return write('logs', logs);
  }

  /* ---- Alerts (FR-3) ---- */
  const getAlerts  = () => read('alerts', []);
  const saveAlerts = (a) => write('alerts', a);

  // ล้างข้อมูล "ของผู้ใช้ที่ล็อกอินอยู่เท่านั้น" (ไม่แตะบัญชีผู้ใช้ และไม่แตะข้อมูลของคนอื่น)
  function clearAll() {
    Object.keys(BASE).forEach(name => localStorage.removeItem(keyFor(name)));
  }

  /* ---- ข้อมูลตัวอย่างสำหรับสาธิต (เขียนให้ผู้ใช้ปัจจุบัน) ----
     30 วัน: 25 วันแรกกินปกติ (เหลือ 25% → กิน 75%) แล้ว 5 วันสุดท้ายกินน้อย (เหลือ 75% → กิน 25%)
     เป้าหมาย 70% → 5 วันท้ายต่ำกว่าเป้า จึงทำให้ FR-3 เตือน */
  function loadSampleData() {
    saveProfile({
      catId: 'cat1', name: 'Mochi', age: 7, weight: 4.2,
      diagnosis: 'Post-op recovery', dailyTarget: 70
    });

    const logs = [];
    const today = new Date();
    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const day = new Date(today);
      day.setDate(today.getDate() - daysAgo);
      day.setHours(8, 0, 0, 0);                  // สมมติบันทึกตอน 08:00
      const eatingLess = daysAgo < 5;            // 5 วันล่าสุด
      logs.push({
        id: 'sample-' + daysAgo,
        kind: 'meal',
        timestamp: day.toISOString(),
        remainingPct: eatingLess ? 75 : 25,
        dietTag: 'Recovery wet',
        isOutlier: false
      });
    }
    write('logs', logs);
    saveAlerts([]);                              // เริ่มโดยยังไม่มี alert (ให้กดตรวจเองตอนสาธิต)
  }

  // เปิดให้ไฟล์อื่นเรียกใช้เฉพาะฟังก์ชันเหล่านี้
  return { eatenPct, getProfile, saveProfile, getLogs, addLog,
           getAlerts, saveAlerts, clearAll, loadSampleData };
})();
