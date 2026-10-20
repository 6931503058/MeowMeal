/* =====================================================================
   log.js – หน้า Log a meal : ส่วนเลือก % เอง + บันทึก (FR-2)   [Puree]
   ส่วนรูปถ่าย (FR-5) อยู่ใน photo.js ; สองไฟล์คุยกันผ่าน LogMeal.setPct()

   Acceptance criteria FR-2:
     AC#1: เลือก % (0/25/50/75/100) + diet tag → กด Log meal → บันทึกพร้อม timestamp ภายใน 1 วินาที
     AC#2: ขนม extra snack → อยู่ที่หน้า Snack (snack.js) บันทึกเป็น isOutlier = true
   ===================================================================== */

// LogMeal = "สถานะของฟอร์ม" ที่ photo.js ก็เข้าถึงได้ (ตัวแปรกลางของหน้านี้)
const LogMeal = (() => {
  let selected = null;                       // % ที่เลือกอยู่ (null = ยังไม่เลือก)

  // เลือก % (ส่ง null = ล้างการเลือก) : ไฮไลต์ปุ่ม + เปิด/ปิดปุ่ม Log meal
  function setPct(value) {
    selected = value;
    document.querySelectorAll('#log-pct-grid .pct-btn').forEach(btn => {
      btn.classList.toggle('selected', Number(btn.dataset.pct) === value);
    });
    document.getElementById('log-confirm').disabled = (value === null);
  }

  function getPct() { return selected; }

  // รีเซ็ตทั้งฟอร์ม (เรียกทุกครั้งที่เปิดหน้า)
  function reset() {
    setPct(null);
    const status = document.getElementById('log-status');
    status.hidden = true;
    status.className = 'status';
  }

  return { setPct, getPct, reset };
})();

App.register('log', {

  init() {
    // กดปุ่ม % ปุ่มไหน → เลือกค่านั้น (data-pct เป็นข้อความ จึงแปลงเป็นตัวเลขด้วย Number)
    document.querySelectorAll('#log-pct-grid .pct-btn').forEach(btn => {
      btn.addEventListener('click', () => LogMeal.setPct(Number(btn.dataset.pct)));
    });

    document.getElementById('log-confirm').addEventListener('click', () => {
      const status = document.getElementById('log-status');
      status.hidden = false;

      // ต้องมีโปรไฟล์แมวก่อน ไม่งั้นบันทึกให้ใครไม่ได้
      if (!MeowStore.getProfile()) {
        status.className = 'status bad';
        status.textContent = "Add your cat's profile first (cat icon, top left).";
        return;
      }
      if (LogMeal.getPct() === null) return;   // ปุ่มถูก disable อยู่แล้ว แต่กันไว้อีกชั้น

      // บันทึก: รูปแบบต้องตรงกับที่ storage.js กำหนด
      const saved = MeowStore.addLog({
        kind: 'meal',
        timestamp: new Date().toISOString(),
        remainingPct: LogMeal.getPct(),        // % ที่ "เหลือ"
        dietTag: document.getElementById('log-diet').value,
        isOutlier: false
      });

      status.className = saved ? 'status ok' : 'status bad';
      status.textContent = saved ? 'Meal saved.' : 'Could not save. Browser storage may be full.';
      if (saved) setTimeout(() => { location.hash = '#home'; }, 600);   // ให้เห็นข้อความแป๊บหนึ่ง
    });
  },

  onShow() {
    LogMeal.reset();
  }
});
