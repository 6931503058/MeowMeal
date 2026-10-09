// ฟังก์ชันสลับหน้าจอ (App Shell Navigation)
function switchScreen(targetScreenId) {
  // 1. ดึงหน้าจอทั้งหมดที่มีคลาส .screen
  const screens = document.querySelectorAll('.screen');

  // 2. ซ่อนทุกหน้าจอโดยการเติมคลาส .hidden
  screens.forEach(screen => {
    screen.classList.add('hidden');
  });

  // 3. ปลดคลาส .hidden ออกจากหน้าที่ต้องการแสดงผล
  const targetScreen = document.getElementById(targetScreenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}