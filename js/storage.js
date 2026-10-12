
const MeowStore = (() => {

  // ชื่อ key ที่ใช้เก็บใน localStorage (รวมไว้ที่เดียว จะได้ไม่พิมพ์ผิด)
  const KEYS = {
    profile: 'meowmeal_profile',
    logs:    'meowmeal_logs',
    alerts:  'meowmeal_alerts'
  };

  // อ่านค่า: ถ้าไม่มี หรืออ่านไม่ได้ ให้คืนค่า fallback แทนที่จะให้แอปพัง
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // เขียนค่า: คืน true ถ้าสำเร็จ / false ถ้าไม่สำเร็จ (เช่น พื้นที่เต็ม)
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  // % ที่แมวกิน = 100 - % ที่เหลือ  (log ขนมไม่มี % → คืน null)
  const eatenPct = (log) => (log.remainingPct == null ? null : 100 - log.remainingPct);

  /* ---- Profile (FR-1) ---- */
  const getProfile  = () => read(KEYS.profile, null);   // null = ยังไม่เคยสร้าง
  const saveProfile = (p) => write(KEYS.profile, p);

  /* ---- Meal logs (FR-2 เขียน / FR-3, FR-4 อ่าน) ---- */
  const getLogs = () => read(KEYS.logs, []);
  function addLog(log) {
    const logs = getLogs();
    // id สร้างจากเวลา + ตัวสุ่ม เพื่อให้ไม่ซ้ำกัน
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    logs.push({ id, ...log });
    return write(KEYS.logs, logs);
  }

  /* ---- Alerts (FR-3) ---- */
  const getAlerts  = () => read(KEYS.alerts, []);
  const saveAlerts = (a) => write(KEYS.alerts, a);

  // ล้างข้อมูลทั้งหมด (ปุ่ม Clear all data)
  function clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  /* ---- ข้อมูลตัวอย่างสำหรับสาธิต ----
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
    write(KEYS.logs, logs);
    saveAlerts([]);                              // เริ่มโดยยังไม่มี alert (ให้กดตรวจเองตอนสาธิต)
  }

  // เปิดให้ไฟล์อื่นเรียกใช้เฉพาะฟังก์ชันเหล่านี้
  return { eatenPct, getProfile, saveProfile, getLogs, addLog,
           getAlerts, saveAlerts, clearAll, loadSampleData };
})();
