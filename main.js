const API_KEY = "YOUR_API_KEY";

let priceChart;
let volumeChart;

document.getElementById("currentDate").innerText =new Date().toLocaleDateString();

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("menuToggle");

    button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `;
});

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


function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(sec =>
        sec.classList.remove("active")
    );
    document.getElementById(sectionId).classList.add("active");

    document.querySelectorAll(".nav-item").forEach(btn =>
        btn.classList.remove("active")
    );
    event.target.classList.add("active");
}

async function fetchStock() {
    const symbol = document.getElementById("symbol").value.toUpperCase();
    if (!symbol) return alert("Enter stock symbol");

    document.getElementById("stats").innerHTML = "Loading...";

    const res = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (!data["Time Series (Daily)"]) {
        document.getElementById("stats").innerHTML = "Data not available.";
        return;
    }

    const series = data["Time Series (Daily)"];
    const dates = Object.keys(series).slice(0, 30).reverse();

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

    priceChart = new Chart(document.getElementById("priceChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Closing Price",
                data: prices,
                borderColor: "#1f2937",
                backgroundColor: "rgba(31,41,55,0.1)",
                fill: true,
                tension: 0.3
            }]
        }
    });

    volumeChart = new Chart(document.getElementById("volumeChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Volume",
                data: volumes,
                backgroundColor: "#9ca3af"
            }]
        }
    });
}

