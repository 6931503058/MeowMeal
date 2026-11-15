/* =====================================================================
   meal_log.js – หน้า Log a meal : ปริมาณที่กิน (กรัม) + บันทึก (FR-2)   [Puree]
   ส่วนรูปก่อนกิน/หลังกิน (FR-5) อยู่ใน photo.js ; สองไฟล์คุยกันผ่าน LogMeal.set()
   ===================================================================== */

const LogMeal = (() => {
  let source = 'manual';

  const el = (id) => document.getElementById(id);
  const round1 = (x) => Math.round(x * 10) / 10;

  function readNum(id) {
    const node = el(id);
    if (!node) return null;
    const raw = node.value;
    return raw === '' ? null : Number(raw);
  }

  function values() {
    return { served: readNum('log-served'), left: readNum('log-left') };
  }

  function check() {
    const { served, left } = values();
    if (served === null || left === null) return { ok: false, eaten: null, message: '' };
    if (!(served > 0)) return { ok: false, eaten: null, message: 'Served must be more than 0 g.' };
    if (left < 0) return { ok: false, eaten: null, message: 'Left cannot be negative.' };
    if (left > served) return { ok: false, eaten: null, message: "Left can't be more than served." };
    return { ok: true, eaten: round1(served - left), message: '' };
  }

  function recalc() {
    const r = check();
    el('log-eaten').textContent = r.ok ? r.eaten + ' g' : '–';
    el('log-confirm').disabled = !r.ok;

    const { served, left } = values();
    document.querySelectorAll('#log-pct-grid .pct-btn').forEach(btn => {
      const match = r.ok && Math.abs((left / served) * 100 - Number(btn.dataset.pct)) < 1.0;
      btn.classList.toggle('selected', match);
    });

    const status = el('log-status');
    status.hidden = !r.message;
    status.className = 'status bad';
    if (r.message) I18n.setText(status, r.message);
  }

  function set({ served, left, src }) {
    if (served !== undefined) el('log-served').value = served === null ? '' : served;
    if (left !== undefined) el('log-left').value = left === null ? '' : left;
    if (src) source = src;
    recalc();
  }

  function reset() {
    source = 'manual';
    const lastMeal = MeowStore.getLogs().filter(l => l.kind === 'meal').pop();
    el('log-served').value = lastMeal && lastMeal.servedG ? lastMeal.servedG : 60;
    el('log-left').value = '';
    recalc();
  }

  return { set, values, check, recalc, reset, getSource: () => source };
})();

App.register('log', {

  init() {
    ['log-served', 'log-left'].forEach(id => {
      document.getElementById(id).addEventListener('input', LogMeal.recalc);
    });

    document.querySelectorAll('#log-pct-grid .pct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const { served } = LogMeal.values();
        if (!(served > 0)) {
          const status = document.getElementById('log-status');
          status.hidden = false;
          status.className = 'status bad';
          I18n.setText(status, 'Enter the amount served first.');
          return;
        }
        LogMeal.set({ left: Math.round(served * Number(btn.dataset.pct) / 100 * 10) / 10 });
      });
    });

    document.getElementById('log-confirm').addEventListener('click', () => {
      const status = document.getElementById('log-status');

      if (!MeowStore.getProfile()) {
        status.hidden = false;
        status.className = 'status bad';
        I18n.setText(status, "Add your cat's profile first (cat icon, top left).");
        return;
      }
      const r = LogMeal.check();
      if (!r.ok) return;
      const { served, left } = LogMeal.values();

      const saved = MeowStore.addLog({
        kind: 'meal',
        timestamp: new Date().toISOString(),
        servedG: served,
        leftG: left,
        eatenG: r.eaten,
        remainingPct: Math.round((left / served) * 100),
        dietTag: document.getElementById('log-diet').value,
        isOutlier: false,
        source: LogMeal.getSource()
      });

      if (saved) MeowStore.clearPendingBefore();
      status.hidden = false;
      status.className = saved ? 'status ok' : 'status bad';
      I18n.setText(status, saved ? 'Meal saved.' : 'Could not save. Browser storage may be full.');
      if (saved) setTimeout(() => { location.hash = '#home'; }, 600);
    });
  },

  onShow() {
    LogMeal.reset();
  }
});
