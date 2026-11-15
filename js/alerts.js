/* =====================================================================
   alerts.js – หน้า Alerts (เกณฑ์ตัดสินความผิดปกติอ้างอิงงานวิจัย ISFM 2022 / WSAVA / Cornell / Merck)
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
        I18n.setText(status, 'No clinical alert triggered yet. Consecutive days < 80% RER: {streak} of {days} days (ISFM/WSAVA threshold).', {
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
          severeStreak: result.severeStreak,
          clinicalLevel: result.clinicalLevel,
          titleKey: result.clinicalTitleKey,
          reasonKey: result.clinicalReasonKey
        });
        MeowStore.saveAlerts(alerts);
      }
      I18n.setText(status, 'Clinical alert created based on veterinary guidelines.');
      status.classList.add('bad');
      App.refresh();
    });
  },

  onShow() {
    const profile = MeowStore.getProfile();
    const logs = MeowStore.getLogs();
    const evalTitle = document.getElementById('alerts-clinical-title');
    const evalBox = document.getElementById('alerts-clinical-eval');

    if (evalBox && profile) {
      const r = detectAnomaly(logs, profile);
      if (evalTitle) I18n.setText(evalTitle, r.clinicalTitleKey);
      evalBox.className = 'status ' + (r.triggered ? 'bad' : (r.clinicalLevel === 'watch' ? 'warn' : 'ok'));
      I18n.setText(evalBox, r.clinicalReasonKey);
    }

    const alerts = MeowStore.getAlerts();
    const list = document.getElementById('alerts-list');
    list.innerHTML = '';

    alerts.forEach(a => {
      const li = document.createElement('li');
      const titleDiv = document.createElement('div');
      titleDiv.style.fontWeight = '700';
      titleDiv.style.marginBottom = '4px';
      titleDiv.textContent = (a.catName || (profile && profile.name) || 'Cat') + ' — ' + I18n.t(a.titleKey || 'Tier 2: Clinical Hyporexia Alert (< 80% for 3+ Days)');

      const msg = document.createElement('div');
      msg.textContent = a.reasonKey ? I18n.t(a.reasonKey) : (a.message || '');

      const when = document.createElement('div');
      when.className = 'when';
      when.textContent = new Date(a.createdAt).toLocaleString(I18n.language === 'th' ? 'th-TH' : 'en-US');

      li.append(titleDiv, msg, when);
      list.appendChild(li);
    });

    document.getElementById('alerts-empty').hidden = alerts.length > 0;
  }
});
