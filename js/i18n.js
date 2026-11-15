/* =====================================================================
   i18n.js – ระบบสองภาษา (English / ภาษาไทย) รองรับครบทุกหน้าของ v4 + Login + เกณฑ์สัตวแพทย์
   ===================================================================== */
const I18n = (() => {
  const translations = {
    th: {
      'Cat profile and settings': 'โปรไฟล์แมวและการตั้งค่า',
      'Alerts': 'การแจ้งเตือน',
      'Welcome to MeowMeal': 'ยินดีต้อนรับสู่ MeowMeal',
      "Add your cat's profile to start tracking recovery meals.": 'เพิ่มโปรไฟล์แมวเพื่อเริ่มติดตามมื้ออาหารช่วงพักฟื้น',
      'Add cat profile': 'เพิ่มโปรไฟล์แมว',
      'per day': 'ต่อวัน',
      'daily target': 'เป้าหมายต่อวัน',
      'Last 5 days': '5 วันล่าสุด',
      'Today: no meals logged yet': 'วันนี้: ยังไม่มีบันทึกมื้ออาหาร (พร้อมทดสอบถ่ายรูป/อัปโหลดรูป)',
      'Today: {eaten} g of {target} g ({pct}%) · {meals} meal logged': 'วันนี้: กินแล้ว {eaten} g จากเป้า {target} g ({pct}%) · บันทึกแล้ว {meals} มื้อ',
      'Today: {eaten} g of {target} g ({pct}%) · {meals} meals logged': 'วันนี้: กินแล้ว {eaten} g จากเป้า {target} g ({pct}%) · บันทึกแล้ว {meals} มื้อ',
      'Bars show the last 5 days as a share of the daily target. A day under the dashed line ({pct}%) counts as low.': 'กราฟแท่งแสดงสัดส่วนการกินเทียบเป้ารายวัน 5 วันล่าสุด วันที่มีค่าต่ำกว่าเส้นประ ({pct}%) นับว่ากินต่ำกว่าเกณฑ์',
      'Recovery trend': 'แนวโน้มการพักฟื้น (30 วัน)',
      'Last 30 days. Show this to your vet at the next visit.': 'สถิติการกินย้อนหลัง 30 วัน สำหรับแสดงให้สัตวแพทย์ดูในการนัดตรวจ',
      'No logs available': 'ยังไม่มีบันทึกข้อมูลมื้ออาหาร',
      '% of daily target': '% ของเป้าหมายรายวัน',
      'Low-intake threshold ({pct}%)': 'เกณฑ์กินต่ำผิดปกติ ({pct}%)',
      'Daily target (100%)': 'เป้าหมายรายวัน (100%)',
      'Log a meal': 'บันทึกมื้ออาหาร',
      'Log meal': 'บันทึกมื้ออาหาร',
      'Bowl photos': 'รูปถ่ายชามอาหาร',
      '(optional)': '(ไม่บังคับ)',
      'Photograph the bowl when you serve the food and again when your cat is done. We estimate how many grams were eaten.': 'ถ่ายหรือเลือกรูปชามอาหาร "ก่อนกิน" และ "หลังกิน" ระบบจะประเมินน้ำหนักอาหาร (กรัม) จากภาพถ่ายให้อัตโนมัติ',
      'Before meal': 'ก่อนกิน (Before)',
      'After meal': 'หลังกิน (After)',
      'No photo yet': 'ยังไม่มีรูปภาพ',
      'Take photo': 'ถ่ายรูป',
      'Retake photo': 'ถ่ายใหม่',
      'Choose photo': 'เลือกไฟล์รูป',
      'Cancel': 'ยกเลิก',
      'Quick test with dataset photos (S01–S16):': 'ทดสอบด่วนด้วยชุดข้อมูลภาพถ่ายจริง (S01–S16):',
      'Load S02 pair (56g → 11g left)': 'คู่ภาพ S02 (ก่อนกิน 56g → เหลือ 11g)',
      'Load S07 pair (62g → 16g left)': 'คู่ภาพ S07 (ก่อนกิน 62g → เหลือ 16g)',
      'Load S14 pair (95g → 23g left)': 'คู่ภาพ S14 (ก่อนกิน 95g → เหลือ 23g)',
      'Amount eaten': 'ปริมาณอาหารที่กิน (กรัม)',
      'Served (g)': 'ปริมาณที่ให้ / ก่อนกิน (กรัม)',
      'Left (g)': 'ปริมาณที่เหลือ / หลังกิน (กรัม)',
      'Quick pick: how much of the served food is left?': 'ปุ่มลัด: อาหารเหลือในชามกี่เปอร์เซ็นต์ของที่ให้?',
      'eaten this meal': 'ปริมาณที่กินในมื้อนี้',
      'Prescription diet': 'ประเภทอาหารตามใบสั่งแพทย์',
      'Recovery wet': 'อาหารเปียกสูตรพักฟื้น (Recovery wet)',
      'Renal diet': 'อาหารสูตรโรคไต (Renal diet)',
      'Gastrointestinal': 'อาหารสูตรทางเดินอาหาร (Gastrointestinal)',
      'Other': 'อื่น ๆ',
      'Served must be more than 0 g.': 'ปริมาณที่ให้ต้องมากกว่า 0 กรัม',
      'Left cannot be negative.': 'ปริมาณที่เหลือต้องไม่ติดลบ',
      "Left can't be more than served.": 'ปริมาณที่เหลือต้องไม่มากกว่าปริมาณที่ให้',
      'Enter the amount served first.': 'กรุณากรอกปริมาณอาหารที่ให้ (Served) ก่อนกดปุ่ม %',
      'Analyzing photo…': 'กำลังวิเคราะห์น้ำหนักอาหารจากภาพถ่าย…',
      'Add the before-meal photo too, or type the amounts below.': 'กรุณาเพิ่มรูป "ก่อนกิน" ด้วย หรือพิมพ์ตัวเลขด้านล่าง',
      'Before photo saved: about {grams} g served ({conf}% confidence). Take the after-meal photo when your cat is done.': 'บันทึกรูปก่อนกินแล้ว: ประเมินได้ประมาณ {grams} g (ความมั่นใจ {conf}%) กรุณาใส่รูปหลังกินเมื่อแมวกินเสร็จ',
      'Served about {served} g, left about {left} g, so your cat ate about {eaten} g ({conf}% confidence). Change the numbers below if needed, then tap Log meal.': 'ประเมินจากภาพ: ก่อนกิน {served} g, เหลือ {left} g → แมวกินไป {eaten} g (ความมั่นใจ {conf}%) สามารถแก้ไขตัวเลขด้านล่างแล้วกดบันทึกมื้ออาหารได้เลย',
      'A photo is too dark.': 'รูปภาพมืดเกินไป (ความมั่นใจต่ำกว่า 60%)',
      "We can't see food in the before photo.": 'ไม่พบอาหารในรูปก่อนกิน (ความมั่นใจต่ำกว่า 60%)',
      'The after photo shows more food than the before photo. Are they in the right order?': 'รูปหลังกินมีปริมาณอาหารมากกว่ารูปก่อนกิน กรุณาตรวจสอบลำดับรูปภาพ',
      'Retake it or type the amount served below.': 'กรุณาถ่ายใหม่หรือพิมพ์ตัวเลขด้านล่างด้วยตนเอง',
      'Retake it or type the amounts below.': 'กรุณาถ่ายใหม่หรือพิมพ์ตัวเลขด้านล่างด้วยตนเอง',
      "Couldn't read this image. Try another photo or type the amounts below.": 'ไม่สามารถอ่านไฟล์ภาพนี้ได้ กรุณาลองรูปอื่นหรือพิมพ์ตัวเลขด้านล่าง',
      'Extra snack': 'บันทึกขนมนอกมื้อ',
      "Snacks are saved separately. They don't count toward the daily target or the alert.": 'ขนมจะถูกบันทึกแยกต่างหาก (isOutlier = true) ไม่นำไปรวมกับเป้าหมายมื้อหลักหรือการแจ้งเตือน',
      'What did your cat get?': 'แมวได้รับขนมชนิดใด?',
      'Snack type': 'ประเภทขนม',
      'Treat': 'ขนมแมวเลีย / ขนมขบเคี้ยว',
      'Tuna or topper': 'ปลาทูน่า / ท็อปเปอร์',
      'Human food': 'อาหารคน',
      'Log snack': 'บันทึกขนม',
      'Today': 'รายการขนมวันนี้',
      'No snacks logged today': 'วันนี้ยังไม่มีบันทึกขนม',
      'An alert is created when intake stays below {pct}% of the daily target for {days} days in a row.': 'ระบบจะสร้างการแจ้งเตือนเมื่อแมวกินได้ต่ำกว่า {pct}% ของเป้าหมายรายวันติดต่อกัน {days} วัน',
      'Run daily check now (demo)': 'รันระบบตรวจสอบประจำวันทันที (สำหรับสาธิต)',
      'No alerts yet': 'ยังไม่มีรายการแจ้งเตือน',
      'Clinical Evaluation & Veterinary Criteria': 'ผลการประเมินทางคลินิกและเกณฑ์อ้างอิงสัตวแพทย์',
      'Clinical status: Normal recovery intake (>= 75% of daily target).': 'สถานะปกติ: แมวกินอาหารได้ตามเกณฑ์พักฟื้น (>= 75% ของเป้าหมายรายวัน)',
      'Sub-target intake (< 75%) for 1–2 days. Continue monitoring daily meals.': 'เฝ้าระวังเบื้องต้น: กินต่ำกว่าเกณฑ์ (< 75%) 1–2 วัน ควรติดตามมื้อถัดไปอย่างใกล้ชิด',
      'Early Warning (ISFM Guidelines): Intake < 75% of target for 3–4 consecutive days (Hyporexia). Monitor closely.': 'สัญญาณเตือนระยะแรก (ISFM Guidelines): กินต่ำกว่า 75% ติดต่อกัน 3–4 วัน (ภาวะเบื่ออาหาร Hyporexia)',
      'High Risk (Merck / Cornell): Severe hyporexia (< 50% target) for 3+ consecutive days increases hepatic lipidosis risk.': 'ความเสี่ยงสูง (Merck / Cornell): กินน้อยกว่า 50% ติดต่อกันเกิน 3 วัน เสี่ยงเกิดภาวะไขมันพอกตับ (Hepatic Lipidosis)',
      'Critical Alert (FR-3 / ISFM & WSAVA): Intake < 75% of daily target for 5+ consecutive days. High risk of clinical deterioration and hepatic lipidosis. Vet visit strongly recommended.': 'แจ้งเตือนระดับวิกฤต (FR-3 / ISFM & WSAVA): กินต่ำกว่า 75% ของเป้าหมายติดต่อกันครบ 5 วัน เสี่ยงภาวะแทรกซ้อนและไขมันพอกตับ แนะนำให้พบสัตวแพทย์ทันที',
      'Veterinary References (Evidence-based):': 'แหล่งอ้างอิงทางสัตวแพทยศาสตร์ (ใช้กำหนดเกณฑ์):',
      'Name': 'ชื่อแมว',
      'Cat profile': 'โปรไฟล์แมว',
      'Age (years)': 'อายุ (ปี)',
      'Weight (kg)': 'น้ำหนักตัว (กก.)',
      'Diagnosis context': 'การวินิจฉัย / บริบทการรักษา',
      'e.g. post-op recovery': 'เช่น พักฟื้นหลังผ่าตัด',
      'Daily food target (g per day)': 'เป้าหมายปริมาณอาหารต่อวัน (กรัม/วัน ตามแพทย์สั่ง)',
      'The total amount your vet prescribed for one day, across all meals. It is different for every cat.': 'ปริมาณอาหารเปียกรวมทั้งวันที่สัตวแพทย์สั่ง (เช่น 180 กรัม/วัน หรือ 60 กรัม/วัน ตามน้ำหนักตัวแมว)',
      'Save profile': 'บันทึกโปรไฟล์',
      'Settings': 'การตั้งค่าและบัญชีผู้ใช้',
      'Account': 'บัญชีผู้ดูแล (Caregiver Account)',
      'Switch / Login account': 'สลับบัญชี / เข้าสู่ระบบ',
      'Log out': 'ออกจากระบบ',
      'Sign in to MeowMeal': 'เข้าสู่ระบบ MeowMeal',
      'Track your cat recovery meals and share 30-day trends with your veterinarian.': 'ระบบติดตามมื้ออาหารแมวป่วยพักฟื้นและรายงานแนวโน้ม 30 วันสำหรับสัตวแพทย์',
      'Email address': 'อีเมล',
      'Caregiver name': 'ชื่อผู้ดูแล',
      'Password': 'รหัสผ่าน',
      'Sign in': 'เข้าสู่ระบบ',
      'Quick Demo Login (1-Click)': 'เข้าสู่ระบบบัญชีสาธิตทันที (1-Click Demo)',
      'Please enter a valid email and password.': 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน',
      'Language': 'ภาษา (Language)',
      'About': 'เกี่ยวกับระบบ',
      'MeowMeal is not a diagnostic tool and does not replace a veterinary exam. If your cat shows abnormal symptoms, please consult a veterinarian.': 'MeowMeal ไม่ใช่เครื่องมือวินิจฉัยโรคและไม่สามารถทดแทนการตรวจจากสัตวแพทย์ได้ หากแมวมีอาการผิดปกติ โปรดปรึกษาสัตวแพทย์',
      'Demo tools': 'เครื่องมือสำหรับสาธิตอาจารย์ (Demo Tools)',
      'Fills the app with 30 days of sample data. The last 5 completed days are below target (<75%), ready for live photo testing today.': 'โหลดข้อมูลจำลองย้อนหลัง 30 วัน (5 วันก่อนหน้ากินต่ำกว่าเกณฑ์ <75% และปล่อยว่าง "วันนี้" ไว้ให้คุณทดสอบใส่รูปก่อนกิน-หลังกินโชว์อาจารย์สด ๆ)',
      'Load 30-day sample data': 'โหลดข้อมูลตัวอย่าง 30 วัน (พร้อมพรีเซนต์)',
      "Reset today's meals only": 'ล้างเฉพาะมื้ออาหารของ "วันนี้" (ซ้อมพรีเซนต์ซ้ำ)',
      'Clear all data': 'ล้างข้อมูลทั้งหมด',
      'Main': 'เมนูหลัก',
      'Home': 'หน้าหลัก',
      'Trend': 'แนวโน้ม',
      'Snack': 'ขนม',
      'Alert': 'แจ้งเตือน',
      'Log a meal with a photo': 'บันทึกมื้ออาหารพร้อมรูปถ่าย',
      'Enter a name.': 'กรุณากรอกชื่อแมว',
      'Age must be greater than 0.': 'อายุต้องมากกว่า 0 ปี',
      'Weight must be greater than 0.': 'น้ำหนักต้องมากกว่า 0 กก.',
      'Enter the diagnosis or recovery context.': 'กรุณากรอกการวินิจฉัยหรืออาการ',
      'Enter the grams per day your vet prescribed.': 'กรุณากรอกปริมาณอาหารต่อวัน (กรัม) ตามที่สัตวแพทย์สั่ง',
      'That looks too high. Check that the amount is in grams per day.': 'ตัวเลขสูงผิดปกติ กรุณาตรวจสอบว่าเป็นหน่วยกรัมต่อวัน (เช่น 60–300 กรัม)',
      'Delete the profile, meal logs and alerts?': 'ต้องการลบโปรไฟล์ บันทึกมื้ออาหาร และการแจ้งเตือนทั้งหมดหรือไม่?',
      "Today's meals cleared. Ready for live demo!": 'ล้างข้อมูลมื้ออาหารของวันนี้แล้ว พร้อมสาธิตใส่รูปใหม่ได้เลย!',
      "Add your cat's profile first (cat icon, top left).": 'กรุณาเพิ่มโปรไฟล์แมวก่อน (แตะไอคอนแมวมุมซ้ายบน)',
      'Meal saved.': 'บันทึกมื้ออาหารเรียบร้อยแล้ว กำลังอัปเดตกราฟ…',
      'Snack saved.': 'บันทึกขนมเรียบร้อยแล้ว',
      'Could not save. Browser storage may be full.': 'บันทึกไม่สำเร็จ พื้นที่จัดเก็บของเบราว์เซอร์อาจเต็ม',
      'Add a cat profile first.': 'กรุณาเพิ่มโปรไฟล์แมวก่อน',
      'No alert. Low days in a row: {streak} of {days}.': 'ยังไม่มีแจ้งเตือนวิกฤต จำนวนวันที่กินต่ำกว่าเกณฑ์ (<75%) ติดต่อกัน: {streak} จาก {days} วัน',
      'Alert created.': 'ตรวจพบการกินต่ำกว่าเกณฑ์ครบ 5 วัน! สร้างการแจ้งเตือนแล้ว',
      '{streak} of {days} days low': 'กินต่ำกว่าเกณฑ์ {streak}/{days} วัน',
      '{name} has eaten less than {pct}% of the daily target for {days} days in a row. Please consider a vet visit.': '{name} กินอาหารได้น้อยกว่า {pct}% ของเป้าหมายรายวันติดต่อกัน {days} วัน เสี่ยงภาวะขาดสารอาหารและไขมันพอกตับ แนะนำให้พาไปพบสัตวแพทย์'
    }
  };

  const LANGUAGE_KEY = 'meowmeal_language';
  let language = localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'th'; // ค่าเริ่มต้นภาษาไทยเพื่อความสะดวกในการนำเสนอ (สลับ EN/TH ได้ทันที)
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
    if (!element) return;
    dynamicText.set(element, { key, values });
    element.dataset.i18nDynamic = '';
    element.textContent = t(key, values);
  }

  function setLanguage(value) {
    if (value !== 'en' && value !== 'th') return;
    language = value;
    localStorage.setItem(LANGUAGE_KEY, language);
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  return { t, apply, setText, setLanguage, get language() { return language; } };
})();
