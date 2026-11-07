














































// Global variable to hold the Chart instance
let recoveryChart = null;

/**
 * Render or update the 30-day recovery intake trend chart (FR-4).
 * @param {Array<number>} newFoodIntake - Array of daily food intake in grams.
 * @param {Array<string>|null} newLabels - Array of custom date labels.
 * @param {number} targetValue - Prescribed daily intake target line in grams.
 */
function updateChartData(newFoodIntake, newLabels = null, targetValue = 180) {
    const ctx = document.getElementById('recoveryChart').getContext('2d');

    // Handle Empty State (FR-4 Acceptance Criteria 2)
    if (!newFoodIntake || newFoodIntake.length === 0) {
        if (recoveryChart) {
            recoveryChart.destroy();
            recoveryChart = null;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'center';
        ctx.fillText('No logs available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    // Auto-generate date labels if not provided
    const labels = newLabels || Array.from({ length: newFoodIntake.length }, (_, i) => `Day ${i + 1}`);

    // Generate prescribed target reference line
    const targetLine = Array(newFoodIntake.length).fill(targetValue);

    // Dynamic warning color styling: highlight last 5 days in red if intake drops continuously
    const backgroundColors = newFoodIntake.map((val, idx) => 
        idx >= newFoodIntake.length - 5 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
    );
    const borderColors = newFoodIntake.map((val, idx) => 
        idx >= newFoodIntake.length - 5 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
    );

    // Prevent chart overlapping by destroying previous instance
    if (recoveryChart) {
        recoveryChart.destroy();
    }

    // Render new Chart.js instance
    recoveryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual Intake (g)',
                    data: newFoodIntake,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                },
                {
                    label: 'Prescribed Target',
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
                    title: { display: true, text: 'Intake Amount (grams)' }
                }
            }
        }
    });
}

// Mock dataset representing 30-day timeline with 5-day continuous drop for FR-3/FR-4 validation
const mockData30Days = [
    180, 185, 190, 182, 188, 195, 190, 185, 180, 188,
    192, 185, 190, 188, 195, 190, 185, 180, 188, 190,
    185, 180, 185, 188, 182,
    130, 110, 85, 60, 40
];

// Initial render with 30-day mock dataset
updateChartData(mockData30Days);