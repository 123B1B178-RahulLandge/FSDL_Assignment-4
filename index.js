const stockData = {
    AAPL: {
        prices: [150, 152, 148, 155, 158, 160, 162],
        volume: [120, 130, 125, 140, 150, 160, 170]
    },
    GOOGL: {
        prices: [2700, 2720, 2710, 2730, 2750, 2760, 2780],
        volume: [90, 95, 100, 110, 115, 120, 125]
    },
    MSFT: {
        prices: [300, 302, 305, 307, 310, 312, 315],
        volume: [100, 105, 110, 115, 120, 130, 135]
    }
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const priceCtx = document.getElementById("priceChart").getContext("2d");
const volumeCtx = document.getElementById("volumeChart").getContext("2d");

let priceChart = new Chart(priceCtx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Price ($)",
            data: stockData.AAPL.prices,
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            fill: true,
            tension: 0.3
        }]
    }
});

let volumeChart = new Chart(volumeCtx, {
    type: "bar",
    data: {
        labels: labels,
        datasets: [{
            label: "Volume (M)",
            data: stockData.AAPL.volume,
            backgroundColor: "#2196F3"
        }]
    }
});

document.getElementById("stockSelect").addEventListener("change", function () {
    const selectedStock = this.value;

    priceChart.data.datasets[0].data = stockData[selectedStock].prices;
    volumeChart.data.datasets[0].data = stockData[selectedStock].volume;

    priceChart.update();
    volumeChart.update();
});
