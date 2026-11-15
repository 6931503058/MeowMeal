/* =====================================================================
   trend_dashboard.js – หน้าแดชบอร์ดแนวโน้มการกินอาหาร 30 วันสำหรับสัตวแพทย์ (FR-4 Enhanced)
   ---------------------------------------------------------------------
   ออกแบบใหม่ให้เข้าใจง่ายและมีประสิทธิภาพสูงสำหรับการตรวจของสัตวแพทย์:
     1) KPI Summary Cards 4 ช่อง:
        - ค่าเฉลี่ยปริมาณที่กิน (กรัม/วัน และ % ของเป้าหมาย)
        - อัตราวันที่กินผ่านเกณฑ์มาตรฐาน ISFM (>= 80% RER)
        - จำนวนวันที่เกิดภาวะเบื่ออาหาร (Hyporexia < 80%) และระดับรุนแรง (< 50%)
        - ทิศทางแนวโน้ม 7 วันล่าสุดเทียบกับ 7 วันก่อนหน้า (Trend Direction)
     2) ปุ่มสลับช่วงเวลา (7 วัน / 14 วัน / 30 วัน) และปุ่มสลับหน่วย (% ของเป้าหมาย / กรัมจริง)
     3) กราฟผสม (Combo Bar + 3-Day Moving Average Trend Line + เส้นเกณฑ์สัตวแพทย์ 80% และ 50%)
        แยกสีแท่งกราฟตามโซนความเสี่ยงทางคลินิก 4 ระดับ (เขียว / เหลืองส้ม / ส้มเข้ม / แดง)
     4) ตารางสรุปข้อมูลรายวันย้อนหลังพร้อมป้ายสถานะทางคลินิก (Clinical Status Badge)
   ===================================================================== */

let trendChart = null;
let trendRangeDays = 30;     // 7 | 14 | 30
let trendUnitMode = 'pct';   // 'pct' | 'grams'

function getZoneColor(pct) {
  if (pct === null || pct === undefined) return { bg: 'transparent', border: 'transparent', badge: 'none', labelKey: 'No data' };
  if (pct >= ALERT_BELOW_PCT) {
    return { bg: 'rgba(46, 160, 115, 0.82)', border: '#1b7a54', badge: 'ok', labelKey: 'Normal (>=80%)' };
  }
  if (pct >= SEVERE_BELOW_PCT) {
    return { bg: 'rgba(240, 158, 56, 0.88)', border: '#b86b11', badge: 'warn', labelKey: 'Hyporexia (50–79%)' };
  }
  if (pct >= ANOREXIA_BELOW_PCT) {
    return { bg: 'rgba(224, 96, 68, 0.90)', border: '#a8331b', badge: 'bad', labelKey: 'Severe (<50%)' };
  }
  return { bg: 'rgba(180, 35, 35, 0.95)', border: '#6e0f0f', badge: 'critical', labelKey: 'Anorexia (<25%)' };
}

function renderTrendDashboard() {
  const logs = MeowStore.getLogs();
  const profile = MeowStore.getProfile();
  const box = document.getElementById('trend-chart-box');
  const empty = document.getElementById('trend-empty');
  const kpiWrap = document.getElementById('trend-kpi-grid');
  const tableCard = document.getElementById('trend-table-card');

  if (trendChart) { trendChart.destroy(); trendChart = null; }

  const targetG = profile ? (profile.dailyTargetG || profile.dailyTarget || 180) : 180;

  // สร้างรายการ 30 วันเต็มสำหรับคำนวณ KPI ภาพรวม
  const all30Keys = [];
  const all30Dates = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    all30Keys.push(dateKey(d.toISOString()));
    all30Dates.push(d);
  }

  const byDate = {};
  if (profile) {
    dailyIntake(logs, targetG).forEach(d => {
      byDate[d.date] = d;
    });
  }

  const loggedDays30 = all30Keys.map(k => byDate[k]).filter(Boolean);
  const hasData = loggedDays30.length > 0;

  box.hidden = !hasData;
  empty.hidden = hasData;
  if (kpiWrap) kpiWrap.hidden = !hasData;
  if (tableCard) tableCard.hidden = !hasData;
  if (!hasData) return;

  // ---------- 1) คำนวณและแสดง KPI Summary Cards 4 ช่อง ----------
  const totalGrams = loggedDays30.reduce((s, d) => s + d.eatenG, 0);
  const avgGrams = Math.round(totalGrams / loggedDays30.length);
  const avgPct = Math.round((avgGrams / targetG) * 100);

  const normalDaysCount = loggedDays30.filter(d => d.pct >= ALERT_BELOW_PCT).length;
  const hyporexiaDaysCount = loggedDays30.filter(d => d.pct < ALERT_BELOW_PCT).length;
  const severeDaysCount = loggedDays30.filter(d => d.pct < SEVERE_BELOW_PCT).length;

  // เปรียบเทียบค่าเฉลี่ย 5 วันล่าสุดที่มีข้อมูล กับ 5 วันก่อนหน้า
  const recentSlice = loggedDays30.slice(-5);
  const prevSlice = loggedDays30.slice(-10, -5);
  const recentAvgPct = recentSlice.length ? recentSlice.reduce((s, d) => s + d.pct, 0) / recentSlice.length : avgPct;
  const prevAvgPct = prevSlice.length ? prevSlice.reduce((s, d) => s + d.pct, 0) / prevSlice.length : recentAvgPct;
  const diffPct = Math.round(recentAvgPct - prevAvgPct);

  const kpiAvgEl = document.getElementById('kpi-avg-val');
  const kpiAvgSub = document.getElementById('kpi-avg-sub');
  const kpiNormalEl = document.getElementById('kpi-normal-val');
  const kpiNormalSub = document.getElementById('kpi-normal-sub');
  const kpiRiskEl = document.getElementById('kpi-risk-val');
  const kpiRiskSub = document.getElementById('kpi-risk-sub');
  const kpiDeltaEl = document.getElementById('kpi-delta-val');
  const kpiDeltaSub = document.getElementById('kpi-delta-sub');

  if (kpiAvgEl) {
    kpiAvgEl.textContent = avgGrams + ' g/d (' + avgPct + '%)';
    kpiAvgSub.textContent = I18n.t('Target: {target} g/d', { target: targetG });
  }
  if (kpiNormalEl) {
    const complianceRate = Math.round((normalDaysCount / loggedDays30.length) * 100);
    kpiNormalEl.textContent = normalDaysCount + '/' + loggedDays30.length + ' (' + complianceRate + '%)';
    kpiNormalSub.textContent = I18n.t('Days >= 80% RER (ISFM)');
  }
  if (kpiRiskEl) {
    kpiRiskEl.textContent = hyporexiaDaysCount + ' ' + I18n.t('days');
    kpiRiskEl.className = 'kpi-val ' + (severeDaysCount > 0 ? 'bad-text' : (hyporexiaDaysCount >= 3 ? 'warn-text' : ''));
    kpiRiskSub.textContent = I18n.t('Severe (<50%): {severe} days', { severe: severeDaysCount });
  }
  if (kpiDeltaEl) {
    const sign = diffPct > 0 ? '+' : '';
    kpiDeltaEl.textContent = sign + diffPct + '%';
    kpiDeltaEl.className = 'kpi-val ' + (diffPct < -10 ? 'bad-text' : (diffPct > 5 ? 'ok-text' : ''));
    kpiDeltaSub.textContent = diffPct < -10
      ? I18n.t('Declining intake')
      : (diffPct > 5 ? I18n.t('Improving recovery') : I18n.t('Stable trend'));
  }

  // ---------- 2) เตรียมข้อมูลตามช่วงวันที่เลือก (7 / 14 / 30 วัน) ----------
  const sliceKeys = all30Keys.slice(-trendRangeDays);
  const sliceDates = all30Dates.slice(-trendRangeDays);
  const labels = sliceDates.map(d => (d.getMonth() + 1) + '/' + d.getDate());

  const pctSeries = sliceKeys.map(k => (byDate[k] ? Math.round(byDate[k].pct) : null));
  const gramSeries = sliceKeys.map(k => (byDate[k] ? Math.round(byDate[k].eatenG) : null));
  const activeSeries = trendUnitMode === 'pct' ? pctSeries : gramSeries;

  // คำนวณเส้นค่าเฉลี่ยเคลื่อนที่ 3 วัน (3-Day Moving Average) เพื่อให้เห็นทิศทางแนวโน้มชัดเจนขึ้น
  const movingAvg = activeSeries.map((_, idx) => {
    const windowVals = [];
    for (let j = Math.max(0, idx - 2); j <= idx; j++) {
      if (activeSeries[j] !== null) windowVals.push(activeSeries[j]);
    }
    if (!windowVals.length) return null;
    return Math.round((windowVals.reduce((a, b) => a + b, 0) / windowVals.length) * 10) / 10;
  });

  const barColors = pctSeries.map(p => getZoneColor(p).bg);
  const barBorders = pctSeries.map(p => getZoneColor(p).border);

  const isPct = trendUnitMode === 'pct';
  const isfmLineVal = isPct ? ALERT_BELOW_PCT : Math.round(targetG * (ALERT_BELOW_PCT / 100));
  const severeLineVal = isPct ? SEVERE_BELOW_PCT : Math.round(targetG * (SEVERE_BELOW_PCT / 100));

  // ---------- 3) วาดกราฟผสม (Bar + 3-Day Moving Average + 2 Clinical Reference Lines) ----------
  trendChart = new Chart(document.getElementById('recoveryChart'), {
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: isPct ? I18n.t('Daily intake (% of target)') : I18n.t('Daily intake (g)'),
          data: activeSeries,
          backgroundColor: barColors,
          borderColor: barBorders,
          borderWidth: 1.2,
          borderRadius: 5,
          order: 3
        },
        {
          type: 'line',
          label: I18n.t('3-Day Moving Avg'),
          data: movingAvg,
          borderColor: '#1f6f95',
          backgroundColor: 'rgba(31, 111, 149, 0.12)',
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 2.5,
          pointBackgroundColor: '#1f6f95',
          spanGaps: true,
          order: 1
        },
        {
          type: 'line',
          label: I18n.t('ISFM Hyporexia Threshold (80%)'),
          data: sliceKeys.map(() => isfmLineVal),
          borderColor: '#d97706',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          order: 2
        },
        {
          type: 'line',
          label: I18n.t('Severe / Lipidosis Risk (50%)'),
          data: sliceKeys.map(() => severeLineVal),
          borderColor: '#b42323',
          borderWidth: 1.8,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: false,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          min: 0,
          suggestedMax: isPct ? 110 : Math.round(targetG * 1.15),
          title: {
            display: true,
            text: isPct ? I18n.t('% of daily target') : I18n.t('Grams eaten (g)')
          }
        },
        x: {
          ticks: { maxTicksLimit: trendRangeDays <= 14 ? 14 : 10 }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const idx = items[0]?.dataIndex;
              if (idx == null) return '';
              const key = sliceKeys[idx];
              const rec = byDate[key];
              if (!rec) return I18n.t('No meals logged');
              const z = getZoneColor(rec.pct);
              return [
                I18n.t('Eaten: {g} g / {t} g ({p}%)', { g: Math.round(rec.eatenG), t: targetG, p: Math.round(rec.pct) }),
                I18n.t('Meals logged: {m}', { m: rec.meals }),
                I18n.t('Clinical zone: ') + I18n.t(z.labelKey)
              ];
            }
          }
        }
      }
    }
  });

  // ---------- 4) สร้างตารางบันทึกย้อนหลังรายวันพร้อมป้ายสถานะทางการแพทย์ ----------
  const tbody = document.getElementById('trend-log-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    const recentRows = sliceKeys.slice().reverse().map(k => ({ key: k, rec: byDate[k] })).filter(x => x.rec);
    recentRows.slice(0, 10).forEach(({ key, rec }) => {
      const tr = document.createElement('tr');
      const z = getZoneColor(rec.pct);
      const dObj = new Date(key + 'T12:00:00');
      const dateStr = dObj.toLocaleDateString(I18n.language === 'th' ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });

      const tdDate = document.createElement('td');
      tdDate.textContent = dateStr;

      const tdGrams = document.createElement('td');
      tdGrams.innerHTML = '<strong>' + Math.round(rec.eatenG) + ' g</strong> <span class="muted">/ ' + targetG + 'g</span>';

      const tdPct = document.createElement('td');
      tdPct.textContent = Math.round(rec.pct) + '%';

      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'zone-badge ' + z.badge;
      badge.textContent = I18n.t(z.labelKey);
      tdStatus.appendChild(badge);

      tr.append(tdDate, tdGrams, tdPct, tdStatus);
      tbody.appendChild(tr);
    });
  }
}

App.register('trend', {
  init() {
    document.querySelectorAll('.trend-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        trendRangeDays = Number(btn.dataset.range) || 30;
        document.querySelectorAll('.trend-range-btn').forEach(b =>
          b.classList.toggle('active', b === btn)
        );
        renderTrendDashboard();
      });
    });

    document.querySelectorAll('.trend-unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        trendUnitMode = btn.dataset.unit || 'pct';
        document.querySelectorAll('.trend-unit-btn').forEach(b =>
          b.classList.toggle('active', b === btn)
        );
        renderTrendDashboard();
      });
    });
  },
  onShow() {
    renderTrendDashboard();
  }
});
