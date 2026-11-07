const I18n = (() => {
  const translations = {
    th: {
      'Cat profile and settings': 'โปรไฟล์แมวและการตั้งค่า',
      Alerts: 'การแจ้งเตือน',
      "Welcome to MeowMeal": 'ยินดีต้อนรับสู่ MeowMeal',
      "Add your cat's profile to start tracking recovery meals.": 'เพิ่มโปรไฟล์แมวเพื่อเริ่มติดตามมื้ออาหารช่วงพักฟื้น',
      'Add cat profile': 'เพิ่มโปรไฟล์แมว',
      'daily target': 'เป้าหมายต่อวัน',
      'Last 5 days': '5 วันล่าสุด',
      'Bars show how much was eaten. The dashed line is the daily target.': 'แท่งแสดงปริมาณที่กิน เส้นประคือเป้าหมายต่อวัน',
      'Recovery trend': 'แนวโน้มการพักฟื้น',
      'Last 30 days. Show this to your vet at the next visit.': 'ข้อมูล 30 วันล่าสุด แสดงให้สัตวแพทย์ดูในการนัดครั้งถัดไป',
      'No logs available': 'ยังไม่มีบันทึก',
      'Log a meal': 'บันทึกมื้ออาหาร',
      'Log meal': 'บันทึกมื้ออาหาร',
      'Bowl photo': 'รูปถ้วยอาหาร',
      '(optional)': '(ไม่บังคับ)',
      'Take photo': 'ถ่ายรูป',
      'Choose photo': 'เลือกรูป',
      'Preview of the bowl photo': 'ตัวอย่างรูปถ้วยอาหาร',
      'Retake photo': 'ถ่ายใหม่',
      'Amount left in the bowl': 'ปริมาณอาหารที่เหลือในถ้วย',
      'Amount left': 'ปริมาณอาหารที่เหลือ',
      'Prescription diet': 'อาหารตามแผนการรักษา',
      'Recovery wet': 'อาหารเปียกช่วงพักฟื้น',
      'Renal diet': 'อาหารสูตรโรคไต',
      'Gastrointestinal': 'อาหารสูตรระบบทางเดินอาหาร',
      Other: 'อื่น ๆ',
      'Extra snack': 'ขนมเพิ่มเติม',
      "Snacks are saved separately. They don't count toward the daily target or the alert.": 'ขนมจะถูกบันทึกแยกต่างหาก ไม่นำไปรวมกับเป้าหมายต่อวันหรือการแจ้งเตือน',
      'What did your cat get?': 'แมวได้รับอะไร',
      'Snack type': 'ประเภทขนม',
      Treat: 'ขนมแมว',
      'Tuna or topper': 'ทูน่าหรือท็อปเปอร์',
      'Human food': 'อาหารคน',
      'Log snack': 'บันทึกขนม',
      Today: 'วันนี้',
      'No snacks logged today': 'วันนี้ยังไม่มีบันทึกขนม',
      'An alert is created when intake stays below target for 5 days in a row.': 'ระบบจะแจ้งเตือนเมื่อปริมาณที่กินต่ำกว่าเป้าหมายติดต่อกัน 5 วัน',
      'Run daily check now (demo)': 'ตรวจสอบประจำวัน (ตัวอย่าง)',
      'No alerts yet': 'ยังไม่มีการแจ้งเตือน',
      'Name': 'ชื่อ',
      'Cat profile': 'โปรไฟล์แมว',
      'Age (years)': 'อายุ (ปี)',
      'Weight (kg)': 'น้ำหนัก (กก.)',
      'Diagnosis context': 'การวินิจฉัยหรืออาการ',
      'e.g. post-op recovery': 'เช่น พักฟื้นหลังผ่าตัด',
      'Daily intake target (% of each meal)': 'เป้าหมายปริมาณที่กินต่อมื้อ (%)',
      'Prototype assumption: the share of the meal your vet wants eaten.': 'เป้าหมายเป็นสัดส่วนของอาหารที่สัตวแพทย์แนะนำให้กินต่อมื้อ',
      'Save profile': 'บันทึกโปรไฟล์',
      Settings: 'การตั้งค่า',
      Language: 'ภาษา',
      About: 'เกี่ยวกับ',
      'MeowMeal is not a diagnostic tool and does not replace a veterinary exam. If your cat shows abnormal symptoms, please consult a veterinarian.': 'MeowMeal ไม่ใช่เครื่องมือวินิจฉัยโรคและไม่สามารถทดแทนการตรวจจากสัตวแพทย์ได้ หากแมวมีอาการผิดปกติ โปรดปรึกษาสัตวแพทย์',
      'Demo tools': 'เครื่องมือสาธิต',
      'Fills the app with 30 days of sample data. The last 5 days are below target.': 'เพิ่มข้อมูลตัวอย่างย้อนหลัง 30 วัน โดย 5 วันล่าสุดมีปริมาณที่กินต่ำกว่าเป้าหมาย',
      'Load sample data': 'โหลดข้อมูลตัวอย่าง',
      'Clear all data': 'ล้างข้อมูลทั้งหมด',
      Main: 'เมนูหลัก',
      Home: 'หน้าหลัก',
      Trend: 'แนวโน้ม',
      Snack: 'ขนม',
      Alert: 'แจ้งเตือน',
      'Log a meal with a photo': 'บันทึกมื้ออาหารพร้อมรูปถ่าย',
      'Enter a name.': 'กรุณากรอกชื่อ',
      'Age must be greater than 0.': 'อายุต้องมากกว่า 0',
      'Weight must be greater than 0.': 'น้ำหนักต้องมากกว่า 0',
      'Enter the diagnosis or recovery context.': 'กรุณากรอกการวินิจฉัยหรืออาการ',
      'Target must be greater than 0.': 'เป้าหมายต้องมากกว่า 0',
      'Target cannot be more than 100%.': 'เป้าหมายต้องไม่เกิน 100%',
      'Delete the profile, meal logs and alerts?': 'ลบโปรไฟล์ บันทึกมื้ออาหาร และการแจ้งเตือนทั้งหมดหรือไม่',
      "Add your cat's profile first (cat icon, top left).": 'กรุณาเพิ่มโปรไฟล์แมวก่อน (แตะไอคอนแมวมุมซ้ายบน)',
      'Meal saved.': 'บันทึกมื้ออาหารแล้ว',
      'Snack saved.': 'บันทึกขนมแล้ว',
      'Could not save. Browser storage may be full.': 'บันทึกไม่สำเร็จ พื้นที่จัดเก็บของเบราว์เซอร์อาจเต็ม',
      'Add a cat profile first.': 'กรุณาเพิ่มโปรไฟล์แมวก่อน',
      'No alert. Days below target in a row: {streak} of {days}.': 'ยังไม่มีการแจ้งเตือน กินต่ำกว่าเป้าหมายติดต่อกัน {streak} จาก {days} วัน',
      'Alert created.': 'สร้างการแจ้งเตือนแล้ว',
      '{streak} of {days} days below target': 'กินต่ำกว่าเป้าหมาย {streak} จาก {days} วัน',
      'Eaten (%)': 'ปริมาณที่กิน (%)',
      'Target (%)': 'เป้าหมาย (%)',
      '% eaten': 'ปริมาณที่กิน (%)',
      '{name} has eaten less than the target for {days} days in a row. Please consider a vet visit.': '{name} กินได้น้อยกว่าเป้าหมายติดต่อกัน {days} วัน โปรดพิจารณาพาไปพบสัตวแพทย์'
    }
  };

  const LANGUAGE_KEY = 'meowmeal_language';
  let language = localStorage.getItem(LANGUAGE_KEY) === 'th' ? 'th' : 'en';
  const dynamicText = new WeakMap();

  function t(text, values = {}) {
    let translated = translations[language]?.[text] || text;
    Object.entries(values).forEach(([key, value]) => {
      translated = translated.replaceAll('{' + key + '}', value);
    });
    return translated;
  }

  function apply() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      element.alt = t(element.dataset.i18nAlt);
    });
    document.querySelectorAll('[data-i18n-dynamic]').forEach(element => {
      const translation = dynamicText.get(element);
      if (translation) element.textContent = t(translation.key, translation.values);
    });
    const selector = document.getElementById('set-lang');
    if (selector) selector.value = language;
  }

  function setText(element, key, values = {}) {
    dynamicText.set(element, { key, values });
    element.dataset.i18nDynamic = '';
    element.textContent = t(key, values);
  }

  function setLanguage(value) {
    if (value !== 'en' && value !== 'th') {
      throw new Error('Unsupported language: ' + value);
    }
    language = value;
    localStorage.setItem(LANGUAGE_KEY, language);
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  return { t, apply, setText, setLanguage, get language() { return language; } };
})();
