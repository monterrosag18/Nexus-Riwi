import { store } from '../store.js';

export default function renderStatsGraph() {
    const container = document.createElement('div');
    container.className = 'stats-graph-container fade-in';
    container.innerHTML = `
        <div class="graph-header">
            <h4><i class="fa-solid fa-chart-line"></i> LIVE CLAN PERFORMANCE</h4>
        </div>
        <div class="chart-wrapper">
            <canvas id="clanChart"></canvas>
        </div>
    `;

    // Wait for DOM
    setTimeout(() => {
        const ctx = container.querySelector('#clanChart');
        if (ctx) {
            initChart(ctx, store.getState().clans);
        }
    }, 100);

    return container;
}

let chartInstance = null;

function initChart(ctx, clans) {
    if (chartInstance) chartInstance.destroy();

    const initialLabels = Array.from({ length: 10 }, (_, i) => i); // Last 10 ticks

    // Initial data: just current points flat line or simulated history?
    // Let's do simulated history for realism
    const turingData = generateHistory(clans.turing.points);
    const teslaData = generateHistory(clans.tesla.points);
    const mccarthyData = generateHistory(clans.mccarthy.points);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [
                {
                    label: 'Turing',
                    data: turingData,
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tesla',
                    data: teslaData,
                    borderColor: '#ff2a6d',
                    backgroundColor: 'rgba(255, 42, 109, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'McCarthy',
                    data: mccarthyData,
                    borderColor: '#05ffa1',
                    backgroundColor: 'rgba(5, 255, 161, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#fff', font: { family: 'Courier New' } } }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#aaa', font: { family: 'Courier New' } }
                },
                x: {
                    display: false // Hide x axis labels for cleaner look
                }
            },
            animation: {
                duration: 1000,
                easing: 'linear'
            }
        }
    });

    // Subscribe to Store updates
    store.subscribe((state) => {
        if (chartInstance) {
            // Push new data points (Shift chart)
            updateChartData(chartInstance, 0, state.clans.turing.points);
            updateChartData(chartInstance, 1, state.clans.tesla.points);
            updateChartData(chartInstance, 2, state.clans.mccarthy.points);
        }
    });
}

function updateChartData(chart, datasetIndex, newPoint) {
    const data = chart.data.datasets[datasetIndex].data;
    data.push(newPoint);
    if (data.length > 20) data.shift(); // Keep last 20 points
    chart.update('none'); // Update without full re-render animation for performance
}

function generateHistory(current) {
    // Generate ~15 points leading up to current
    const data = [];
    let p = current - 500;
    for (let i = 0; i < 15; i++) {
        p += Math.floor(Math.random() * 50);
        data.push(p);
    }
    data.push(current);
    return data;
}
