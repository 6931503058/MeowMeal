/* =====================================================================
   i18n.js – ระบบสองภาษา (English / ภาษาไทย) รองรับแดชบอร์ด 30 วันรูปแบบใหม่และเกณฑ์วิจัยสัตวแพทย์
   ===================================================================== */
const I18n = (() => {
  const translations = {
    th: {
      'Cat profile and settings': 'โปรไฟล์แมวและการตั้งค่า',
      'Alerts': 'การประเมินและแจ้งเตือนทางคลินิก',
      'Welcome to MeowMeal': 'ยินดีต้อนรับสู่ MeowMeal',
      "Add your cat's profile to start tracking recovery meals.": 'เพิ่มโปรไฟล์แมวเพื่อเริ่มติดตามมื้ออาหารช่วงพักฟื้น',
      'Add cat profile': 'เพิ่มโปรไฟล์แมว',
      'per day': 'ต่อวัน',
      'daily target': 'เป้าหมายต่อวัน',
      'Last 5 days': 'ติดตามสถานะ 5 วันล่าสุด',
      'Today: no meals logged yet': 'วันนี้: ยังไม่มีบันทึกมื้ออาหาร (พร้อมทดสอบถ่ายรูป/อัปโหลดรูป)',
      'Today: {eaten} g of {target} g ({pct}%) · {meals} meal logged': 'วันนี้: กินแล้ว {eaten} g จากเป้า {target} g ({pct}%) · บันทึกแล้ว {meals} มื้อ',
      'Today: {eaten} g of {target} g ({pct}%) · {meals} meals logged': 'วันนี้: กินแล้ว {eaten} g จากเป้า {target} g ({pct}%) · บันทึกแล้ว {meals} มื้อ',
      'Bars show the last 5 days as a share of the daily target. A day under the dashed line ({pct}%) counts as low.': 'กราฟแท่งแสดงสัดส่วนการกินเทียบเป้ารายวัน 5 วันล่าสุด วันที่มีค่าต่ำกว่าเส้นประ ({pct}% RER ตามเกณฑ์ ISFM 2022) นับว่ากินต่ำกว่าเกณฑ์',
      'Recovery trend': 'แดชบอร์ดแนวโน้มการพักฟื้น (30 วัน)',
      'Last 30 days. Show this to your vet at the next visit.': 'วิเคราะห์แนวโน้มการกินอาหารและระดับความเสี่ยงทางคลินิกย้อนหลังสำหรับสัตวแพทย์',
      'No logs available': 'ยังไม่มีบันทึกข้อมูลมื้ออาหาร',
      'Avg Daily Intake': 'ปริมาณที่กินเฉลี่ยต่อวัน',
      'Target: {target} g/d': 'เป้าหมายแพทย์สั่ง: {target} g/วัน',
      'Target Compliance': 'วันที่ผ่านเกณฑ์ปกติ',
      'Days >= 80% RER (ISFM)': 'เกณฑ์ ISFM (>= 80% RER)',
      'Hyporexia Days (<80%)': 'วันที่กินต่ำกว่าเกณฑ์ (<80%)',
      'Severe (<50%): {severe} days': 'ระดับรุนแรง (<50%): {severe} วัน',
      'Recent 5-Day Trend': 'แนวโน้ม 5 วันล่าสุด',
      'Declining intake': 'แนวโน้มลดลง (ควรเฝ้าระวัง)',
      'Improving recovery': 'แนวโน้มดีขึ้น',
      'Stable trend': 'แนวโน้มคงที่',
      'days': 'วัน',
      '7 Days': '7 วัน',
      '14 Days': '14 วัน',
      '30 Days': '30 วัน',
      '% of Target': '% เทียบเป้า',
      'Grams (g)': 'กรัม (g)',
      'Normal (>=80%)': 'ปกติ (>=80%)',
      'Hyporexia (50–79%)': 'เบื่ออาหาร (50–79%)',
      'Severe (<50%)': 'รุนแรง (<50%)',
      'Anorexia (<25%)': 'อดอาหารวิกฤต (<25%)',
      'Daily intake (% of target)': 'ปริมาณที่กินรายวัน (% ของเป้าหมาย)',
      'Daily intake (g)': 'ปริมาณที่กินรายวัน (กรัม)',
      '3-Day Moving Avg': 'เส้นแนวโน้มเฉลี่ย 3 วัน (3-Day Moving Avg)',
      'ISFM Hyporexia Threshold (80%)': 'เกณฑ์เริ่มภาวะเบื่ออาหาร ISFM (80%)',
      'Severe / Lipidosis Risk (50%)': 'เกณฑ์เสี่ยงไขมันพอกตับรุนแรง (50%)',
      '% of daily target': '% ของเป้าหมายรายวัน',
      'Grams eaten (g)': 'ปริมาณอาหารที่กินจริง (กรัม)',
      'Eaten: {g} g / {t} g ({p}%)': 'กินได้จริง: {g} g จากเป้า {t} g ({p}%)',
      'Meals logged: {m}': 'จำนวนมื้อที่บันทึก: {m} มื้อ',
      'Clinical zone: ': 'โซนทางคลินิก: ',
      'Recent Daily Clinical Breakdown': 'ตารางสรุปผลการกินและสถานะทางคลินิกรายวัน (10 วันล่าสุด)',
      'Date': 'วันที่',
      'Intake (g)': 'ปริมาณที่กิน',
      '% RER': '% เป้า',
      'Clinical Status': 'สถานะทางคลินิก',
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
      'Load S07 pair (62g → 16g left)': 'คู่ภาพ S07 (ก่อนกิน 62g → 16g left)',
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
      'Evidence-based alert triggers when intake is < 80% RER for >= 3 consecutive days (ISFM 2022 / WSAVA), < 50% for >= 2 days (Merck), or < 25% for >= 1 day (Cornell).': 'ประเมินตามงานวิจัยสัตวแพทย์: แจ้งเตือนเมื่อกินต่ำกว่า 80% ของเป้าติดต่อกัน >= 3 วัน (ISFM 2022 / WSAVA), ต่ำกว่า 50% ติดต่อกัน >= 2 วัน (Merck) หรือต่ำกว่า 25% ตั้งแต่ 1 วัน (Cornell)',
      'Run daily check now (demo)': 'รันระบบประเมินความผิดปกติตามเกณฑ์วิจัยสัตวแพทย์ (สาธิต)',
      'No alerts yet': 'ยังไม่มีประวัติการแจ้งเตือน',
      'Clinical Evaluation & Veterinary Criteria': 'ผลการประเมินทางคลินิกและเกณฑ์วิจัยสัตวแพทย์ (4-Tier Matrix)',
      'Tier 0: Normal Recovery Intake (>= 80% Target)': 'ระดับ 0 (ปกติ): กินอาหารผ่านเกณฑ์มาตรฐาน (>= 80% ของเป้าหมาย)',
      'Tier 1: Suboptimal Intake Watch (1–2 Days < 80%)': 'ระดับ 1 (เฝ้าระวัง): กินต่ำกว่า 80% ของเป้าหมาย 1–2 วันแรก',
      'Tier 2: Clinical Hyporexia Alert (< 80% for 3+ Days)': 'ระดับ 2 (แจ้งเตือนพบสัตวแพทย์): ภาวะเบื่ออาหารทางคลินิก (< 80% ติดต่อกัน >= 3 วัน)',
      'Tier 3: Severe Hyporexia / Hepatic Lipidosis Risk': 'ระดับ 3 (วิกฤต): ภาวะเบื่ออาหารรุนแรง เสี่ยงไขมันพอกตับ (< 50% ติดต่อกัน >= 2 วัน)',
      'Tier 3: Acute Anorexia Emergency (< 25% Target)': 'ระดับ 3 (ฉุกเฉิน): ภาวะอดอาหารเฉียบพลัน (< 25% ของเป้าหมาย ภายใน 24 ชม.)',
      'Clinical status: Normal recovery intake (>= 80% of daily target per ISFM 2022 guidelines).': 'สถานะปกติ (ISFM 2022): แมวกินอาหารได้ตั้งแต่ 80% ของเป้าหมายรายวันขึ้นไป ได้รับพลังงานเพียงพอต่อการฟื้นฟูร่างกาย',
      'Early Watch (ISFM 2022): Intake < 80% of target for 1–2 days. Check for pain, nausea, or food stress and monitor the next meal closely.': 'เฝ้าระวังระยะเริ่มต้น (ISFM 2022): กินต่ำกว่า 80% ของเป้าหมาย 1–2 วัน ควรสังเกตอาการปวดแผล คลื่นไส้ หรือความเครียด และติดตามมื้อถัดไปอย่างใกล้ชิด',
      'Veterinary Alert (ISFM 2022 & WSAVA Guidelines): Intake < 80% of daily target for 3+ consecutive days. Indicates clinically significant hyporexia requiring medical assessment and nutritional intervention.': 'แจ้งเตือนพบสัตวแพทย์ (ISFM 2022 & WSAVA): แมวกินได้ต่ำกว่า 80% ของเป้าหมายติดต่อกันตั้งแต่ 3 วันขึ้นไป เข้าเกณฑ์ภาวะ Hyporexia ที่มีนัยสำคัญทางคลินิก ต้องได้รับการประเมินและโภชนบำบัด',
      'Critical Alert (Merck Veterinary Manual & ISFM 2022): Severe hyporexia (< 50% target for 2+ days or < 80% for 5+ days). High risk of Feline Hepatic Lipidosis and lean mass catabolism. Consult a veterinarian urgently.': 'แจ้งเตือนระดับวิกฤต (Merck & ISFM 2022): แมวกินน้อยกว่า 50% ของเป้าหมายติดต่อกันตั้งแต่ 2 วันขึ้นไป (หรือ < 80% นาน 5 วัน) มีความเสี่ยงสูงต่อภาวะไขมันพอกตับเฉียบพลัน (Hepatic Lipidosis) และการสลายมวลกล้ามเนื้อ ควรพบสัตวแพทย์โดยด่วน',
      'Emergency Alert (Cornell Feline Health Center): Near-complete anorexia (< 25% intake) for 24+ hours. High risk of acute hepatic lipidosis and dehydration. Immediate veterinary care required.': 'แจ้งเตือนฉุกเฉิน (Cornell Feline Health Center): แมวหยุดกินอาหารหรือกินได้น้อยกว่า 25% ของเป้าหมายใน 24 ชั่วโมง เสี่ยงเกิดภาวะไขมันพอกตับเฉียบพลันและขาดน้ำ ต้องพบสัตวแพทย์ทันที',
      'No clinical alert triggered yet. Consecutive days < 80% RER: {streak} of {days} days (ISFM/WSAVA threshold).': 'ยังไม่เข้าเกณฑ์แจ้งเตือนพบสัตวแพทย์ (จำนวนวันที่กินต่ำกว่า 80% RER ติดต่อกัน: {streak} จากเกณฑ์ {days} วันตาม ISFM/WSAVA)',
      'Clinical alert created based on veterinary guidelines.': 'สร้างการแจ้งเตือนตามเกณฑ์วิจัยสัตวแพทย์เรียบร้อยแล้ว!',
      '{streak} of {days} days low': 'ต่ำกว่าเกณฑ์ (<80%) {streak}/{days} วัน',
      'Veterinary Research Criteria Matrix:': 'ตารางเกณฑ์ตัดสินความผิดปกติจากงานวิจัยสัตวแพทย์:',
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
      'Fills the app with 30 days of sample data. The last 4 completed days show progressive clinical hyporexia (73% → 65% → 47% → 37%), ready for live photo testing today.': 'โหลดข้อมูลจำลองย้อนหลัง 30 วัน โดย 4 วันก่อนหน้าแสดงการลดลงของอาหารตามระยะคลินิก (73% → 65% → 47% → 37%) และเว้นว่าง "วันนี้" ไว้ให้ทดสอบใส่รูปก่อนกิน-หลังกินโชว์อาจารย์สด ๆ',
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
      'ref_tier1': '<strong>Tier 1 – Suboptimal Intake Watch (< 80% RER เป็นเวลา 1–2 วัน):</strong> เฝ้าระวังอาการปวดแผล คลื่นไส้ หรือความเครียดจากสิ่งแวดล้อม <em>(ISFM Consensus Guidelines, 2022)</em>',
      'ref_tier2': '<strong>Tier 2 – Clinical Hyporexia Alert (< 80% RER ติดต่อกัน ≥ 3 วัน):</strong> เข้าเกณฑ์ข้อบ่งชี้ทางการแพทย์ที่ต้องได้รับการประเมินและเริ่มโภชนบำบัด (Nutritional Intervention) เพื่อป้องกันการสลายมวลกล้ามเนื้อและแผลหายช้า <em>(Taylor et al., 2022 ISFM Consensus Guidelines, JFMS; WSAVA Global Nutrition Guidelines)</em>',
      'ref_tier3': '<strong>Tier 3 – Severe Hyporexia & Acute Anorexia (< 50% ติดต่อกัน ≥ 2 วัน หรือ < 25% ภายใน 24 ชม.):</strong> ภาวะวิกฤตที่ร่างกายแมวสลายไขมันส่วนเกินไปสะสมที่ตับอย่างรวดเร็ว เสี่ยงเกิด <strong>โรคไขมันพอกตับเฉียบพลันในแมว (Feline Hepatic Lipidosis)</strong> ต้องพบสัตวแพทย์ทันที <em>(Cornell Feline Health Center & Merck Veterinary Manual, 2025)</em>'
    }
  };

  const LANGUAGE_KEY = 'meowmeal_language';
  let language = localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'th';
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
      // Use innerHTML for reference list items to preserve bold/italic tags
      if (element.dataset.i18n.startsWith('ref_')) {
          element.innerHTML = t(element.dataset.i18n);
      } else {
          element.textContent = t(element.dataset.i18n);
      }
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
