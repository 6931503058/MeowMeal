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
        status.textContent = 'Add a cat profile first.';
        status.classList.add('bad');
        return;
      }

      const result = detectAnomaly(logs, profile);

      if (!result.triggered) {
        status.textContent = 'No alert. Days below target in a row: ' + result.streak + ' of ' + ALERT_STREAK_DAYS + '.';
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
          message: profile.name + ' has eaten less than the target for ' +
                   result.streak + ' days in a row. Please consider a vet visit.'
        });
        MeowStore.saveAlerts(alerts);
      }
      status.textContent = 'Alert created.';
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
      msg.textContent = a.message;          // ใช้ textContent (ปลอดภัยกว่า innerHTML)
      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = new Date(a.createdAt).toLocaleString();
      li.append(msg, when);
      list.appendChild(li);
    });

    // ไม่มี alert เลย → โชว์ข้อความว่าง
    document.getElementById('alerts-empty').hidden = alerts.length > 0;
  }
});
