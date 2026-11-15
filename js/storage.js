/* =====================================================================
   storage.js – ชั้นเก็บข้อมูลกลาง (ใช้ร่วมกันทุกหน้า - มาตรฐาน v4 + Auth)
   ---------------------------------------------------------------------
   รูปแบบข้อมูลที่ทีมใช้ตรงกัน:
   Account (บัญชีผู้ใช้):
     { email, name, role, loggedInAt }
   Profile (แมว 1 ตัวใน MVP):
     { catId, name, age, weight, diagnosis, dailyTargetG }
   Log (1 รายการต่อ 1 เหตุการณ์):
     มื้ออาหาร (kind: 'meal'):
       { id, kind:'meal', timestamp (ISO),
         servedG, leftG, eatenG (servedG - leftG),
         dietTag, isOutlier:false, source:'photo'|'manual' }
     ขนมนอกมื้อ (kind: 'snack'):
       { id, kind:'snack', timestamp (ISO), servedG:null, leftG:null, eatenG:null,
         dietTag:'ชนิดขนม', isOutlier:true }
   Alert:
     { id, createdAt (ISO), dateKey ("YYYY-MM-DD"), catName, streak, clinicalLevel, message }
   Pending before photo:
     { takenAt (ISO), dataUrl, est: { grams, confidence, problem, matchedId } }
   ===================================================================== */
const MeowStore = (() => {

  const KEYS = {
    user:    'meowmeal_user',
    profile: 'meowmeal_profile',
    logs:    'meowmeal_logs',
    alerts:  'meowmeal_alerts',
    pending: 'meowmeal_pending_before'
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---- User Account / Login ---- */
  function getUser() {
    return read(KEYS.user, {
      email: 'parewa.se@mfu.ac.th',
      name: 'Parewa (Caregiver)',
      role: 'Cat Owner / Caregiver',
      loggedInAt: new Date().toISOString()
    });
  }
  const saveUser = (u) => write(KEYS.user, u);
  const logoutUser = () => localStorage.removeItem(KEYS.user);
  const isLoggedIn = () => !!read(KEYS.user, null);

  /* ---- Profile (FR-1) ---- */
  function getProfile() {
    const p = read(KEYS.profile, null);
    if (!p) return null;
    // รองรับทั้ง dailyTargetG (v4) และ dailyTarget (โค้ดเก่า)
    if (p.dailyTargetG == null && p.dailyTarget != null) {
      p.dailyTargetG = Number(p.dailyTarget);
    }
    return p;
  }
  function saveProfile(p) {
    const normalized = { ...p, dailyTargetG: Number(p.dailyTargetG ?? p.dailyTarget ?? 180) };
    return write(KEYS.profile, normalized);
  }

  /* ---- Logs (FR-2 / FR-5 เขียน ; FR-3, FR-4 อ่าน) ---- */
  const getLogs = () => read(KEYS.logs, []);
  function addLog(log) {
    const logs = getLogs();
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    logs.push({ id, ...log });
    return write(KEYS.logs, logs);
  }

  // ล้างเฉพาะข้อมูลมื้ออาหารของ "วันนี้" (สำหรับซ้อมพรีเซนต์ซ้ำหน้างาน)
  function clearTodayLogs() {
    const todayStr = dateKey(new Date().toISOString());
    const kept = getLogs().filter(l => dateKey(l.timestamp) !== todayStr);
    return write(KEYS.logs, kept);
  }

  /* ---- Alerts (FR-3) ---- */
  const getAlerts  = () => read(KEYS.alerts, []);
  const saveAlerts = (a) => write(KEYS.alerts, a);

  /* ---- รูปก่อนกินที่รอรูปหลังกิน (FR-5) ---- */
  const getPendingBefore   = () => read(KEYS.pending, null);
  const savePendingBefore  = (p) => write(KEYS.pending, p);
  const clearPendingBefore = () => localStorage.removeItem(KEYS.pending);

  function clearAll() {
    [KEYS.profile, KEYS.logs, KEYS.alerts, KEYS.pending].forEach(k => localStorage.removeItem(k));
  }

  /* ---- ข้อมูลตัวอย่าง 30 วันสำหรับสาธิตอาจารย์ ----
     เป้า 180 g/วัน, วันละ 3 มื้อ (ให้มื้อละ 60 g)
     - วันที่ 29 ถึง 6 วันก่อน (24 วันแรก): กินปกติ ~156–174 g/วัน (87–97% ของเป้า)
     - 5 วันล่าสุดที่จบแล้ว (daysAgo = 5..1): กินน้อยต่อเนื่อง (114g, 99g, 84g, 75g, 66g -> 63%, 55%, 47%, 42%, 37% ของเป้า)
       ซึ่งต่ำกว่าเกณฑ์ 75% ติดกันครบ 5 วัน -> กดตรวจ FR-3 แล้วแจ้งเตือนทันที!
     - วันนี้ (daysAgo = 0): ยังไม่ลงบันทึกมื้ออาหาร เพื่อรอให้ทดสอบอัปโหลดรูป Before & After สดตอนนำเสนอ
       แล้วกราฟ 5 วันล่าสุดและ 30 วันล่าสุดจะอัปเดตแท่งของ "วันนี้" ขึ้นมาทันที! */
  function loadSampleData() {
    if (!isLoggedIn()) {
      saveUser({
        email: 'parewa.se@mfu.ac.th',
        name: 'Parewa (Caregiver)',
        role: 'Cat Owner / Caregiver',
        loggedInAt: new Date().toISOString()
      });
    }
    saveProfile({
      catId: 'CAT_01',
      name: 'Mochi (โมจิ)',
      age: 7,
      weight: 4.2,
      diagnosis: 'Post-op recovery (พักฟื้นหลังผ่าตัด)',
      dailyTargetG: 180
    });

    const logs = [];
    const now = new Date();
    const mealHours = [8, 13, 19];
    const lowDayEatenPerMeal = { 5: 38, 4: 33, 3: 28, 2: 25, 1: 22 }; // รวมต่อวัน = 114g (63%), 99g (55%), 84g (47%), 75g (42%), 66g (37%)

    for (let daysAgo = 29; daysAgo >= 1; daysAgo--) {
      const isLow = daysAgo >= 1 && daysAgo <= 5;
      const eatenPerMeal = isLow ? lowDayEatenPerMeal[daysAgo] : (52 + (daysAgo % 3) * 3);
      mealHours.forEach((hour, i) => {
        const when = new Date(now);
        when.setDate(now.getDate() - daysAgo);
        when.setHours(hour, 0, 0, 0);
        logs.push({
          id: 'sample-' + daysAgo + '-' + i,
          kind: 'meal',
          timestamp: when.toISOString(),
          servedG: 60,
          leftG: 60 - eatenPerMeal,
          eatenG: eatenPerMeal,
          dietTag: 'Recovery wet',
          isOutlier: false,
          source: 'manual'
        });
      });
    }
    write(KEYS.logs, logs);
    clearPendingBefore();
    saveAlerts([]);
  }

  return {
    getUser, saveUser, logoutUser, isLoggedIn,
    getProfile, saveProfile,
    getLogs, addLog, clearTodayLogs,
    getAlerts, saveAlerts,
    clearAll, loadSampleData,
    getPendingBefore, savePendingBefore, clearPendingBefore
  };
})();
