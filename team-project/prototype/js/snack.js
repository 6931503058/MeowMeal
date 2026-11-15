/* =====================================================================
   snack.js – หน้า Snack (FR-2 AC#2: extra snack)
   ขนมนอกมื้อทำให้ข้อมูลการกินเพี้ยน จึงบันทึกแยก ติด isOutlier = true
   → anomaly_detector.js ข้ามไปเอง ไม่นับใน baseline ของ FR-3
   ===================================================================== */
let selectedSnack = null;

function selectSnack(name) {
  selectedSnack = name;
  document.querySelectorAll('#snack-grid .snack-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.snack === name);
  });
  document.getElementById('snack-confirm').disabled = (name === null);
}

function renderTodaySnacks() {
  const todayKey = dateKey(new Date().toISOString());
  const snacks = MeowStore.getLogs().filter(l => l.kind === 'snack' && dateKey(l.timestamp) === todayKey);

  const list = document.getElementById('snack-list');
  list.innerHTML = '';
  snacks.forEach(s => {
    const li = document.createElement('li');
    const time = new Date(s.timestamp).toLocaleTimeString(
      I18n.language === 'th' ? 'th-TH' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    );
    li.textContent = time + '  ·  ' + I18n.t(s.dietTag);
    list.appendChild(li);
  });
  document.getElementById('snack-empty').hidden = snacks.length > 0;
}

App.register('snack', {

  init() {
    document.querySelectorAll('#snack-grid .snack-btn').forEach(btn => {
      btn.addEventListener('click', () => selectSnack(btn.dataset.snack));
    });

    document.getElementById('snack-confirm').addEventListener('click', () => {
      const status = document.getElementById('snack-status');
      status.hidden = false;

      if (!MeowStore.getProfile()) {
        status.className = 'status bad';
        I18n.setText(status, "Add your cat's profile first (cat icon, top left).");
        return;
      }
      const saved = MeowStore.addLog({
        kind: 'snack',
        timestamp: new Date().toISOString(),
        servedG: null, leftG: null, eatenG: null,
        dietTag: selectedSnack,
        isOutlier: true
      });
      status.className = saved ? 'status ok' : 'status bad';
      I18n.setText(status, saved ? 'Snack saved.' : 'Could not save. Browser storage may be full.');
      selectSnack(null);
      renderTodaySnacks();
    });
  },

  onShow() {
    selectSnack(null);
    document.getElementById('snack-status').hidden = true;
    renderTodaySnacks();
  }
});
