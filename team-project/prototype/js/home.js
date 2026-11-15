/* =====================================================================
   home.js – หน้า Home   [Parewa]
   แสดง: (1) แถบโปรไฟล์แมว + เป้าหมายกรัม/วัน
         (2) สถานะ 5 วันล่าสุด (% เทียบเป้ารายวัน) + สรุปยอดวันนี้แบบเรียลไทม์
         (3) การ์ดประเมินอาการทางคลินิกเบื้องต้นตามเกณฑ์สัตวแพทย์
   ===================================================================== */

App.register('home', {

  onShow() {
    const profile = MeowStore.getProfile();
    const logs = MeowStore.getLogs();

    document.getElementById('home-empty').hidden = !!profile;
    document.getElementById('home-profile').hidden = !profile;
    document.getElementById('home-tracker').hidden = !profile;
    if (!profile) return;

    const targetG = profile.dailyTargetG || profile.dailyTarget || 180;

    // ---------- (1) แถบโปรไฟล์แมว ----------
    document.getElementById('home-cat-name').textContent = profile.name;
    document.getElementById('home-cat-detail').textContent =
      profile.age + (I18n.language === 'th' ? ' ปี' : ' yr') + ' · ' +
      profile.weight + ' kg · ' + profile.diagnosis;
    document.getElementById('home-target').textContent = targetG + ' g';

    // ---------- (2) ติดตาม 5 วันล่าสุด ----------
    const byDate = {};
    dailyIntake(logs, targetG).forEach(d => { byDate[d.date] = d; });

    const today = new Date();
    const todayKey = dateKey(today.toISOString());
    const t = byDate[todayKey];

    const todayEl = document.getElementById('home-today');
    if (t) {
      const keyStr = t.meals === 1
        ? 'Today: {eaten} g of {target} g ({pct}%) · {meals} meal logged'
        : 'Today: {eaten} g of {target} g ({pct}%) · {meals} meals logged';
      I18n.setText(todayEl, keyStr, {
        eaten: Math.round(t.eatenG),
        target: targetG,
        pct: Math.round(t.pct),
        meals: t.meals
      });
    } else {
      I18n.setText(todayEl, 'Today: no meals logged yet');
    }

    const wrap = document.getElementById('five-days');
    wrap.innerHTML = '';

    // หากวันนี้มีการบันทึกมื้ออาหารแล้ว (เช่น ตอนสาธิตใส่รูปก่อน-หลังกิน) ให้แสดง 4 วันก่อนหน้า + วันนี้ (i = 4..0)
    // หากวันนี้ยังไม่มีการบันทึก ให้แสดง 5 วันที่จบแล้วล่าสุด (i = 5..1) เพื่อโชว์แท่งแดงครบ 5 วันก่อนเริ่มสาธิต
    const startOffset = t ? 4 : 5;
    const endOffset   = t ? 0 : 1;

    for (let i = startOffset; i >= endOffset; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dateKey(d.toISOString());
      const day = byDate[key];
      const hasLog = day !== undefined;
      const pct = hasLog ? day.pct : 0;
      const below = hasLog && pct < ALERT_BELOW_PCT;

      const col = document.createElement('div');
      col.className = 'day' + (i === 0 ? ' today' : '') + (hasLog ? '' : ' none');

      const val = document.createElement('div');
      val.className = 'val';
      val.textContent = hasLog ? Math.round(pct) + '%' : '–';

      const track = document.createElement('div');
      track.className = 'track';
      if (hasLog) {
        const fill = document.createElement('div');
        fill.className = 'fill' + (below ? ' below' : '');
        fill.style.height = Math.min(100, Math.round(pct)) + '%';
        track.appendChild(fill);
      }
      const mark = document.createElement('div');
      mark.className = 'mark';
      mark.style.bottom = ALERT_BELOW_PCT + '%';
      track.appendChild(mark);

      const label = document.createElement('div');
      label.className = 'dlabel';
      const dayName = d.toLocaleDateString(I18n.language === 'th' ? 'th-TH' : 'en-US', { weekday: 'short' });
      label.innerHTML = dayName + '<br>' + d.getDate() + (i === 0 ? ' ★' : '');

      col.append(val, track, label);
      wrap.appendChild(col);
    }

    // ป้ายสรุปมุมขวาบนของการ์ด
    const result = detectAnomaly(logs, profile);
    const pill = document.getElementById('home-streak');
    I18n.setText(pill, '{streak} of {days} days low', {
      streak: result.streak,
      days: ALERT_STREAK_DAYS
    });
    pill.classList.toggle('warn', result.streak > 0);

    const hintEl = document.getElementById('home-hint');
    if (hintEl) {
      I18n.setText(
        hintEl,
        'Bars show the last 5 days as a share of the daily target. A day under the dashed line ({pct}%) counts as low.',
        { pct: ALERT_BELOW_PCT }
      );
    }

    // แสดงสรุปการประเมินทางคลินิกบนหน้า Home
    const clinicalBox = document.getElementById('home-clinical-note');
    if (clinicalBox) {
      clinicalBox.hidden = false;
      clinicalBox.className = 'status ' + (result.triggered || result.clinicalLevel === 'high-risk' ? 'bad' : 'ok');
      I18n.setText(clinicalBox, result.clinicalReasonKey);
    }
  }
});
