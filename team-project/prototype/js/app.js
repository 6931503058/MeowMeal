/* =====================================================================
   app.js – ตัวสลับหน้า (Router) + ระบบจัดการบัญชีล็อกอิน (Auth)   [Parewa]
   ===================================================================== */
const App = (() => {

  const views = {};
  const DEFAULT_VIEW = 'home';

  function register(name, hooks) {
    (views[name] = views[name] || []).push(hooks);
  }

  function show(name) {
    // ถ้ายังไม่ได้ล็อกอิน ให้ไปหน้า login เสมอ
    if (!MeowStore.isLoggedIn() && name !== 'login') {
      name = 'login';
    }
    if (!document.getElementById('view-' + name)) name = DEFAULT_VIEW;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const section = document.getElementById('view-' + name);
    section.classList.add('active');

    // ซ่อนแท็บล่างถ้าอยู่หน้า login
    const tabbar = document.querySelector('.tabbar');
    if (tabbar) tabbar.hidden = (name === 'login');

    const tab = section.dataset.tab;
    document.querySelectorAll('.tabbar a').forEach(a => {
      a.classList.toggle('active', a.dataset.tab === tab);
    });

    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;

    (views[name] || []).forEach(v => { if (v.onShow) v.onShow(); });

    const hasAlerts = MeowStore.getAlerts().length > 0;
    const bellDot = document.getElementById('bell-dot');
    const tabDot = document.getElementById('tab-alert-dot');
    if (bellDot) bellDot.hidden = !hasAlerts;
    if (tabDot) tabDot.hidden = !hasAlerts;
  }

  function route() {
    show(location.hash.replace('#', '') || DEFAULT_VIEW);
  }

  function refresh() {
    route();
  }

  function start() {
    // หากเปิดแอปครั้งแรกสุดและยังไม่มีโปรไฟล์แมวเลย ให้โหลดข้อมูลตัวอย่าง 30 วันอัตโนมัติเพื่อพร้อมนำเสนอทันที
    if (!localStorage.getItem('meowmeal_initialized')) {
      MeowStore.loadSampleData();
      localStorage.setItem('meowmeal_initialized', '1');
    }

    Object.values(views).forEach(list => list.forEach(v => { if (v.init) v.init(); }));
    if (typeof I18n !== 'undefined') {
      I18n.apply();
      const langSelect = document.getElementById('set-lang');
      if (langSelect) {
        langSelect.addEventListener('change', event => {
          I18n.setLanguage(event.target.value);
        });
      }
      document.addEventListener('languagechange', refresh);
    }
    window.addEventListener('hashchange', route);
    route();
  }

  document.addEventListener('DOMContentLoaded', start);

  return { register, show, refresh };
})();
