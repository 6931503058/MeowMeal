/* 
   trend_dashboard.js – หน้า Trend 30 วัน (FR-4)
   SRS:
     - AC#1: มี log ≥ 1 รายการใน 30 วัน → วาดแท่งรายวันเรียงตามเวลา
     - AC#2: ไม่มี log เลย → ซ่อนกราฟ แล้วโชว์ "No logs available" (ห้าม error)
     - NFR-3: กราฟต้องเสร็จใน 2 วินาที
   */

let trendChart = null;   // เก็บกราฟที่วาดไว้ เพื่อทำลายก่อนวาดใหม่ (ไม่งั้นกราฟซ้อนกัน)

App.register('trend', {

  // วาดกราฟ "ตอนเปิดหน้า" ไม่ใช่ตอนโหลดเว็บ เพราะหน้านี้ถูกซ่อนอยู่ตอนโหลด
  // (กราฟที่วาดในกล่องที่ซ่อนอยู่จะได้ขนาดเป็น 0)
  onShow() {
    const logs = MeowStore.getLogs();
    const profile = MeowStore.getProfile();
    const box = document.getElementById('trend-chart-box');
    const empty = document.getElementById('trend-empty');

    // ทำลายกราฟเก่า (ถ้ามี)
    if (trendChart) { trendChart.destroy(); trendChart = null; }

    // สร้างรายการ 30 วันล่าสุด (วันที่เก่าสุด → วันนี้)
    const labels = [];     // ข้อความใต้แท่ง เช่น "10/09"
    const keys = [];       // กุญแจวันที่ "YYYY-MM-DD" ไว้จับคู่กับข้อมูล
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      keys.push(dateKey(d.toISOString()));
      labels.push((d.getMonth() + 1) + '/' + d.getDate());
    }

    // จับคู่ข้อมูลรายวันกับ 30 วัน (วันไหนไม่มี log = null → ไม่มีแท่ง)
    // ตัดสินใจ: กราฟนี้ไม่นับมื้อ extra snack (ใช้ dailyEaten ค่าเริ่มต้น) ทีมปรับได้
    const eatenByDay = {};
    dailyEaten(logs).forEach(d => { eatenByDay[d.date] = Math.round(d.eaten); });
    const data = keys.map(k => (k in eatenByDay ? eatenByDay[k] : null));

    // ไม่มีข้อมูลเลยใน 30 วัน → empty state (FR-4 AC#2)
    const hasData = data.some(v => v !== null);
    box.hidden = !hasData;
    empty.hidden = hasData;
    if (!hasData) return;

    // ชุดข้อมูล: แท่ง = % ที่กิน ; เส้น = เป้าหมาย (ถ้ามีโปรไฟล์)
    const datasets = [{
      type: 'bar',
      label: I18n.t('Eaten (%)'),
      data: data,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
    }];
    if (profile) {
      datasets.push({
        type: 'line',
        label: I18n.t('Target (%)'),
        data: keys.map(() => profile.dailyTarget),   // เส้นแนวนอนค่าคงที่
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
        borderWidth: 2,
        pointRadius: 0
      });
    }

    trendChart = new Chart(document.getElementById('recoveryChart'), {
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,          // ให้สูงตามกล่อง .chart-box (280px)
        scales: {
          y: { min: 0, max: 100, title: { display: true, text: I18n.t('% eaten') } },
          x: { ticks: { maxTicksLimit: 8 } } // ไม่ให้วันที่แน่นเกินบนจอมือถือ
        }
      }
    });
  }
});