/* =====================================================================
   app.js – ตัวสลับหน้า (Router) ของแอป   [Parewa]
   ---------------------------------------------------------------------
   แนวคิด:
   - แต่ละหน้าคือ <section id="view-ชื่อ"> ใน index.html
   - ลิงก์ <a href="#log"> เปลี่ยน "hash" ท้าย URL → เกิด event hashchange
   - เราฟัง hashchange แล้วแสดง section ที่ตรงชื่อ ซ่อนอันอื่น
   - ข้อดีของ hash: ปุ่ม Back ของเบราว์เซอร์ใช้ได้ และรีเฟรชแล้วอยู่หน้าเดิม

   ไฟล์ของแต่ละหน้าลงทะเบียนด้วย:
       App.register('log', { init() {...}, onShow() {...} });
     init()   = รันครั้งเดียวตอนเริ่มแอป (ผูกปุ่ม/event)
     onShow() = รันทุกครั้งที่เปิดหน้านั้น (อ่านข้อมูลใหม่แล้ววาดหน้า)
   หน้าเดียวกันลงทะเบียนได้หลายไฟล์ (เช่นหน้า log มีทั้ง log.js และ photo.js)
   ===================================================================== */
const App = (() => {

  const views = {};              // { ชื่อหน้า: [hooks, hooks, ...] }
  const DEFAULT_VIEW = 'home';   // หน้าที่เปิดเมื่อ URL ไม่มี hash หรือชื่อผิด

  // ไฟล์หน้าต่างๆ เรียกฟังก์ชันนี้เพื่อลงทะเบียน (ต่อท้ายรายการ ไม่เขียนทับของเดิม)
  function register(name, hooks) {
    (views[name] = views[name] || []).push(hooks);
  }

  // แสดงหน้าที่ชื่อ name
  function show(name) {
    // ไม่มี section ชื่อนี้ (พิมพ์ hash ผิด) → กลับหน้า Home
    if (!document.getElementById('view-' + name)) name = DEFAULT_VIEW;

    // 1) ซ่อนทุกหน้า แล้วแสดงเฉพาะหน้านี้
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const section = document.getElementById('view-' + name);
    section.classList.add('active');

    // 2) ไฮไลต์ปุ่มแท็บที่หน้านี้สังกัด (อ่านจาก data-tab ของ section)
    const tab = section.dataset.tab;
    document.querySelectorAll('.tabbar a').forEach(a => {
      a.classList.toggle('active', a.dataset.tab === tab);
    });

    // 3) เลื่อนกลับขึ้นบนสุด
    document.querySelector('.content').scrollTop = 0;

    // 4) บอกทุกไฟล์ของหน้านี้ให้วาดข้อมูลล่าสุด
    (views[name] || []).forEach(v => { if (v.onShow) v.onShow(); });

    // 5) อัปเดตจุดแดง (กระดิ่ง + แท็บ Alert) เมื่อมี alert
    const hasAlerts = MeowStore.getAlerts().length > 0;
    document.getElementById('bell-dot').hidden = !hasAlerts;
    document.getElementById('tab-alert-dot').hidden = !hasAlerts;
  }

  // อ่านชื่อหน้าจาก URL (#log → "log") แล้วแสดง
  function route() {
    show(location.hash.replace('#', '') || DEFAULT_VIEW);
  }

  // วาดหน้าปัจจุบันใหม่ (ใช้หลังโหลด/ล้างข้อมูล หรือสร้าง alert)
  function refresh() {
    route();
  }

  // เริ่มแอป: init() ทุกไฟล์ → ฟัง hashchange → แสดงหน้าแรก
  function start() {
    Object.values(views).forEach(list => list.forEach(v => { if (v.init) v.init(); }));
    window.addEventListener('hashchange', route);
    route();
  }

  // รอให้ทุกสคริปต์โหลดครบก่อนค่อย start (ไฟล์หน้าต่างๆ ถูกโหลดหลัง app.js)
  document.addEventListener('DOMContentLoaded', start);

  return { register, show, refresh };
})();
