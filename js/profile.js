/* =====================================================================
   profile.js – หน้า Cat profile, Settings, Demo tools และระบบ Login   [Puree & Parewa]
   ===================================================================== */

function setFieldError(field, message) {
  const input = document.getElementById('pf-' + field);
  const err = document.getElementById('pf-' + field + '-err');
  if (!input || !err) return;
  input.classList.toggle('field-error', !!message);
  err.hidden = !message;
  err.textContent = message || '';
}

function validateProfile(v) {
  const errors = {};
  if (!v.name) errors.name = I18n.t('Enter a name.');
  if (!(v.age > 0)) errors.age = I18n.t('Age must be greater than 0.');
  if (!(v.weight > 0)) errors.weight = I18n.t('Weight must be greater than 0.');
  if (!v.diagnosis) errors.diagnosis = I18n.t('Enter the diagnosis or recovery context.');
  if (!(v.dailyTargetG > 0)) errors.target = I18n.t('Enter the grams per day your vet prescribed.');
  else if (v.dailyTargetG > 1000) errors.target = I18n.t('That looks too high. Check that the amount is in grams per day.');
  return errors;
}

App.register('profile', {

  init() {
    document.getElementById('profile-form').addEventListener('submit', (event) => {
      event.preventDefault();

      const values = {
        name: document.getElementById('pf-name').value.trim(),
        age: Number(document.getElementById('pf-age').value),
        weight: Number(document.getElementById('pf-weight').value),
        diagnosis: document.getElementById('pf-diagnosis').value.trim(),
        dailyTargetG: Number(document.getElementById('pf-target').value)
      };

      const errors = validateProfile(values);
      ['name', 'age', 'weight', 'diagnosis', 'target'].forEach(f => setFieldError(f, errors[f]));

      if (Object.keys(errors).length > 0) return;

      MeowStore.saveProfile({ catId: 'CAT_01', ...values });
      location.hash = '#home';
    });

    // ปุ่มสลับบัญชี / ออกจากระบบ
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        MeowStore.logoutUser();
        location.hash = '#login';
      });
    }

    // เครื่องมือสาธิต
    document.getElementById('btn-sample').addEventListener('click', () => {
      MeowStore.loadSampleData();
      location.hash = '#home';
    });

    const btnResetToday = document.getElementById('btn-reset-today');
    if (btnResetToday) {
      btnResetToday.addEventListener('click', () => {
        MeowStore.clearTodayLogs();
        MeowStore.clearPendingBefore();
        alert(I18n.t("Today's meals cleared. Ready for live demo!"));
        location.hash = '#home';
      });
    }

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm(I18n.t('Delete the profile, meal logs and alerts?'))) {
        MeowStore.clearAll();
        App.refresh();
      }
    });
  },

  onShow() {
    const p = MeowStore.getProfile() || {};
    document.getElementById('pf-name').value = p.name ?? '';
    document.getElementById('pf-age').value = p.age ?? '';
    document.getElementById('pf-weight').value = p.weight ?? '';
    document.getElementById('pf-diagnosis').value = p.diagnosis ?? '';
    document.getElementById('pf-target').value = p.dailyTargetG ?? p.dailyTarget ?? '';
    ['name', 'age', 'weight', 'diagnosis', 'target'].forEach(f => setFieldError(f, ''));

    const user = MeowStore.getUser();
    const userDisplay = document.getElementById('account-user-display');
    if (userDisplay && user) {
      userDisplay.textContent = user.name + ' (' + user.email + ')';
    }
  }
});

// ลงทะเบียนหน้า Login (#login)
App.register('login', {
  init() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const name  = document.getElementById('login-name').value.trim() || 'Caregiver';
        const pass  = document.getElementById('login-pass').value;
        const err   = document.getElementById('login-err');

        if (!email || !email.includes('@') || !pass) {
          err.hidden = false;
          I18n.setText(err, 'Please enter a valid email and password.');
          return;
        }
        err.hidden = true;
        MeowStore.saveUser({
          email,
          name,
          role: 'Cat Owner / Caregiver',
          loggedInAt: new Date().toISOString()
        });
        if (!MeowStore.getProfile()) {
          MeowStore.loadSampleData();
        }
        location.hash = '#home';
      });
    }

    const demoLoginBtn = document.getElementById('btn-demo-login');
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', () => {
        MeowStore.saveUser({
          email: 'parewa.se@mfu.ac.th',
          name: 'Parewa (Caregiver)',
          role: 'Cat Owner / Caregiver',
          loggedInAt: new Date().toISOString()
        });
        if (!MeowStore.getProfile()) {
          MeowStore.loadSampleData();
        }
        location.hash = '#home';
      });
    }
  },
  onShow() {
    const err = document.getElementById('login-err');
    if (err) err.hidden = true;
  }
});
