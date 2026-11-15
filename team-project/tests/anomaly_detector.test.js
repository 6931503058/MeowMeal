/* ทดสอบตรรกะ FR-3 (ไม่ต้องติดตั้งอะไร):   node tests/anomaly_detector.test.js
   ชื่อเทสตรงกับ traceability matrix ใน SRS */
const assert = require('assert');
const { detectAnomaly, ALERT_BELOW_PCT } = require('../js/anomaly_detector.js');

const profile = { dailyTargetG: 180 };                 // เป้ารายวันของแมวตัวนี้ (กรัม)
const at = (daysAgo, hour) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
// 1 วัน = 3 มื้อ รวมกินตามกรัมที่ระบุ
const day = (daysAgo, totalG) => [8, 13, 19].map(h => ({
  kind: 'meal', timestamp: at(daysAgo, h), servedG: 60, leftG: 60 - totalG / 3, eatenG: totalG / 3, isOutlier: false }));

const tests = {
  test_trigger_alert_on_5_consecutive_drops() {
    const logs = [5, 4, 3, 2, 1].flatMap(d => day(d, 75));            // 42% ของเป้า ติดกัน 5 วัน
    const r = detectAnomaly(logs, profile);
    assert.strictEqual(r.triggered, true); assert.strictEqual(r.streak, 5);
  },
  test_reset_counter_on_normal_meal() {
    const logs = [...day(5, 75), ...day(4, 75), ...day(3, 170), ...day(2, 75), ...day(1, 75)];
    const r = detectAnomaly(logs, profile);
    assert.strictEqual(r.triggered, false); assert.strictEqual(r.streak, 2);   // วันที่ 3 กินปกติ → นับใหม่
  },
  test_exactly_at_threshold_is_not_low() {
    const g = 180 * ALERT_BELOW_PCT / 100;                            // เท่ากับเกณฑ์พอดี = ไม่ต่ำ
    assert.strictEqual(detectAnomaly([5, 4, 3, 2, 1].flatMap(d => day(d, g)), profile).triggered, false);
  },
  test_today_in_progress_is_not_counted() {
    const logs = [...[5, 4, 3, 2].flatMap(d => day(d, 75)), ...day(0, 20)];
    assert.strictEqual(detectAnomaly(logs, profile).triggered, false);
  },
  test_missing_day_breaks_the_streak() {
    const logs = [6, 5, 3, 2, 1].flatMap(d => day(d, 75));
    assert.strictEqual(detectAnomaly(logs, profile).triggered, false);
  },
  test_snack_is_ignored() {
    const logs = [...[5, 4, 3, 2, 1].flatMap(d => day(d, 75)), { kind: 'snack', timestamp: at(1, 10), eatenG: null, isOutlier: true }];
    assert.strictEqual(detectAnomaly(logs, profile).triggered, true);
  },
  test_target_is_per_cat() {
    const logs = [5, 4, 3, 2, 1].flatMap(d => day(d, 90));            // กิน 90 g/วัน เท่ากัน
    assert.strictEqual(detectAnomaly(logs, { dailyTargetG: 100 }).triggered, false);   // 90% ของเป้า 100 g = ปกติ
    assert.strictEqual(detectAnomaly(logs, { dailyTargetG: 180 }).triggered, true);    // 50% ของเป้า 180 g = ต่ำ
  }
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
}
process.exit(failed ? 1 : 0);
