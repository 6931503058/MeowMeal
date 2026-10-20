/* =====================================================================
   alerts.js – หน้า Alerts (FR-3 Golden Thread)   [Parewa]
   - ปุ่ม "Run daily check now": จำลอง job ที่ในระบบจริงรันฝั่ง server ทุกเที่ยงคืน (NFR-2)
   - ถ้า detectAnomaly() บอกว่า triggered → บันทึก alert (วันละไม่เกิน 1 รายการ)
   - แสดงรายการ alert ที่เคยเกิดขึ้น
   ===================================================================== */
App.register('alerts', {

  init() {
    document.getElementById('btn-run-check').addEventListener('click', () => {
      const profile = MeowStore.getProfile();
      const logs = MeowStore.getLogs();
      const status = document.getElementById('alerts-status');
      status.hidden = false;
      status.className = 'status';

      // ยังไม่มีโปรไฟล์ → ตรวจไม่ได้ (ไม่รู้เป้าหมาย)
      if (!profile) {
        I18n.setText(status, 'Add a cat profile first.');
        status.classList.add('bad');
        return;
      }

      const result = detectAnomaly(logs, profile);

      if (!result.triggered) {
        I18n.setText(status, 'No alert. Days below target in a row: {streak} of {days}.', {
          streak: result.streak,
          days: ALERT_STREAK_DAYS
        });
        status.classList.add('ok');
        return;
      }

      // เกิด alert: กันสร้างซ้ำถ้าวันนี้มีอยู่แล้ว (เทียบด้วย dateKey)
      const todayKey = dateKey(new Date().toISOString());
      const alerts = MeowStore.getAlerts();
      if (!alerts.some(a => a.dateKey === todayKey)) {
        alerts.unshift({                    // unshift = ใส่ไว้หัวรายการ (ใหม่สุดอยู่บน)
          id: 'alert-' + Date.now(),
          createdAt: new Date().toISOString(),
          dateKey: todayKey,
          catName: profile.name,
          streak: result.streak,
          message: I18n.t('{name} has eaten less than the target for {days} days in a row. Please consider a vet visit.', {
            name: profile.name,
            days: result.streak
          })
        });
        MeowStore.saveAlerts(alerts);
      }
      I18n.setText(status, 'Alert created.');
      status.classList.add('bad');
      App.refresh();                        // วาดรายการใหม่ + อัปเดตจุดแดงบนแท็บ
    });
  },

  // วาดรายการ alert ทุกครั้งที่เปิดหน้า
  onShow() {
    const alerts = MeowStore.getAlerts();
    const list = document.getElementById('alerts-list');
    list.innerHTML = '';                    // ล้างของเก่าก่อน

    alerts.forEach(a => {
      const li = document.createElement('li');
      const msg = document.createElement('div');
      const legacyMessage = a.message?.match(
        /^(.*?) has eaten less than the target for (\d+) days in a row\. Please consider a vet visit\.$/
      );
      const catName = a.catName || legacyMessage?.[1];
      const streak = a.streak || Number(legacyMessage?.[2]);
      msg.textContent = catName && streak
        ? I18n.t('{name} has eaten less than the target for {days} days in a row. Please consider a vet visit.', {
          name: catName,
          days: streak
        })
        : a.message;
      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = new Date(a.createdAt).toLocaleString(I18n.language === 'th' ? 'th-TH' : 'en-US');
      li.append(msg, when);
      list.appendChild(li);
    });

    // ไม่มี alert เลย → โชว์ข้อความว่าง
    document.getElementById('alerts-empty').hidden = alerts.length > 0;
  }
});
