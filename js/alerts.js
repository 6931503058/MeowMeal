/* =====================================================================
   alerts.js – หน้า Alerts (FR-3 Golden Thread + เกณฑ์อ้างอิงสัตวแพทย์)   [Parewa]
   ===================================================================== */
App.register('alerts', {

  init() {
    document.getElementById('btn-run-check').addEventListener('click', () => {
      const profile = MeowStore.getProfile();
      const logs = MeowStore.getLogs();
      const status = document.getElementById('alerts-status');
      status.hidden = false;
      status.className = 'status';

      if (!profile) {
        I18n.setText(status, 'Add a cat profile first.');
        status.classList.add('bad');
        return;
      }

      const result = detectAnomaly(logs, profile);

      if (!result.triggered) {
        I18n.setText(status, 'No alert. Low days in a row: {streak} of {days}.', {
          streak: result.streak,
          days: ALERT_STREAK_DAYS
        });
        status.classList.add('ok');
        return;
      }

      const todayKey = dateKey(new Date().toISOString());
      const alerts = MeowStore.getAlerts();
      if (!alerts.some(a => a.dateKey === todayKey)) {
        alerts.unshift({
          id: 'alert-' + Date.now(),
          createdAt: new Date().toISOString(),
          dateKey: todayKey,
          catName: profile.name,
          streak: result.streak,
          clinicalLevel: result.clinicalLevel,
          message: I18n.t(
            '{name} has eaten less than {pct}% of the daily target for {days} days in a row. Please consider a vet visit.',
            { name: profile.name, pct: ALERT_BELOW_PCT, days: result.streak }
          )
        });
        MeowStore.saveAlerts(alerts);
      }
      I18n.setText(status, 'Alert created.');
      status.classList.add('bad');
      App.refresh();
    });
  },

  onShow() {
    const profile = MeowStore.getProfile();
    const logs = MeowStore.getLogs();
    const evalBox = document.getElementById('alerts-clinical-eval');
    if (evalBox && profile) {
      const r = detectAnomaly(logs, profile);
      evalBox.className = 'status ' + (r.triggered || r.clinicalLevel === 'high-risk' ? 'bad' : 'ok');
      I18n.setText(evalBox, r.clinicalReasonKey);
    }

    const alerts = MeowStore.getAlerts();
    const list = document.getElementById('alerts-list');
    list.innerHTML = '';

    alerts.forEach(a => {
      const li = document.createElement('li');
      const msg = document.createElement('div');
      const catName = a.catName || (profile && profile.name) || 'Cat';
      const streak = a.streak || ALERT_STREAK_DAYS;
      msg.textContent = I18n.t(
        '{name} has eaten less than {pct}% of the daily target for {days} days in a row. Please consider a vet visit.',
        { name: catName, pct: ALERT_BELOW_PCT, days: streak }
      );
      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = new Date(a.createdAt).toLocaleString(I18n.language === 'th' ? 'th-TH' : 'en-US');
      li.append(msg, when);
      list.appendChild(li);
    });

    document.getElementById('alerts-empty').hidden = alerts.length > 0;
  }
});
