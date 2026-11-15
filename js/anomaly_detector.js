/* =====================================================================
   anomaly_detector.js – ตรรกะรายวัน + FR-3 (Early Intake Anomaly Alert)
   ---------------------------------------------------------------------
   เกณฑ์อ้างอิงทางสัตวแพทยศาสตร์ (Veterinary Clinical References):
   1) 2022 ISFM Consensus Guidelines on Management of the Inappetent Hospitalised Cat
      (Taylor et al., Journal of Feline Medicine and Surgery, 2022):
      - ภาวะได้รับพลังงานต่ำกว่าความต้องการ (< 75%–80% ของ RER/Daily Target) ต่อเนื่อง 3–5 วัน
        จัดเป็น Hyporexia ที่ต้องเริ่มโภชนบำบัด (Nutritional Intervention)
   2) WSAVA Global Nutrition Guidelines ( Freeman et al., 2011 / 2021):
      - แมวที่กินอาหารลดลงต่ำกว่าเกณฑ์ต่อเนื่อง 3–5 วัน หรืออดอาหาร (Anorexia)
        มีความเสี่ยงสูงต่อภาวะสมดุลพลังงานติดลบและการสลายโปรตีนกล้ามเนื้อ
   3) Merck Veterinary Manual & Cornell Feline Health Center (Feline Hepatic Lipidosis):
      - แมวที่กินอาหารน้อยกว่า 50% ของความต้องการ หรือหยุดกินอาหารเพียง 2–3 วันติดต่อกัน
        มีความเสี่ยงเกิดภาวะไขมันพอกตับเฉียบพลัน (Feline Hepatic Lipidosis) โดยเฉพาะแมวพักฟื้น
   ===================================================================== */

const ALERT_STREAK_DAYS = 5;    // จำนวนวันติดกันที่ทำให้เตือนหลัก (ตาม SRS FR-3)
const ALERT_BELOW_PCT = 75;     // เกณฑ์ต่ำกว่าเป้าหมาย (< 75% ของเป้ารายวัน ตามแนวทาง ISFM/WSAVA)
const SEVERE_BELOW_PCT = 50;    // เกณฑ์วิกฤต (< 50% ของเป้ารายวัน เสี่ยง Hepatic Lipidosis ตาม Merck/Cornell)

const VET_REFERENCES = [
  {
    id: 'ISFM-2022',
    source: '2022 ISFM Consensus Guidelines on Management of the Inappetent Hospitalised Cat (JFMS)',
    criterion: 'Daily intake < 75% of target for 3–5 consecutive days indicates clinically significant hyporexia requiring nutritional intervention.',
    url: 'https://journals.sagepub.com/doi/10.1177/1098612X221106353'
  },
  {
    id: 'WSAVA-2021',
    source: 'WSAVA Global Nutrition Guidelines',
    criterion: 'Suboptimal intake (< 75% RER) for >= 3–5 days warrants clinical nutritional assessment and intervention.',
    url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/'
  },
  {
    id: 'MERCK-CORNELL',
    source: 'Merck Veterinary Manual & Cornell Feline Health Center (Hepatic Lipidosis)',
    criterion: 'Severe hyporexia (< 50% intake) or complete anorexia for >= 2–3 consecutive days sharply increases the risk of feline hepatic lipidosis.',
    url: 'https://www.merckvetmanual.com/digestive-system/hepatic-disease-in-small-animals/feline-hepatic-lipidosis'
  }
];

// แปลงเวลา ISO เป็นวันที่ท้องถิ่น "YYYY-MM-DD" (ใช้เป็นกุญแจจัดกลุ่มรายวัน)
function dateKey(iso) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

// ตรวจว่า dateB คือ "วันถัดจาก" dateA จริงไหม (รูปแบบ YYYY-MM-DD)
function isNextDay(dateA, dateB) {
  const d = new Date(dateA + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return dateKey(d.toISOString()) === dateB;
}

/* ยอดรายวัน (ตามตรรกะ v4)
   คืนค่า: [{ date, eatenG, meals, pct }, ...] เรียงจากเก่า → ใหม่
     eatenG = กรัมที่กินรวมของวัน   meals = จำนวนมื้อที่บันทึก
     pct    = eatenG ÷ dailyTargetG × 100 (ไม่จำกัดที่ 100 ; null ถ้าไม่มีเป้า)
   ใช้ร่วมกันทั้ง Home (5 วัน), Trend (30 วัน) และ FR-3 */
function dailyIntake(logs, dailyTargetG) {
  const byDay = {};
  (logs || []).forEach(log => {
    if (log.isOutlier) return;               // ข้ามขนมนอกมื้อ
    let eatenG = log.eatenG;
    // รองรับข้อมูลแบบเก่าที่มีเฉพาะ remainingPct
    if (eatenG == null && log.remainingPct != null && dailyTargetG > 0) {
      eatenG = ((100 - log.remainingPct) / 100) * dailyTargetG;
    }
    if (eatenG == null) return;              // ไม่มีกรัมให้นับ
    const key = dateKey(log.timestamp);
    const day = (byDay[key] = byDay[key] || { eatenG: 0, meals: 0 });
    day.eatenG += Number(eatenG);
    day.meals += 1;
  });
  return Object.keys(byDay).sort().map(date => ({
    date,
    eatenG: byDay[date].eatenG,
    meals: byDay[date].meals,
    pct: dailyTargetG > 0 ? (byDay[date].eatenG / dailyTargetG) * 100 : null
  }));
}

// ฟังก์ชันช่วยสำหรับโค้ดเดิมที่อาจเรียก dailyEaten
function dailyEaten(logs, dailyTargetG = 180) {
  return dailyIntake(logs, dailyTargetG).map(d => ({ date: d.date, eaten: d.pct ?? 0, eatenG: d.eatenG, meals: d.meals }));
}

/* ฟังก์ชันหลักของ FR-3
   today = วันนี้ (ใส่เองได้เพื่อทดสอบ)
   คืนค่า: { triggered: boolean, streak: number, severeStreak: number, clinicalLevel: string, clinicalReasonKey: string, lastDate: string|null } */
function detectAnomaly(logs, profile, today = new Date()) {
  const targetG = profile ? (profile.dailyTargetG || profile.dailyTarget || 0) : 0;
  if (!profile || !(targetG > 0)) {
    return { triggered: false, streak: 0, severeStreak: 0, clinicalLevel: 'normal', clinicalReasonKey: 'Normal intake', lastDate: null };
  }

  const todayKey = dateKey(today.toISOString());
  const days = dailyIntake(logs, targetG).filter(d => d.date < todayKey);   // เฉพาะวันที่จบแล้ว
  let streak = 0;
  let severeStreak = 0;

  // เดินจากวันล่าสุดที่จบแล้วย้อนกลับไปหาวันเก่า
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].pct >= ALERT_BELOW_PCT) break;                  // เจอวันถึงเกณฑ์ → หยุด (reset)
    // วันแรกที่นับต้องเป็น "เมื่อวาน" ; วันถัดๆ ไปต้องติดกันไม่มีวันว่างคั่น
    if (streak === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (days[i].date !== dateKey(yesterday.toISOString())) break;
    } else if (!isNextDay(days[i].date, days[i + 1].date)) {
      break;
    }
    streak++;
    if (days[i].pct < SEVERE_BELOW_PCT && severeStreak === streak - 1) {
      severeStreak++;
    }
  }

  let clinicalLevel = 'normal';
  let clinicalReasonKey = 'Clinical status: Normal recovery intake (>= 75% of daily target).';
  if (streak >= ALERT_STREAK_DAYS) {
    clinicalLevel = 'critical';
    clinicalReasonKey = 'Critical Alert (FR-3 / ISFM & WSAVA): Intake < 75% of daily target for 5+ consecutive days. High risk of clinical deterioration and hepatic lipidosis. Vet visit strongly recommended.';
  } else if (severeStreak >= 3) {
    clinicalLevel = 'high-risk';
    clinicalReasonKey = 'High Risk (Merck / Cornell): Severe hyporexia (< 50% target) for 3+ consecutive days increases hepatic lipidosis risk.';
  } else if (streak >= 3) {
    clinicalLevel = 'warning';
    clinicalReasonKey = 'Early Warning (ISFM Guidelines): Intake < 75% of target for 3–4 consecutive days (Hyporexia). Monitor closely.';
  } else if (streak > 0) {
    clinicalLevel = 'watch';
    clinicalReasonKey = 'Sub-target intake (< 75%) for 1–2 days. Continue monitoring daily meals.';
  }

  return {
    triggered: streak >= ALERT_STREAK_DAYS,
    streak,
    severeStreak,
    clinicalLevel,
    clinicalReasonKey,
    lastDate: days.length ? days[days.length - 1].date : null
  };
}

// ใช้ได้ทั้งในเบราว์เซอร์ (<script>) และ Node (สำหรับเขียนเทส)
if (typeof module !== 'undefined') {
  module.exports = {
    detectAnomaly,
    dailyIntake,
    dailyEaten,
    dateKey,
    ALERT_STREAK_DAYS,
    ALERT_BELOW_PCT,
    SEVERE_BELOW_PCT,
    VET_REFERENCES
  };
}
