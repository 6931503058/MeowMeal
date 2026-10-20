// snack.js - บันทึกขนมที่ให้แมว (ไม่ใช่ baseline) (เอาไว้ไปพิจารณาร่วมกับเปอร์เซ็นต์ที่กินของมื้อหลัก)

let selectedSnack = null;                    // ชนิดขนมที่เลือก (null = ยังไม่เลือก)

function selectSnack(name) {
  selectedSnack = name;
  document.querySelectorAll('#snack-grid .snack-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.snack === name);
  });
  document.getElementById('snack-confirm').disabled = (name === null);
}

// วาดรายการขนมที่ให้ไปแล้ว "วันนี้"
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
        remainingPct: null,                   // ขนมไม่มี % ที่เหลือ
        dietTag: selectedSnack,
        isOutlier: true                       // ← สำคัญ: ไม่นับใน baseline
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