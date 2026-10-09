// 1. ตัวแปรสำหรับเก็บ Instance ของกราฟ
let recoveryChart = null;

/**
 * ฟังก์ชันสร้างและอัปเดตข้อมูลกราฟ Recovery Trend
 * @param {Array<number>} newFoodIntake - ปริมาณอาหารที่กินจริง (กรัม)
 * @param {Array<string>} newLabels - ป้ายชื่อวัน (ถ้าไม่ใส่จะเจนให้อัตโนมัติ)
 * @param {number} targetValue - ค่าเป้าหมาย Target Line (Default: 180)
 */
function updateChartData(newFoodIntake, newLabels = null, targetValue = 180) {
    const ctx = document.getElementById('recoveryChart').getContext('2d');

    // เจน Label วันที่อัตโนมัติหากไม่มีการส่งเข้ามา
    const labels = newLabels || Array.from({ length: newFoodIntake.length }, (_, i) => `วันที่ ${i + 1}`);
    
    // สร้างเส้น Target Line
    const targetLine = Array(newFoodIntake.length).fill(targetValue);

    // กำหนดสี: 5 วันสุดท้ายเป็นสีแดงเตือน วันอื่นเป็นสีฟ้า
    const backgroundColors = newFoodIntake.map((val, idx) => 
        idx >= newFoodIntake.length - 5 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
    );
    const borderColors = newFoodIntake.map((val, idx) => 
        idx >= newFoodIntake.length - 5 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
    );

    // ลบกราฟเดิมก่อนสร้างใหม่ เพื่อป้องกันกราฟซ้อน
    if (recoveryChart) {
        recoveryChart.destroy();
    }

    // วาดกราฟ Chart.js
    recoveryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'ปริมาณอาหารที่กินจริง (กรัม)',
                    data: newFoodIntake,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                },
                {
                    label: 'เป้าหมายมาตรฐาน (Target Line)',
                    data: targetLine,
                    type: 'line',
                    borderColor: '#10B981',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'ปริมาณ (กรัม)' }
                }
            }
        }
    });
}

// 2. Mock Data 30 วัน (5 วันสุดท้ายลดลงชัดเจนตามโจทย์ FR-4)
const mockData30Days = [
    180, 185, 190, 182, 188, 195, 190, 185, 180, 188,
    192, 185, 190, 188, 195, 190, 185, 180, 188, 190,
    185, 180, 185, 188, 182,
    130, 110, 85, 60, 40
];

// รันแสดงผลครั้งแรกด้วย Mock Data
updateChartData(mockData30Days);