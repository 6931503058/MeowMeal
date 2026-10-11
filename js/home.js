/* 
   home.js – หน้า Home (1) แถบโปรไฟล์แมว  (2) ติดตามสถานะ 5 วันล่าสุด
 */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

App.register('home', {

  onShow() {
    const profile = MeowStore.getProfile();
    const logs = MeowStore.getLogs();

    // ยังไม่มีโปรไฟล์ → โชว์ "Welcome" ; มีแล้ว → โชว์แถบโปรไฟล์ + การ์ด 5 วัน
    document.getElementById('home-empty').hidden = !!profile;
    document.getElementById('home-profile').hidden = !profile;
    document.getElementById('home-tracker').hidden = !profile;
    if (!profile) return;

    // ---------- (1) แถบโปรไฟล์แมว ----------
    document.getElementById('home-cat-name').textContent = profile.name;
    document.getElementById('home-cat-detail').textContent =
      profile.age + ' yr · ' + profile.weight + ' kg · ' + profile.diagnosis;
    document.getElementById('home-target').textContent = profile.dailyTarget + '%';

    // ---------- (2) ติดตาม 5 วันล่าสุด ----------
    // dailyEaten() มาจาก anomaly_detector.js → [{date, eaten}] ; ทำเป็นพจนานุกรมไว้ค้นด้วยวันที่
    const eatenByDate = {};
    dailyEaten(logs).forEach(d => { eatenByDate[d.date] = d.eaten; });

    const wrap = document.getElementById('five-days');
    wrap.innerHTML = '';                                // ล้างของเก่าก่อนวาดใหม่

    const today = new Date();
    for (let i = 4; i >= 0; i--) {                      // i = 4 วันก่อน ... 0 = วันนี้ (ซ้าย → ขวา)
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dateKey(d.toISOString());
      const eaten = eatenByDate[key];                   // undefined ถ้าวันนั้นไม่มี log
      const hasLog = eaten !== undefined;
      const below = hasLog && eaten < profile.dailyTarget;

      // สร้างคอลัมน์ 1 วัน: ตัวเลข + แท่ง (พร้อมเส้นเป้าหมาย) + ชื่อวัน/วันที่
      const col = document.createElement('div');
      col.className = 'day' + (i === 0 ? ' today' : '') + (hasLog ? '' : ' none');

      const val = document.createElement('div');
      val.className = 'val';
      val.textContent = hasLog ? Math.round(eaten) + '%' : '–';

      const track = document.createElement('div');
      track.className = 'track';
      if (hasLog) {
        const fill = document.createElement('div');
        fill.className = 'fill' + (below ? ' below' : '');
        fill.style.height = Math.round(eaten) + '%';    // ความสูงแท่ง = % ที่กิน
        track.appendChild(fill);
      }
      const mark = document.createElement('div');       // เส้นประ = เป้าหมาย
      mark.className = 'mark';
      mark.style.bottom = profile.dailyTarget + '%';
      track.appendChild(mark);

      const label = document.createElement('div');
      label.className = 'dlabel';
      label.innerHTML = DAY_NAMES[d.getDay()] + '<br>' + d.getDate();   // ข้อมูลภายใน ไม่ใช่ input ผู้ใช้

      col.append(val, track, label);
      wrap.appendChild(col);
    }

    // ป้ายสรุปมุมขวาบนของการ์ด: จำนวนวันติดกันที่ต่ำกว่าเป้า (ตัวนับของ FR-3)
    const result = detectAnomaly(logs, profile);
    const pill = document.getElementById('home-streak');
    pill.textContent = result.streak + ' of ' + ALERT_STREAK_DAYS + ' days below target';
    pill.classList.toggle('warn', result.streak > 0);
  }
});
