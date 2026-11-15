/* =====================================================================
   storage.js – ชั้นเก็บข้อมูลกลาง (ใช้ร่วมกันทุกหน้า - มาตรฐาน v4 + Auth + Clinical Mockup)
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

  /* ---- ข้อมูลตัวอย่าง 30 วันอ้างอิงเกณฑ์วิจัยสัตวแพทย์ (ISFM 2022 / WSAVA / Merck) ----
     เป้า 180 g/วัน, วันละ 3 มื้อ (ให้มื้อละ 60 g)
     - วันที่ 29 ถึง 5 วันก่อน (25 วันแรก): กินอยู่ในเกณฑ์ปกติ >= 80% RER (~150–177 g/วัน หรือ 83–98%)
     - 4 วันล่าสุดที่จบแล้ว (daysAgo = 4..1): แสดงการลดลงของความอยากอาหารตามระยะทางคลินิก:
         * 4 วันก่อน: 132 g/วัน (73% -> เริ่มเข้าโซน Hyporexia < 80% วันแรก)
         * 3 วันก่อน: 117 g/วัน (65% -> Hyporexia วันที่ 2)
         * 2 วันก่อน:  84 g/วัน (47% -> เข้าเกณฑ์ ISFM ครบ 3 วัน + เริ่มเข้าโซน Severe Hyporexia < 50%)
         * เมื่อวาน:    66 g/วัน (37% -> Severe Hyporexia < 50% ติดต่อกัน 2 วัน เสี่ยง Hepatic Lipidosis)
     - วันนี้ (daysAgo = 0): เว้นว่างไว้สำหรับสาธิตถ่ายรูป/อัปโหลดรูปชามอาหารสดตอนนำเสนอ */
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
    const clinicalDropPerMeal = {
      4: 44, // รวม 132 g (73% - Hyporexia Day 1)
      3: 39, // รวม 117 g (65% - Hyporexia Day 2)
      2: 28, // รวม  84 g (47% - Hyporexia Day 3 + Severe < 50% Day 1)
      1: 22  // รวม  66 g (37% - Hyporexia Day 4 + Severe < 50% Day 2 -> Critical Hepatic Lipidosis Risk)
    };

    for (let daysAgo = 29; daysAgo >= 1; daysAgo--) {
      const isDrop = daysAgo in clinicalDropPerMeal;
      const eatenPerMeal = isDrop ? clinicalDropPerMeal[daysAgo] : (51 + (daysAgo % 4) * 2);
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
          remainingPct: Math.round(((60 - eatenPerMeal) / 60) * 100),
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
