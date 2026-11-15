/* =====================================================================
   anomaly_detector.js – ตรรกะรายวัน + เกณฑ์ประเมินความผิดปกติอ้างอิงงานวิจัยสัตวแพทย์ (FR-3 Revised)
   ---------------------------------------------------------------------
   ปรับปรุงตาม Feedback ของอาจารย์: เปลี่ยนจากเกณฑ์สมมติ 5 วันใน SRS เดิม
   มาใช้เกณฑ์มาตรฐานทางคลินิกจากงานวิจัยและแนวทางสัตวแพทยศาสตร์สากล (Evidence-Based Criteria):

   1) 2022 ISFM Consensus Guidelines on Management of the Inappetent Hospitalised Cat
      (Taylor et al., Journal of Feline Medicine and Surgery, 2022; 24(7): 614–640):
      - ระบุเกณฑ์ข้อบ่งชี้ทางการแพทย์ว่า แมวที่กินอาหารได้น้อยกว่า 80% ของความต้องการพลังงานขณะพัก (RER)
        ติดต่อกันตั้งแต่ 3 วันขึ้นไป ("Consuming less than 80% RER for 3 days or more")
        จัดอยู่ในภาวะ Hyporexia ที่มีนัยสำคัญทางคลินิกและต้องได้รับโภชนบำบัด (Nutritional Intervention)
      - การปล่อยให้แมวขาดสารอาหารนานกว่า 3 วันจะทำให้เกิด Stressed Starvation, สลายมวลกล้ามเนื้อ (Lean mass catabolism),
        แผลผ่าตัดหายช้า และภูมิคุ้มกันลดลง

   2) WSAVA Global Nutrition Guidelines (Freeman et al., JSAP / WSAVA Nutritional Assessment Guidelines):
      - กำหนดจุดตัดของการประเมินภาวะทุพโภชนาการและเริ่มโภชนบำบัดเมื่อแมวมีภาวะ Anorexia หรือ Hyporexia
        ติดต่อกันตั้งแต่ 3 วันขึ้นไป (>= 3 days)

   3) Cornell Feline Health Center & Merck Veterinary Manual (Feline Hepatic Lipidosis, 2025/2026):
      - ภาวะอดอาหารสมบูรณ์ (Complete Anorexia / กิน < 25% ของเป้าหมาย) ต่อเนื่องกันเพียง 24–48 ชั่วโมง (1–2 วัน)
        หรือกินน้อยกว่า 50% ต่อเนื่อง 2–3 วัน จะกระตุ้นการสลายไขมันส่วนเกินไปสะสมที่ตับอย่างรวดเร็ว
        นำไปสู่ภาวะไขมันพอกตับเฉียบพลัน (Feline Hepatic Lipidosis) ซึ่งอันตรายถึงชีวิต

   สรุปเกณฑ์ตัดสิน 4 ระดับ (4-Tier Clinical Grading Matrix) ที่ใช้ในโค้ดนี้:
     - Normal (ปกติ): กินได้ >= 80% ของเป้ารายวัน (dailyTargetG)
     - Tier 1: Suboptimal / Watch (เฝ้าระวัง): กิน < 80% ติดต่อกัน 1–2 วัน (และไม่ได้ต่ำกว่า 25%)
     - Tier 2: Clinical Hyporexia Alert (แจ้งเตือนพบสัตวแพทย์): กิน < 80% ติดต่อกัน >= 3 วัน (ISFM 2022 & WSAVA)
     - Tier 3: Severe Hyporexia / Acute Anorexia Emergency (วิกฤตฉุกเฉิน):
         (ก) กิน < 50% ติดต่อกัน >= 2 วัน หรือ
         (ข) กิน < 25% (Anorexia) แม้เพียง >= 1 วัน หรือ
         (ค) กิน < 80% ติดต่อกันยาวนาน >= 5 วัน (Prolonged Starvation)
   ===================================================================== */

const ALERT_STREAK_DAYS = 3;    // เกณฑ์มาตรฐานสัตวแพทย์ ISFM 2022 & WSAVA: กินต่ำกว่าเกณฑ์ติดต่อกัน >= 3 วันต้องแจ้งเตือน
const ALERT_BELOW_PCT = 80;     // เกณฑ์ ISFM 2022: กินต่ำกว่า 80% ของเป้ารายวัน (RER) นับเป็น Hyporexia
const SEVERE_BELOW_PCT = 50;    // เกณฑ์ Merck / Cornell: กินต่ำกว่า 50% เสี่ยงภาวะไขมันพอกตับ (Hepatic Lipidosis)
const ANOREXIA_BELOW_PCT = 25;  // เกณฑ์ Cornell Feline Health Center: กินต่ำกว่า 25% นับเป็น Anorexia เฉียบพลัน (เตือนตั้งแต่ 1 วัน)

const VET_REFERENCES = [
  {
    id: 'ISFM-2022',
    title: '2022 ISFM Consensus Guidelines on Management of the Inappetent Hospitalised Cat',
    citation: 'Taylor S, Chan DL, Villaverde C, et al. Journal of Feline Medicine and Surgery (JFMS). 2022;24(7):614-640.',
    ruleUsed: 'Consuming < 80% of daily target (RER) for >= 3 consecutive days is a primary clinical indication for medical and nutritional intervention.',
    url: 'https://journals.sagepub.com/doi/10.1177/1098612X221106353'
  },
  {
    id: 'WSAVA-2021',
    title: 'WSAVA Global Nutrition Assessment Guidelines',
    citation: 'Freeman L, Becvarova I, Cave N, et al. WSAVA Nutritional Assessment Guidelines. J Small Anim Pract.',
    ruleUsed: 'Hyporexia or anorexia lasting >= 3 days triggers mandatory nutritional intervention to prevent negative energy balance and lean muscle catabolism.',
    url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/'
  },
  {
    id: 'CORNELL-MERCK',
    title: 'Feline Hepatic Lipidosis & Anorexia Clinical Guidelines',
    citation: 'Cornell Feline Health Center & Merck Veterinary Manual (Feline Hepatic Lipidosis, 2025).',
    ruleUsed: 'Acute anorexia (< 25% intake for >= 1–2 days) or severe hyporexia (< 50% intake for >= 2–3 days) triggers rapid peripheral lipolysis and life-threatening hepatic lipidosis.',
    url: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hepatic-lipidosis'
  }
];

// แปลงเวลา ISO เป็นวันที่ท้องถิ่น "YYYY-MM-DD"
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

/* ยอดรายวัน
   คืนค่า: [{ date, eatenG, servedG, meals, pct, zone }, ...] เรียงจากเก่า → ใหม่ */
function dailyIntake(logs, dailyTargetG) {
  const byDay = {};
  (logs || []).forEach(log => {
    if (log.isOutlier) return;               // ข้ามขนมนอกมื้อ
    let eatenG = log.eatenG;
    if (eatenG == null && log.remainingPct != null && dailyTargetG > 0) {
      eatenG = ((100 - log.remainingPct) / 100) * dailyTargetG;
    }
    if (eatenG == null) return;
    const key = dateKey(log.timestamp);
    const day = (byDay[key] = byDay[key] || { eatenG: 0, servedG: 0, meals: 0 });
    day.eatenG += Number(eatenG);
    day.servedG += Number(log.servedG || 0);
    day.meals += 1;
  });
  return Object.keys(byDay).sort().map(date => {
    const pct = dailyTargetG > 0 ? (byDay[date].eatenG / dailyTargetG) * 100 : null;
    let zone = 'normal';
    if (pct !== null) {
      if (pct < ANOREXIA_BELOW_PCT) zone = 'anorexia';
      else if (pct < SEVERE_BELOW_PCT) zone = 'severe';
      else if (pct < ALERT_BELOW_PCT) zone = 'hyporexia';
    }
    return {
      date,
      eatenG: byDay[date].eatenG,
      servedG: byDay[date].servedG,
      meals: byDay[date].meals,
      pct,
      zone
    };
  });
}

function dailyEaten(logs, dailyTargetG = 180) {
  return dailyIntake(logs, dailyTargetG).map(d => ({
    date: d.date,
    eaten: d.pct ?? 0,
    eatenG: d.eatenG,
    meals: d.meals
  }));
}

/* ฟังก์ชันหลักในการตัดสินความผิดปกติทางการแพทย์ (Evidence-Based Anomaly Detection)
   คืนค่า: {
     triggered: boolean,        // true เมื่อเข้าเกณฑ์แจ้งเตือนพบสัตวแพทย์
     streak: number,            // จำนวนวันติดต่อกันที่กินต่ำกว่า 80% RER (ISFM/WSAVA)
     severeStreak: number,      // จำนวนวันติดต่อกันที่กินต่ำกว่า 50% RER (Merck/Cornell)
     anorexiaStreak: number,    // จำนวนวันติดต่อกันที่กินต่ำกว่า 25% RER (Cornell Acute Anorexia)
     clinicalLevel: 'normal' | 'watch' | 'warning' | 'critical',
     clinicalTitleKey: string,
     clinicalReasonKey: string,
     lastDate: string|null
   } */
function detectAnomaly(logs, profile, today = new Date()) {
  const targetG = profile ? (profile.dailyTargetG || profile.dailyTarget || 0) : 0;
  if (!profile || !(targetG > 0)) {
    return {
      triggered: false,
      streak: 0,
      severeStreak: 0,
      anorexiaStreak: 0,
      clinicalLevel: 'normal',
      clinicalTitleKey: 'Normal Intake (>= 80% RER)',
      clinicalReasonKey: 'Clinical status: Normal recovery intake (>= 80% of daily target per ISFM 2022 guidelines).',
      lastDate: null
    };
  }

  const todayKey = dateKey(today.toISOString());
  const days = dailyIntake(logs, targetG).filter(d => d.date < todayKey);   // ตรวจเฉพาะวันที่จบแล้ว
  let streak = 0;
  let severeStreak = 0;
  let anorexiaStreak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].pct >= ALERT_BELOW_PCT) break;   // กินถึง 80% = ปกติ -> หยุดนับ (reset)
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
    if (days[i].pct < ANOREXIA_BELOW_PCT && anorexiaStreak === streak - 1) {
      anorexiaStreak++;
    }
  }

  // ตัดสินผลตามเกณฑ์วิจัยสัตวแพทย์ 4 ระดับ
  let triggered = false;
  let clinicalLevel = 'normal';
  let clinicalTitleKey = 'Tier 0: Normal Recovery Intake (>= 80% Target)';
  let clinicalReasonKey = 'Clinical status: Normal recovery intake (>= 80% of daily target per ISFM 2022 guidelines).';

  if (anorexiaStreak >= 1) {
    triggered = true;
    clinicalLevel = 'critical';
    clinicalTitleKey = 'Tier 3: Acute Anorexia Emergency (< 25% Target)';
    clinicalReasonKey = 'Emergency Alert (Cornell Feline Health Center): Near-complete anorexia (< 25% intake) for 24+ hours. High risk of acute hepatic lipidosis and dehydration. Immediate veterinary care required.';
  } else if (severeStreak >= 2 || streak >= 5) {
    triggered = true;
    clinicalLevel = 'critical';
    clinicalTitleKey = 'Tier 3: Severe Hyporexia / Hepatic Lipidosis Risk';
    clinicalReasonKey = 'Critical Alert (Merck Veterinary Manual & ISFM 2022): Severe hyporexia (< 50% target for 2+ days or < 80% for 5+ days). High risk of Feline Hepatic Lipidosis and lean mass catabolism. Consult a veterinarian urgently.';
  } else if (streak >= ALERT_STREAK_DAYS) {
    triggered = true;
    clinicalLevel = 'warning';
    clinicalTitleKey = 'Tier 2: Clinical Hyporexia Alert (< 80% for 3+ Days)';
    clinicalReasonKey = 'Veterinary Alert (ISFM 2022 & WSAVA Guidelines): Intake < 80% of daily target for 3+ consecutive days. Indicates clinically significant hyporexia requiring medical assessment and nutritional intervention.';
  } else if (streak > 0) {
    triggered = false;
    clinicalLevel = 'watch';
    clinicalTitleKey = 'Tier 1: Suboptimal Intake Watch (1–2 Days < 80%)';
    clinicalReasonKey = 'Early Watch (ISFM 2022): Intake < 80% of target for 1–2 days. Check for pain, nausea, or food stress and monitor the next meal closely.';
  }

  return {
    triggered,
    streak,
    severeStreak,
    anorexiaStreak,
    clinicalLevel,
    clinicalTitleKey,
    clinicalReasonKey,
    lastDate: days.length ? days[days.length - 1].date : null
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    detectAnomaly,
    dailyIntake,
    dailyEaten,
    dateKey,
    ALERT_STREAK_DAYS,
    ALERT_BELOW_PCT,
    SEVERE_BELOW_PCT,
    ANOREXIA_BELOW_PCT,
    VET_REFERENCES
  };
}
