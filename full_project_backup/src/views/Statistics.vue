<template>
    <div class="statistics-container">
        <div class="statistics-panel">
            <div class="header">
                <h1>使用統計</h1>
                <p class="subtitle">LED 使用情況分析</p>
            </div>

            <div class="stats-grid">
                <div class="stats-card">
                    <div class="card-icon">⚡</div>
                    <div class="card-content">
                        <h3>總使用時間</h3>
                        <p class="value">{{ totalUsageTime }}</p>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="card-icon">💡</div>
                    <div class="card-content">
                        <h3>平均亮度</h3>
                        <p class="value">{{ averageBrightness }}%</p>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="card-icon">💰</div>
                    <div class="card-content">
                        <h3>節省電費</h3>
                        <p class="value">${{ savedMoney }}</p>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="card-icon">🌱</div>
                    <div class="card-content">
                        <h3>減少碳排放</h3>
                        <p class="value">{{ reducedCarbon }}kg</p>
                    </div>
                </div>
            </div>

            <div class="charts-section">
                <div class="chart-container">
                    <h2>每日使用趨勢</h2>
                    <div class="chart-placeholder">
                        <div class="chart-bars">
                            <div v-for="(value, index) in dailyUsage" :key="index" class="chart-bar"
                                :style="{ height: `${value}%` }">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chart-container">
                    <h2>LED 使用分布</h2>
                    <div class="chart-placeholder">
                        <div class="led-distribution">
                            <div v-for="(led, index) in ledDistribution" :key="index" class="led-stat">
                                <div class="led-label">LED {{ index + 1 }}</div>
                                <div class="led-bar-container">
                                    <div class="led-bar" :style="{ width: `${led.usage}%` }">
                                    </div>
                                </div>
                                <div class="led-value">{{ led.usage }}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="time-range-selector">
                <button v-for="range in timeRanges" :key="range.value" class="range-btn"
                    :class="{ active: selectedRange === range.value }" @click="selectedRange = range.value">
                    {{ range.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const timeRanges = [
    { label: '今日', value: 'today' },
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
    { label: '本年', value: 'year' }
]

const selectedRange = ref('week')

// 模擬數據
const totalUsageTime = '1,234 小時'
const averageBrightness = 75
const savedMoney = '1,234'
const reducedCarbon = 123

const dailyUsage = [65, 80, 45, 90, 70, 85, 60]
const ledDistribution = [
    { usage: 85 },
    { usage: 70 },
    { usage: 90 },
    { usage: 75 }
]
</script>

<style scoped>
.statistics-container {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    margin: 0 auto;
}

.statistics-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.header {
    text-align: center;
    margin-bottom: 40px;
}

h1 {
    font-size: 2.5em;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 10px rgba(0, 255, 135, 0.2);
}

.subtitle {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1em;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stats-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.stats-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card-icon {
    font-size: 2em;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

.card-content h3 {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1em;
    margin-bottom: 5px;
}

.card-content .value {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.5em;
    font-weight: 600;
}

.charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.chart-container {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-container h2 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2em;
    margin-bottom: 20px;
}

.chart-placeholder {
    height: 300px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 20px 0;
}

.chart-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    height: 100%;
}

.chart-bar {
    width: 30px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    border-radius: 4px;
    transition: height 0.3s ease;
}

.led-distribution {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
}

.led-stat {
    display: flex;
    align-items: center;
    gap: 15px;
}

.led-label {
    width: 60px;
    color: rgba(255, 255, 255, 0.8);
}

.led-bar-container {
    flex: 1;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
}

.led-bar {
    height: 100%;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    border-radius: 10px;
    transition: width 0.3s ease;
}

.led-value {
    width: 50px;
    color: rgba(255, 255, 255, 0.6);
    text-align: right;
}

.time-range-selector {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.range-btn {
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
}

.range-btn.active {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: #1a1a2e;
    border-color: transparent;
}

.range-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
    .statistics-container {
        padding: 10px;
    }

    .statistics-panel {
        padding: 20px;
    }

    h1 {
        font-size: 2em;
    }

    .charts-section {
        grid-template-columns: 1fr;
    }

    .chart-placeholder {
        height: 200px;
    }

    .chart-bar {
        width: 20px;
    }
}
</style>