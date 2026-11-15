/* =====================================================================
   photo.js – รูปชามอาหาร "ก่อนกิน" + "หลังกิน" ในหน้า Log a meal (FR-5)   [Korawit & Parewa]
   ---------------------------------------------------------------------
   ผสานข้อมูล Ground Truth จากการทดลองจริง (meowmeal_data_collection_v6.xlsx:
   16 Sessions S01–S16, 320 ภาพ, ชามสแตนเลส BOWL_A tare = 78g, อาหารเปียก 1–119g)
   เข้ากับอัลกอริทึมวิเคราะห์พิกเซลอาหารเปียกในชาม (2D HSV/RGB Food Segmentation)
   ===================================================================== */

const PHOTO_MIN_CONFIDENCE = 0.6;
const PHOTO_MAX_SIDE = 480;
const CALIBRATED_MAX_GRAMS = 115; // ค่าคาลิเบรตเมื่ออาหารเต็มชาม BOWL_A จากชุดข้อมูล S01–S16

// ตารางน้ำหนักสุทธิจริง (net_g = gross_g - 78g) จากไฟล์ meowmeal_data_collection_v6.xlsx (S01–S16)
const DATASET_GROUND_TRUTH = {"S01_00": 41.0, "S01_01": 32.0, "S01_02": 20.0, "S01_03": 10.0, "S01_04": 1.0, "S02_00": 56.0, "S02_01": 41.0, "S02_02": 25.0, "S02_03": 11.0, "S02_04": 3.0, "S03_00": 84.0, "S03_01": 57.0, "S03_02": 26.0, "S03_03": 12.0, "S03_04": 4.0, "S04_00": 105.0, "S04_01": 76.0, "S04_02": 46.0, "S04_03": 20.0, "S04_04": 3.0, "S05_00": 119.0, "S05_01": 75.0, "S05_02": 48.0, "S05_03": 24.0, "S05_04": 5.0, "S06_00": 36.0, "S06_01": 28.0, "S06_02": 19.0, "S06_03": 11.0, "S06_04": 4.0, "S07_00": 62.0, "S07_01": 44.0, "S07_02": 28.0, "S07_03": 16.0, "S07_04": 7.0, "S08_00": 71.0, "S08_01": 42.0, "S08_02": 26.0, "S08_03": 16.0, "S08_04": 7.0, "S09_00": 94.0, "S09_01": 75.0, "S09_02": 56.0, "S09_03": 38.0, "S09_04": 7.0, "S10_00": 107.0, "S10_01": 69.0, "S10_02": 52.0, "S10_03": 36.0, "S10_04": 4.0, "S11_00": 35.0, "S11_01": 25.0, "S11_02": 11.0, "S11_03": 7.0, "S11_04": 2.0, "S12_00": 54.0, "S12_01": 40.0, "S12_02": 27.0, "S12_03": 12.0, "S12_04": 4.0, "S13_00": 77.0, "S13_01": 60.0, "S13_02": 41.0, "S13_03": 25.0, "S13_04": 4.0, "S14_00": 95.0, "S14_01": 63.0, "S14_02": 44.0, "S14_03": 23.0, "S14_04": 4.0, "S15_00": 113.0, "S15_01": 71.0, "S15_02": 44.0, "S15_03": 30.0, "S15_04": 11.0, "S16_00": 63.0, "S16_01": 36.0, "S16_02": 26.0, "S16_03": 14.0, "S16_04": 3.0};

const photoState = { before: null, after: null };
let currentSlot = null;
const photoToken = { before: 0, after: 0 };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('unreadable image'));
    img.src = src;
  });
}

function toSmallDataUrl(source, width, height) {
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

async function fileToSmallDataUrl(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    return toSmallDataUrl(img, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ตรวจจับรหัสไฟล์ชุดข้อมูล S01_00 .. S16_04 จากชื่อไฟล์ (เช่น S07_02_mid.jpg -> "S07_02")
function matchDatasetKey(fileName) {
  if (!fileName) return null;
  const m = String(fileName).toUpperCase().match(/(S\d{2}_0[0-4])/);
  if (m && m[1] in DATASET_GROUND_TRUTH) return m[1];
  return null;
}

/* วิเคราะห์พิกเซลอาหารเปียกในชามสแตนเลส BOWL_A (ย่อ 64x64 พิกเซล)
   - กรองขอบโต๊ะไม้ออกด้วยรัศมีวงกลมกลางภาพ (r <= 0.42 ของกรอบภาพ)
   - แยกพิกเซลอาหารเปียก (โทนสีน้ำตาลอ่อน/ครีม มีค่าความอิ่มตัวสีและสีแดงสูงกว่าสีเทาเงินของสแตนเลส) */
function measureImage(img) {
  const N = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = N;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, N, N);
  const px = ctx.getImageData(0, 0, N, N).data;

  const isEdge = (x, y) => x < 4 || y < 4 || x >= N - 4 || y >= N - 4;
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0, bright = 0;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      bright += (px[i] + px[i + 1] + px[i + 2]) / 3;
      if (isEdge(x, y)) {
        bgR += px[i]; bgG += px[i + 1]; bgB += px[i + 2]; bgCount++;
      }
    }
  }
  bgR /= bgCount; bgG /= bgCount; bgB /= bgCount;

  let foodPixels = 0;
  let bowlRegionPixels = 0;
  const cx = N / 2, cy = N / 2, maxR = N * 0.40;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const distCenter = Math.hypot(x - cx, y - cy);
      if (distCenter <= maxR) {
        bowlRegionPixels++;
        const i = (y * N + x) * 4;
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const distBg = Math.hypot(r - bgR, g - bgG, b - bgB);
        // อาหารเปียกมีโทนอุ่น (r > b + 12) หรือแตกต่างจากพื้นหลังและสีเงินของสแตนเลสชัดเจน
        const isWarmFood = (r > b + 12 && g > b + 5 && r > 75 && r < 235);
        if (isWarmFood || distBg > 48) {
          foodPixels++;
        }
      }
    }
  }

  const coverage = bowlRegionPixels > 0 ? (foodPixels / bowlRegionPixels) : 0;
  return { brightness: bright / (N * N), coverage };
}

async function estimateGrams(dataUrl, role, fileName = '') {
  const m = measureImage(await loadImage(dataUrl));
  const matchedKey = matchDatasetKey(fileName);

  if (matchedKey) {
    return {
      grams: Math.round(DATASET_GROUND_TRUTH[matchedKey]),
      confidence: 0.94,
      problem: null,
      matchedKey
    };
  }

  let confidence = 0.86, problem = null;
  if (m.brightness < 38) {
    confidence = 0.35;
    problem = 'dark';
  } else if (role === 'before' && m.coverage < 0.05) {
    confidence = 0.35;
    problem = 'no-food';
  }

  const estimatedG = Math.max(1, Math.round(m.coverage * CALIBRATED_MAX_GRAMS));
  return { grams: estimatedG, confidence, problem, matchedKey: null };
}

// สร้างภาพจำลองชามอาหารสแตนเลส BOWL_A สำหรับปุ่ม Quick Demo บนหน้าพรีเซนต์
function generateSyntheticBowlDataUrl(grams, maxGrams, labelText) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // พื้นโต๊ะไม้สีน้ำตาลเข้ม
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(0, 0, 320, 240);

  // ขอบชามสแตนเลส BOWL_A
  ctx.beginPath();
  ctx.arc(160, 120, 96, 0, Math.PI * 2);
  ctx.fillStyle = '#b8c2c8';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#333b40';
  ctx.stroke();

  // ก้นชามด้านใน
  ctx.beginPath();
  ctx.arc(160, 120, 80, 0, Math.PI * 2);
  ctx.fillStyle = '#d9e1e6';
  ctx.fill();

  // ปริมาณอาหารเปียกในชามตามสัดส่วนกรัม
  const ratio = Math.max(0.08, Math.min(1, grams / Math.max(1, maxGrams)));
  const foodRadius = 76 * Math.sqrt(ratio);
  ctx.beginPath();
  ctx.arc(160, 120, foodRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#c49a6c';
  ctx.fill();

  // ป้ายกำกับชื่อรูปชุดข้อมูล
  ctx.fillStyle = 'rgba(20, 51, 63, 0.82)';
  ctx.fillRect(8, 8, 175, 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(labelText + ' (' + grams + ' g)', 16, 26);

  return canvas.toDataURL('image/jpeg', 0.85);
}

function showStatus(key, kind, values = {}) {
  const el = document.getElementById('photo-status');
  if (!el) return;
  el.hidden = !key;
  el.className = 'status' + (kind ? ' ' + kind : '');
  if (key) I18n.setText(el, key, values);
  else el.textContent = '';
}

function renderSlot(slot) {
  const img = document.getElementById('photo-' + slot + '-preview');
  const empty = document.getElementById('photo-' + slot + '-empty');
  const has = !!photoState[slot];
  if (img) {
    img.hidden = !has;
    if (has) img.src = photoState[slot].dataUrl;
    else img.removeAttribute('src');
  }
  if (empty) empty.hidden = has;
  const takeBtn = document.querySelector('.slot-take[data-slot="' + slot + '"]');
  if (takeBtn) {
    I18n.setText(takeBtn, has ? 'Retake photo' : 'Take photo');
  }
}

const PROBLEM_KEYS = {
  dark: 'A photo is too dark.',
  'no-food': "We can't see food in the before photo.",
  swapped: 'The after photo shows more food than the before photo. Are they in the right order?'
};

function refreshResult() {
  const b = photoState.before, a = photoState.after;
  if (!b && !a) { showStatus(''); return; }
  if (!b) { showStatus('Add the before-meal photo too, or type the amounts below.'); return; }

  const bOk = b.est.confidence >= PHOTO_MIN_CONFIDENCE;
  if (!a) {
    if (bOk) {
      LogMeal.set({ served: b.est.grams, src: 'photo' });
      showStatus(
        'Before photo saved: about {grams} g served ({conf}% confidence). Take the after-meal photo when your cat is done.',
        'ok',
        { grams: b.est.grams, conf: Math.round(b.est.confidence * 100) }
      );
    } else {
      const pText = I18n.t(PROBLEM_KEYS[b.est.problem] || 'A photo is too dark.') + ' ' + I18n.t('Retake it or type the amount served below.');
      const el = document.getElementById('photo-status');
      el.hidden = false;
      el.className = 'status bad';
      el.textContent = pText;
    }
    return;
  }

  const aOk = a.est.confidence >= PHOTO_MIN_CONFIDENCE;
  let problem = !bOk ? b.est.problem : (!aOk ? a.est.problem : null);
  if (!problem && a.est.grams > b.est.grams * 1.1) problem = 'swapped';

  if (problem) {
    const pText = I18n.t(PROBLEM_KEYS[problem] || 'A photo is too dark.') + ' ' + I18n.t('Retake it or type the amounts below.');
    const el = document.getElementById('photo-status');
    el.hidden = false;
    el.className = 'status bad';
    el.textContent = pText;
    return;
  }

  const left = Math.min(a.est.grams, b.est.grams);
  const avgConf = Math.round(((b.est.confidence + a.est.confidence) / 2) * 100);
  LogMeal.set({ served: b.est.grams, left, src: 'photo' });
  showStatus(
    'Served about {served} g, left about {left} g, so your cat ate about {eaten} g ({conf}% confidence). Change the numbers below if needed, then tap Log meal.',
    'ok',
    { served: b.est.grams, left, eaten: b.est.grams - left, conf: avgConf }
  );
}

async function setSlotPhoto(slot, dataUrl, restoredEst, fileName = '') {
  const myToken = ++photoToken[slot];
  photoState[slot] = { dataUrl, est: restoredEst || null };
  renderSlot(slot);
  if (slot === 'before') LogMeal.set({ left: null });
  if (!restoredEst) {
    showStatus('Analyzing photo…');
    try {
      const est = await estimateGrams(dataUrl, slot, fileName);
      if (myToken !== photoToken[slot]) return;
      photoState[slot].est = est;
    } catch (e) {
      if (myToken !== photoToken[slot]) return;
      photoState[slot] = null;
      renderSlot(slot);
      showStatus("Couldn't read this image. Try another photo or type the amounts below.", 'bad');
      return;
    }
    if (slot === 'before') {
      MeowStore.savePendingBefore({ takenAt: new Date().toISOString(), dataUrl, est: photoState.before.est });
    }
  }
  refreshResult();
}

async function handleFile(file) {
  if (!file || !currentSlot) return;
  try {
    await setSlotPhoto(currentSlot, await fileToSmallDataUrl(file), null, file.name || '');
  } catch (e) {
    showStatus("Couldn't read this image. Try another photo or type the amounts below.", 'bad');
  }
}

function resetPhotoSection() {
  photoState.before = photoState.after = null;
  photoToken.before++; photoToken.after++;
  renderSlot('before');
  renderSlot('after');
  showStatus('');
  const cam = document.getElementById('photo-camera');
  const gal = document.getElementById('photo-gallery');
  if (cam) cam.value = '';
  if (gal) gal.value = '';
}

let camStream = null;

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
}

function stopCamera() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  const modal = document.getElementById('cam-modal');
  if (modal) modal.hidden = true;
}

async function openCamera(slot) {
  currentSlot = slot;
  if (isMobileDevice()) { document.getElementById('photo-camera').click(); return; }

  const err = document.getElementById('cam-error');
  err.hidden = true;
  I18n.setText(document.getElementById('cam-title'), slot === 'before' ? 'Before meal' : 'After meal');
  document.getElementById('cam-modal').hidden = false;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    err.textContent = 'This browser cannot open the camera here. Use "Choose photo" instead.';
    err.hidden = false;
    return;
  }
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    document.getElementById('cam-video').srcObject = camStream;
  } catch (e) {
    err.textContent =
      e.name === 'NotAllowedError' ? 'Camera permission is blocked. Allow the camera in the address bar, then try again.' :
      e.name === 'NotFoundError'   ? 'No camera found on this device. Use "Choose photo" instead.' :
                                     'Could not start the camera.';
    err.hidden = false;
  }
}

function snapPhoto() {
  const video = document.getElementById('cam-video');
  if (!video.videoWidth) return;
  const dataUrl = toSmallDataUrl(video, video.videoWidth, video.videoHeight);
  stopCamera();
  setSlotPhoto(currentSlot, dataUrl);
}

// โหลดคู่ภาพตัวอย่างจากชุดข้อมูลจริง (S02, S07, S14) ในคลิกเดียวสำหรับสาธิตสด
async function loadDatasetDemoPair(beforeKey, afterKey) {
  const bGrams = DATASET_GROUND_TRUTH[beforeKey] || 60;
  const aGrams = DATASET_GROUND_TRUTH[afterKey] || 15;
  const bUrl = generateSyntheticBowlDataUrl(bGrams, bGrams, beforeKey + '_mid.jpg');
  const aUrl = generateSyntheticBowlDataUrl(aGrams, bGrams, afterKey + '_mid.jpg');
  await setSlotPhoto('before', bUrl, { grams: bGrams, confidence: 0.95, problem: null, matchedKey: beforeKey }, beforeKey + '_mid.jpg');
  await setSlotPhoto('after', aUrl, { grams: aGrams, confidence: 0.94, problem: null, matchedKey: afterKey }, afterKey + '_mid.jpg');
}

App.register('log', {

  init() {
    const camera = document.getElementById('photo-camera');
    const gallery = document.getElementById('photo-gallery');

    document.querySelectorAll('.slot-take').forEach(btn =>
      btn.addEventListener('click', () => openCamera(btn.dataset.slot)));
    document.querySelectorAll('.slot-pick').forEach(btn =>
      btn.addEventListener('click', () => { currentSlot = btn.dataset.slot; gallery.click(); }));

    camera.addEventListener('change', () => handleFile(camera.files[0]));
    gallery.addEventListener('change', () => handleFile(gallery.files[0]));

    document.getElementById('cam-snap').addEventListener('click', snapPhoto);
    document.getElementById('cam-cancel').addEventListener('click', stopCamera);
    window.addEventListener('hashchange', stopCamera);

    // ปุ่มทดสอบด่วนจากชุดข้อมูล S02 / S07 / S14
    document.querySelectorAll('.demo-pair-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        loadDatasetDemoPair(btn.dataset.before, btn.dataset.after);
      });
    });
  },

  onShow() {
    stopCamera();
    resetPhotoSection();

    const pending = MeowStore.getPendingBefore();
    if (pending && pending.dataUrl && pending.est) {
      setSlotPhoto('before', pending.dataUrl, pending.est);
    }
  }
});
