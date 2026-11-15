/* =====================================================================
   trend_dashboard.js – หน้า Trend 30 วัน (FR-4)   [Pattarawat]
   แท่ง = % ของเป้ารายวันในแต่ละวัน (สีส้มแดงเมื่อต่ำกว่าเกณฑ์ ALERT_BELOW_PCT, สีฟ้าเมื่อปกติ)
   เส้นประ = เกณฑ์ต่ำกว่าเป้าหมาย (ALERT_BELOW_PCT = 75%)
   ===================================================================== */

let trendChart = null;

App.register('trend', {

  onShow() {
    const logs = MeowStore.getLogs();
    const profile = MeowStore.getProfile();
    const box = document.getElementById('trend-chart-box');
    const empty = document.getElementById('trend-empty');

    if (trendChart) { trendChart.destroy(); trendChart = null; }

    const labels = [];
    const keys = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      keys.push(dateKey(d.toISOString()));
      labels.push((d.getMonth() + 1) + '/' + d.getDate());
    }

    const pctByDay = {}, gramsByDay = {};
    const targetG = profile ? (profile.dailyTargetG || profile.dailyTarget || 180) : 180;
    if (profile) {
      dailyIntake(logs, targetG).forEach(d => {
        pctByDay[d.date] = Math.round(d.pct);
        gramsByDay[d.date] = Math.round(d.eatenG);
      });
    }
    const data = keys.map(k => (k in pctByDay ? pctByDay[k] : null));
    const grams = keys.map(k => (k in gramsByDay ? gramsByDay[k] : null));

    const hasData = data.some(v => v !== null);
    box.hidden = !hasData;
    empty.hidden = hasData;
    if (!hasData) return;

    const barColors = data.map(v =>
      v === null ? 'transparent' : (v < ALERT_BELOW_PCT ? 'rgba(224, 116, 90, 0.88)' : 'rgba(124, 193, 230, 0.9)')
    );
    const barBorders = data.map(v =>
      v === null ? 'transparent' : (v < ALERT_BELOW_PCT ? '#b4412a' : '#1f6f95')
    );

    trendChart = new Chart(document.getElementById('recoveryChart'), {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: I18n.t('% of daily target'),
            data: data,
            backgroundColor: barColors,
            borderColor: barBorders,
            borderWidth: 1,
            borderRadius: 4
          },
          {
            type: 'line',
            label: I18n.t('Low-intake threshold ({pct}%)', { pct: ALERT_BELOW_PCT }),
            data: keys.map(() => ALERT_BELOW_PCT),
            borderColor: '#b4412a',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            suggestedMax: 100,
            title: { display: true, text: I18n.t('% of daily target') }
          },
          x: {
            ticks: { maxTicksLimit: 8 }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => ctx.datasetIndex === 0 && grams[ctx.dataIndex] !== null
                ? grams[ctx.dataIndex] + ' g / ' + targetG + ' g'
                : ''
            }
          }
        }
      }
    });
  }
});
