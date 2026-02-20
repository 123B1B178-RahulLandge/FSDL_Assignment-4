let priceChart;
let volumeChart;
let changeChart;
let volumeLineChart;
let distributionChart;
let sectorChart, sentimentChart, volatilityChart;

document.getElementById("currentDate").innerText =new Date().toLocaleDateString();

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("menuToggle");

    button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `;
    populateDropdown();
    loadRandomStockOnStart();
});

function loadMarketOverview() {

    document.getElementById("sp500Value").innerHTML = "5,120 <span style='color:#16a34a'>+0.8%</span>";
    document.getElementById("nasdaqValue").innerHTML = "16,850 <span style='color:#dc2626'>-0.3%</span>";
    document.getElementById("dowValue").innerHTML = "38,420 <span style='color:#16a34a'>+0.5%</span>";
    document.getElementById("vixValue").innerHTML = "18.4";

    const sectors = ["Technology", "Finance", "Energy", "Healthcare", "IT Services"];
    const sectorData = sectors.map(() => (Math.random() * 4 - 2).toFixed(2));

    if (sectorChart) sectorChart.destroy();

    sectorChart = new Chart(document.getElementById("sectorChart"), {
        type: "bar",
        data: {
            labels: sectors,
            datasets: [{
                label: "% Change",
                data: sectorData,
                backgroundColor: sectorData.map(val =>
                    val >= 0 ? "#16a34a" : "#dc2626"
                ),
                borderRadius: 4
            }]
        }
    });

    if (sentimentChart) sentimentChart.destroy();

    sentimentChart = new Chart(document.getElementById("sentimentChart"), {
        type: "doughnut",
        data: {
            labels: ["Bullish", "Neutral", "Bearish"],
            datasets: [{
                data: [55, 25, 20],
                backgroundColor: ["#16a34a", "#9ca3af", "#dc2626"],
                borderWidth: 0
            }]
        },
        options: {
            cutout: "65%"
        }
    });

    const volLabels = Array.from({ length: 30 }, (_, i) => `Day ${i+1}`);
    const volData = volLabels.map(() => (15 + Math.random() * 10).toFixed(2));

    if (volatilityChart) volatilityChart.destroy();

    volatilityChart = new Chart(document.getElementById("volatilityChart"), {
        type: "line",
        data: {
            labels: volLabels,
            datasets: [{
                label: "VIX Index",
                data: volData,
                borderColor: "#1e3a8a",
                backgroundColor: "rgba(30,58,138,0.08)",
                fill: true,
                tension: 0.3
            }]
        }
    });

    const table = document.getElementById("gainersTable");
    table.innerHTML = "";

    Object.keys(localStockData).slice(0, 6).forEach(symbol => {

        const change = (Math.random() * 6 - 3).toFixed(2);

        const row = `
            <tr>
                <td>${symbol}</td>
                <td style="color:${change >= 0 ? '#16a34a' : '#dc2626'}">
                    ${change}%
                </td>
            </tr>
        `;

        table.innerHTML += row;
    });
}

function showSection(sectionId, event) {

    document.querySelectorAll(".section").forEach(sec =>
        sec.classList.remove("active")
    );

    document.getElementById(sectionId).classList.add("active");

    document.querySelectorAll(".nav-item").forEach(btn =>
        btn.classList.remove("active")
    );

    if (event) event.target.classList.add("active");

    if (sectionId === "market") {
        loadMarketOverview();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const button = document.getElementById("menuToggle");

    sidebar.classList.toggle("collapsed");

    if (sidebar.classList.contains("collapsed")) {
        button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        `;
    } else {
        button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        `;
    }
}

function populateDropdown() {
    const select = document.getElementById("symbolSelect");

    select.innerHTML = "";

    Object.keys(localStockData).forEach(symbol => {
        const option = document.createElement("option");
        option.value = symbol;
        option.textContent = symbol;
        select.appendChild(option);
    });
}

function generateStockData(basePrice) {
    const series = {};
    let currentPrice = basePrice;

    for (let i = 30; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];

        const dailyChange = (Math.random() - 0.5) * 5;
        currentPrice = Math.max(10, currentPrice + dailyChange);

        series[formattedDate] = {
            "4. close": currentPrice.toFixed(2),
            "5. volume": Math.floor(Math.random() * 1000000 + 500000)
        };
    }

    return series;
}

const localStockData = {
    AAPL: generateStockData(175),
    MSFT: generateStockData(320),
    GOOGL: generateStockData(140),
    AMZN: generateStockData(135),
    TSLA: generateStockData(220),
    META: generateStockData(300),
    NVDA: generateStockData(480),
    NFLX: generateStockData(410),
    TCS: generateStockData(3500),
    INFY: generateStockData(1500),
    IBM: generateStockData(165),
    ORCL: generateStockData(115),
    INTC: generateStockData(45),
    AMD: generateStockData(110),
    WIPRO: generateStockData(420)
};

function fetchStock() {

    const symbol = document.getElementById("symbolSelect").value;

    if (!symbol) return;

    document.getElementById("stats").innerHTML = "Loading...";

    const series = localStockData[symbol];

    if (!series) {
        document.getElementById("stats").innerHTML = "Data not available.";
        return;
    }

    const dates = Object.keys(series);
    const prices = dates.map(d => parseFloat(series[d]["4. close"]));
    const volumes = dates.map(d => parseFloat(series[d]["5. volume"]));

    updateSummary(symbol, prices);
    renderCharts(dates, prices, volumes);
}

function updateSummary(symbol, prices) {
    const latest = prices.at(-1);
    const previous = prices.at(-2);
    const change = (latest - previous).toFixed(2);
    const percent = ((change / previous) * 100).toFixed(2);

    document.getElementById("stats").innerHTML = `
        <div class="summary-card">
            <h4>Symbol</h4>
            <div class="value">${symbol}</div>
        </div>
        <div class="summary-card">
            <h4>Latest Price</h4>
            <div class="value">$${latest}</div>
        </div>
        <div class="summary-card">
            <h4>Daily Change</h4>
            <div class="value" style="color:${change >= 0 ? '#16a34a' : '#dc2626'}">
                ${change} (${percent}%)
            </div>
        </div>
    `;
}

function renderCharts(labels, prices, volumes) {

    if (priceChart) priceChart.destroy();
    if (volumeChart) volumeChart.destroy();
    if (changeChart) changeChart.destroy();
    if (volumeLineChart) volumeLineChart.destroy();
    if (distributionChart) distributionChart.destroy();

    const gridColor = "#e5e7eb";
    const textColor = "#374151";

    priceChart = new Chart(document.getElementById("priceChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Closing Price",
                data: prices,
                borderColor: "#1e3a8a",
                backgroundColor: "rgba(30,58,138,0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 2,
                pointBackgroundColor: "#1e3a8a"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });

    volumeChart = new Chart(document.getElementById("volumeChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Volume",
                data: volumes,
                backgroundColor: "#64748b",
                borderRadius: 4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });

    const percentChanges = prices.map((p, i) => {
        if (i === 0) return 0;
        return (((p - prices[i - 1]) / prices[i - 1]) * 100).toFixed(2);
    });

    changeChart = new Chart(document.getElementById("changeChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "% Change",
                data: percentChanges,
                backgroundColor: percentChanges.map(val =>
                    val >= 0 ? "#16a34a" : "#dc2626"
                ),
                borderRadius: 4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });

    volumeLineChart = new Chart(document.getElementById("volumeLineChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Volume Trend",
                data: volumes,
                borderColor: "#0f766e",
                backgroundColor: "rgba(15,118,110,0.08)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });

    const min = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const max = Math.max(...prices);

    distributionChart = new Chart(
        document.getElementById("distributionChart"),
        {
            type: "doughnut",
            data: {
                labels: ["Minimum", "Average", "Maximum"],
                datasets: [{
                    data: [min, avg, max],
                    backgroundColor: [
                        "#94a3b8",
                        "#1e40af",
                        "#0f172a"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: textColor,
                            padding: 15
                        }
                    }
                }
            }
        }
    );
}

function loadRandomStockOnStart() {

    const select = document.getElementById("symbolSelect");
    const symbols = Object.keys(localStockData);

    const randomSymbol =
        symbols[Math.floor(Math.random() * symbols.length)];

    select.value = randomSymbol;

    const series = localStockData[randomSymbol];

    const dates = Object.keys(series);
    const prices = dates.map(d => parseFloat(series[d]["4. close"]));
    const volumes = dates.map(d => parseFloat(series[d]["5. volume"]));

    updateSummary(randomSymbol, prices);
    renderCharts(dates, prices, volumes);
}