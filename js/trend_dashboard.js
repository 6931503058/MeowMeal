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
  onShow() {
    const logs = MeowStore.getLogs();
    const profile = MeowStore.getProfile();
    const box = document.getElementById('trend-chart-box');
    const empty = document.getElementById('trend-empty');

    // ทำลายกราฟเก่า (ถ้ามี) เพื่อป้องกันการเรนเดอร์ซ้อนกัน
    if (trendChart) { 
      trendChart.destroy(); 
      trendChart = null; 
    }

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
    const eatenByDay = {};
    dailyEaten(logs).forEach(d => { eatenByDay[d.date] = Math.round(d.eaten); });
    const data = keys.map(k => (k in eatenByDay ? eatenByDay[k] : null));

    // ไม่มีข้อมูลเลยใน 30 วัน → Empty State (FR-4 AC#2)
    const hasData = data.some(v => v !== null);
    box.hidden = !hasData;
    empty.hidden = hasData;
    if (!hasData) return;

    // คำนวณสีของแท่งกราฟแบบ Dynamic (จาก dashboard.js: เน้นสีแดงสำหรับ 5 วันล่าสุด)
    const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || 'rgba(59, 130, 246, 0.7)';
    const backgroundColors = data.map((val, idx) => 
      idx >= data.length - 5 ? 'rgba(239, 68, 68, 0.7)' : defaultColor
    );
    const borderColors = data.map((val, idx) => 
      idx >= data.length - 5 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
    );

    // สร้างชุดข้อมูล (Datasets)
    const datasets = [{
      type: 'bar',
      label: 'Eaten (%)',
      data: data,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }];

    // ถ้ามีโปรไฟล์แมว ให้ใส่เส้น Target Line (เส้นประเป้าหมาย)
    if (profile && profile.dailyTarget) {
      datasets.push({
        type: 'line',
        label: 'Target (%)',
        data: keys.map(() => profile.dailyTarget),   // เส้นแนวนอนค่าคงที่ตามเป้าหมาย
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#10B981',
        borderWidth: 2,
        borderDash: [5, 5],                          // เส้นประแบบใน dashboard.js
        pointRadius: 0,
        fill: false
      });
    }

    // วาดกราฟ Chart.js Instance ใหม่
    const ctx = document.getElementById('recoveryChart');
    if (ctx) {
      trendChart = new Chart(ctx, {
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,          // ให้สูงตามกล่อง .chart-box (280px)
          scales: {
            y: { min: 0, max: 100, title: { display: true, text: '% eaten' } },
            x: { ticks: { maxTicksLimit: 8 } } // ไม่ให้วันที่แน่นเกินบนจอมือถือ
          }
        }
      });
    }
  }
});