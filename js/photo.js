/* =====================================================================
   photo.js – ส่วนถ่ายรูป/เลือกรูป ในหน้า Log a meal (FR-5)   [Korawit]

   Flow ตามภาพร่าง: กดถ่าย/เลือกรูป → (ถ่ายใหม่ได้) → ได้ % ที่แนะนำ → กด Log meal

   Acceptance criteria FR-5:
     AC#1: อัปโหลดรูป → วิเคราะห์เสร็จใน 3 วินาที → โชว์ % ที่แนะนำ "แก้ได้" และต้องกดยืนยันเอง
           (เราเลือกปุ่ม % ให้ แต่ไม่บันทึกอัตโนมัติ ต้องกด Log meal)
     AC#2: confidence < 60% → ขอให้เลือก % เองด้วยปุ่ม 5 ระดับ

   ⚠ estimateFromPhoto() ด้านล่างเป็น "ตัวจำลอง (MOCK)" ยังไม่ได้เรียก Vision API จริง
     เพื่อให้ทดสอบ flow ครบได้ก่อน ตอนต่อ API จริง ให้แก้เฉพาะฟังก์ชันนี้ฟังก์ชันเดียว
     (SRS: เรียก API 1 ครั้งต่อ 1 รูป, ไม่เทรนโมเดลเอง)
   ===================================================================== */

const PHOTO_MIN_CONFIDENCE = 0.6;            // ต่ำกว่านี้ → ให้เลือกเอง
let photoUrl = null;                         // URL ชั่วคราวของรูปที่แสดง (ต้อง revoke เมื่อเลิกใช้)

/* MOCK: อ่านรูปย่อเหลือ 32x32 พิกเซล แล้วดูความสว่างเฉลี่ย
   - ภาพมืดมาก (< 40 จาก 255) → ถือว่าไม่แน่ใจ (confidence ต่ำ) ตรงกับตัวอย่าง "ภาพมืด" ใน SRS
   - นอกนั้น → ได้ % แบบสมมติจากความสว่าง (ไม่ใช่การวิเคราะห์อาหารจริง!)
   คืนค่า Promise<{ percent, confidence }> */
function estimateFromPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 32, 32);
      const px = ctx.getImageData(0, 0, 32, 32).data;      // [r,g,b,a, r,g,b,a, ...]
      let sum = 0;
      for (let i = 0; i < px.length; i += 4) sum += (px[i] + px[i + 1] + px[i + 2]) / 3;
      const brightness = sum / (px.length / 4);            // 0..255
      URL.revokeObjectURL(url);

      const options = [0, 25, 50, 75, 100];                // ต้องปัดเป็นหนึ่งในปุ่ม 5 ระดับ
      const guess = (brightness / 255) * 100;
      const percent = options.reduce((a, b) => Math.abs(b - guess) < Math.abs(a - guess) ? b : a);
      resolve({ percent, confidence: brightness < 40 ? 0.3 : 0.85 });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')); };
    img.src = url;
  });
}

// ล้างส่วนรูปทั้งหมด
function resetPhotoSection() {
  if (photoUrl) { URL.revokeObjectURL(photoUrl); photoUrl = null; }
  const preview = document.getElementById('photo-preview');
  preview.hidden = true;
  preview.removeAttribute('src');
  document.getElementById('photo-status').hidden = true;
  document.getElementById('photo-retake').hidden = true;
  document.getElementById('photo-camera').value = '';      // ล้างค่า เพื่อให้เลือกไฟล์เดิมซ้ำแล้ว event ยังเกิด
  document.getElementById('photo-gallery').value = '';
}

// จัดการไฟล์ที่ผู้ใช้เลือก/ถ่าย
async function handlePhoto(file) {
  if (!file) return;
  const status = document.getElementById('photo-status');
  const preview = document.getElementById('photo-preview');

  // แสดงรูปตัวอย่าง
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  preview.src = photoUrl;
  preview.hidden = false;
  document.getElementById('photo-retake').hidden = false;

  status.hidden = false;
  status.className = 'status';
  status.textContent = 'Analyzing photo…';
  LogMeal.setPct(null);                                    // ล้างค่าที่เลือกไว้ก่อน (ถ้ามี)

  try {
    const result = await estimateFromPhoto(file);
    if (result.confidence >= PHOTO_MIN_CONFIDENCE) {
      // AC#1: เลือกปุ่มให้ตามที่แนะนำ แต่ผู้ใช้เปลี่ยนเองได้ และต้องกด Log meal เอง
      LogMeal.setPct(result.percent);
      status.className = 'status ok';
      status.textContent = 'Suggested: ' + result.percent + '% left. Change it below if it looks wrong, then tap Log meal.';
    } else {
      // AC#2: ไม่มั่นใจ → ไม่เลือกให้ ขอให้เลือกเอง
      status.className = 'status bad';
      status.textContent = "The photo is unclear (confidence " + Math.round(result.confidence * 100) +
                           "%). Please pick the amount left below.";
    }
  } catch (e) {
    status.className = 'status bad';
    status.textContent = "Couldn't read this image. Retake it or pick the amount below.";
  }
}

App.register('log', {

  init() {
    const camera = document.getElementById('photo-camera');
    const gallery = document.getElementById('photo-gallery');

    // ปุ่มด้านหน้าแค่สั่ง "คลิก" input ไฟล์ที่ซ่อนอยู่
    document.getElementById('photo-take').addEventListener('click', () => camera.click());
    document.getElementById('photo-pick').addEventListener('click', () => gallery.click());
    document.getElementById('photo-retake').addEventListener('click', () => camera.click());

    // เมื่อเลือกไฟล์เสร็จ (event 'change') → ส่งให้ handlePhoto
    camera.addEventListener('change', () => handlePhoto(camera.files[0]));
    gallery.addEventListener('change', () => handlePhoto(gallery.files[0]));
  },

  onShow() {
    resetPhotoSection();                                   // เปิดหน้าใหม่ทุกครั้ง เริ่มสะอาด
  }
});
//รอทำหลังจากที่ทำ ml_experiment เสร็จ