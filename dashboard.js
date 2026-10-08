// 1. สร้าง Mock Data 30 วัน (โดยให้ 5 วันสุดท้ายมีแนวโน้มกราฟตกลงมาอย่างชัดเจน)
const labels = Array.from({ length: 30 }, (_, i) => `วันที่ ${i + 1}`);

// ปริมาณอาหารที่กินจริง (หน่วย: กรัม)
const actualFoodIntake = [
    180, 185, 190, 182, 188, 195, 190, 185, 180, 188,
    192, 185, 190, 188, 195, 190, 185, 180, 188, 190,
    185, 180, 185, 188, 182,
    // 5 วันสุดท้าย กราฟตกลงอย่างเห็นได้ชัด
    130, 110, 85, 60, 40 
];

// เส้นแนวนอนเปรียบเทียบเป้าหมาย (Target Line)
const targetLine = Array(30).fill(180);

// 2. ดึง element canvas จาก HTML
const ctx = document.getElementById('recoveryChart').getContext('2d');

// 3. สร้าง Chart ด้วย Chart.js
const recoveryChart = new Chart(ctx, {
    type: 'bar', // ใช้กราฟแท่งสำหรับแสดงปริมาณอาหารที่กินจริง
    data: {
        labels: labels,
        datasets: [
            {
                label: 'ปริมาณอาหารที่กินจริง (กรัม)',
                data: actualFoodIntake,
                backgroundColor: actualFoodIntake.map((val, idx) => 
                    idx >= 25 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
                ), // 5 วันสุดท้ายเป็นสีแดงเตือน
                borderColor: actualFoodIntake.map((val, idx) => 
                    idx >= 25 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
                ),
                borderWidth: 1
            },
            {
                label: 'เป้าหมายมาตรฐาน (Target Line)',
                data: targetLine,
                type: 'line', // แสดงเป็นเส้นแนวนอนเปรียบเทียบ
                borderColor: '#10B981',
                borderWidth: 2,
                borderDash: [5, 5], // เส้นประ
                pointRadius: 0,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'ปริมาณอาหาร (กรัม)'
                }
            }
        }
    }
});