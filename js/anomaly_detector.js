/* =====================================================================
   anomaly_detector.js – ตรรกะ FR-3 (Early Intake Anomaly Alert)
   ---------------------------------------------------------------------
   ไฟล์นี้เป็น "ฟังก์ชันล้วน" (pure): ไม่แตะหน้าเว็บ ไม่แตะ localStorage
   รับข้อมูลเข้า → คืนผลลัพธ์ จึงเขียน unit test ใน Node ได้ง่าย
   (ตรงกับ test ใน traceability matrix:
      test_trigger_alert_on_5_consecutive_drops
      test_reset_counter_on_normal_meal)

   กฎที่ใช้ตอนนี้ (⚠ เป็นสมมติฐาน ทีมต้องยืนยันแล้วเขียนลง SRS):
     1) นับเฉพาะ log มื้ออาหาร: ข้ามขนม (isOutlier) และ log ที่ไม่มี remainingPct
     2) "กินต่อวัน" = ค่าเฉลี่ยของ (100 - remainingPct) ของวันนั้น
     3) วันนั้น "ต่ำกว่าเป้า" ถ้ากินต่อวัน < profile.dailyTarget
     4) นับย้อนจากวันล่าสุดที่มี log: ต่ำกว่าเป้าติดกันกี่วัน (ต้องติดกันในปฏิทิน)
        เจอวันปกติ หรือวันที่ไม่มี log คั่น → หยุดนับ (= reset ตาม FR-3 AC#2)
     5) streak >= 5 → triggered = true
   ===================================================================== */

const ALERT_STREAK_DAYS = 5;   // จำนวนวันติดกันที่ทำให้เตือน (ตาม SRS)

// แปลงเวลา ISO เป็นวันที่ท้องถิ่น "YYYY-MM-DD" (ใช้เป็นกุญแจจัดกลุ่มรายวัน)
function dateKey(iso) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

// ตรวจว่า dateB คือ "วันถัดจาก" dateA จริงไหม (รูปแบบ YYYY-MM-DD)
function isNextDay(dateA, dateB) {
  const d = new Date(dateA + 'T12:00:00');   // ใช้เที่ยงวันกันปัญหาเปลี่ยนเวลาหน้าร้อน
  d.setDate(d.getDate() + 1);
  return dateKey(d.toISOString()) === dateB;
}

/* รวม log มื้ออาหารเป็นรายวัน
   คืนค่า: [{ date: "2026-10-01", eaten: 75 }, ...] เรียงจากเก่า → ใหม่
   ใช้ร่วมกันทั้ง Home (5 วัน), Trend (30 วัน) และ FR-3 */
function dailyEaten(logs) {
  const byDay = {};                          // { "2026-10-01": [75, 100], ... }
  logs.forEach(log => {
    if (log.isOutlier) return;               // ข้ามขนมนอกมื้อ
    if (log.remainingPct == null) return;    // ไม่มี % ให้คำนวณ
    const key = dateKey(log.timestamp);
    (byDay[key] = byDay[key] || []).push(100 - log.remainingPct);
  });
  return Object.keys(byDay).sort().map(date => {
    const list = byDay[date];
    return { date, eaten: list.reduce((a, b) => a + b, 0) / list.length };
  });
}

/* ฟังก์ชันหลักของ FR-3
   คืนค่า: { triggered: boolean, streak: number, lastDate: string|null } */
function detectAnomaly(logs, profile) {
  if (!profile) return { triggered: false, streak: 0, lastDate: null };

  const days = dailyEaten(logs);             // เรียงเก่า → ใหม่
  let streak = 0;

  // เดินจากวันล่าสุดย้อนกลับไปหาวันเก่า
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].eaten >= profile.dailyTarget) break;   // เจอวันปกติ → หยุด (reset)
    // วันนี้ต้องติดกับวันที่นับไปก่อนหน้า (วันที่ใหม่กว่า) ไม่มีวันว่างคั่น
    if (streak > 0 && !isNextDay(days[i].date, days[i + 1].date)) break;
    streak++;
  }

  return {
    triggered: streak >= ALERT_STREAK_DAYS,
    streak,
    lastDate: days.length ? days[days.length - 1].date : null
  };
}

// ใช้ได้ทั้งในเบราว์เซอร์ (<script>) และ Node (สำหรับเขียนเทส)
if (typeof module !== 'undefined') {
  module.exports = { detectAnomaly, dailyEaten, dateKey, ALERT_STREAK_DAYS };
}
