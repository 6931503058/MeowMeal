/* 
   profile.js – หน้า Cat profile & settings (FR-1)

   Acceptance criteria:
     AC#1: กรอกครบ ตัวเลขเป็นบวก → กด Save → บันทึก + ไปแสดงที่ Home
     AC#2: ชื่อว่าง / weight <= 0 / target <= 0 → ปฏิเสธ + ไฮไลต์ช่อง + "ไม่สร้าง record"
 */

// ใส่/ล้างข้อความ error ใต้ช่อง พร้อมไฮไลต์กรอบแดง
function setFieldError(field, message) {
  const input = document.getElementById('pf-' + field);
  const err = document.getElementById('pf-' + field + '-err');
  input.classList.toggle('field-error', !!message);
  err.hidden = !message;
  err.textContent = message || '';
}

// ตรวจข้อมูล: คืน object ของ error  { ชื่อช่อง: ข้อความ } (ว่าง = ผ่านหมด)
function validateProfile(v) {
  const errors = {};
  if (!v.name) errors.name = I18n.t('Enter a name.');
  if (!(v.age > 0)) errors.age = I18n.t('Age must be greater than 0.');
  if (!(v.weight > 0)) errors.weight = I18n.t('Weight must be greater than 0.');
  if (!v.diagnosis) errors.diagnosis = I18n.t('Enter the diagnosis or recovery context.');
  if (!(v.dailyTarget > 0)) errors.target = I18n.t('Target must be greater than 0.');
  else if (v.dailyTarget > 100) errors.target = I18n.t('Target cannot be more than 100%.');
  return errors;
}

App.register('profile', {

  init() {
    // ---- ฟอร์มโปรไฟล์ ----
    document.getElementById('profile-form').addEventListener('submit', (event) => {
      event.preventDefault();                 // กันเบราว์เซอร์รีโหลดหน้าตอน submit

      // อ่านค่า: ช่อง number ให้ผลเป็นข้อความ จึงแปลงเป็นตัวเลขด้วย Number()
      // (ช่องว่าง → Number('') = 0 → ไม่ผ่าน "ต้องมากกว่า 0" ซึ่งถูกต้อง)
      const values = {
        name: document.getElementById('pf-name').value.trim(),
        age: Number(document.getElementById('pf-age').value),
        weight: Number(document.getElementById('pf-weight').value),
        diagnosis: document.getElementById('pf-diagnosis').value.trim(),
        dailyTarget: Number(document.getElementById('pf-target').value)
      };

      const errors = validateProfile(values);
      ['name', 'age', 'weight', 'diagnosis', 'target'].forEach(f => setFieldError(f, errors[f]));

      if (Object.keys(errors).length > 0) return;   // AC#2: มี error → หยุด ไม่บันทึก

      MeowStore.saveProfile({ catId: 'cat1', ...values });   // AC#1
      location.hash = '#home';
    });

    // ---- เครื่องมือสาธิต ----
    document.getElementById('btn-sample').addEventListener('click', () => {
      MeowStore.loadSampleData();
      location.hash = '#home';
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm(I18n.t('Delete the profile, meal logs and alerts?'))) {
        MeowStore.clearAll();
        App.refresh();
      }
    });
  },

  // เปิดหน้าทุกครั้ง: ถ้ามีโปรไฟล์อยู่แล้ว (โหมดแก้ไข) เติมค่าลงช่อง ; ล้าง error เก่าทิ้ง
  onShow() {
    const p = MeowStore.getProfile() || {};
    document.getElementById('pf-name').value = p.name ?? '';
    document.getElementById('pf-age').value = p.age ?? '';
    document.getElementById('pf-weight').value = p.weight ?? '';
    document.getElementById('pf-diagnosis').value = p.diagnosis ?? '';
    document.getElementById('pf-target').value = p.dailyTarget ?? '';
    ['name', 'age', 'weight', 'diagnosis', 'target'].forEach(f => setFieldError(f, ''));
  }
});
