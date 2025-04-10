<template>
    <div class="settings-container">
        <div class="settings-panel">
            <div class="header">
                <h1>系統設置</h1>
                <p class="subtitle">配置您的 LED 控制系統</p>
            </div>

            <div class="settings-grid">
                <div class="settings-section">
                    <h2>基本設置</h2>
                    <div class="setting-item">
                        <label>系統名稱</label>
                        <input type="text" v-model="systemName" placeholder="輸入系統名稱">
                    </div>
                    <div class="setting-item">
                        <label>LED 數量</label>
                        <select v-model="ledCount">
                            <option v-for="n in 8" :key="n" :value="n">{{ n }} 個</option>
                        </select>
                    </div>
                </div>

                <div class="settings-section">
                    <h2>亮度設置</h2>
                    <div class="setting-item">
                        <label>預設亮度</label>
                        <input type="range" v-model="defaultBrightness" min="0" max="100">
                        <span class="value">{{ defaultBrightness }}%</span>
                    </div>
                    <div class="setting-item">
                        <label>自動調節</label>
                        <div class="toggle-switch">
                            <input type="checkbox" v-model="autoAdjust">
                            <span class="slider"></span>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h2>時間設置</h2>
                    <div class="time-grid">
                        <div v-for="(time, index) in times" :key="index" class="time-item">
                            <label :for="'time' + (index + 1)">時間 {{ index + 1 }}</label>
                            <input type="time" :id="'time' + (index + 1)" v-model="times[index]" class="time-input">
                        </div>
                    </div>
                    <div class="settings-actions">
                        <button @click="saveTimes" class="save-btn">
                            <span class="icon">💾</span>
                            保存設置
                        </button>
                        <button @click="loadTimes" class="load-btn">
                            <span class="icon">🔄</span>
                            載入設置
                        </button>
                    </div>
                </div>

                <div class="settings-section">
                    <h2>通知設置</h2>
                    <div class="setting-item">
                        <label>電子郵件通知</label>
                        <div class="toggle-switch">
                            <input type="checkbox" v-model="emailNotifications">
                            <span class="slider"></span>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label>系統狀態通知</label>
                        <div class="toggle-switch">
                            <input type="checkbox" v-model="systemNotifications">
                            <span class="slider"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="system-controls">
                <button @click="restartSystem" class="restart-btn">
                    <span class="icon">🔄</span>
                    重啟系統
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { timeAPI, systemAPI } from '../services/api'

const systemName = ref('LED 控制系統')
const ledCount = ref(4)
const defaultBrightness = ref(80)
const autoAdjust = ref(true)
const timezone = ref('Asia/Taipei')
const use24Hour = ref(true)
const emailNotifications = ref(true)
const systemNotifications = ref(true)
const times = ref(Array(6).fill('00:00'))

const loadTimes = async () => {
    try {
        const response = await timeAPI.getTimes()
        times.value = response.times
    } catch (error) {
        console.error('載入時間設置失敗:', error)
        alert('載入時間設置失敗: ' + error.message)
    }
}

const saveTimes = async () => {
    try {
        await timeAPI.setTimes(times.value)
        alert('時間設置已保存')
    } catch (error) {
        console.error('保存時間設置失敗:', error)
        alert('保存時間設置失敗: ' + error.message)
    }
}

const restartSystem = async () => {
    if (confirm('確定要重啟系統嗎？')) {
        try {
            await systemAPI.restart()
            alert('系統正在重啟...')
        } catch (error) {
            console.error('重啟系統失敗:', error)
            alert('重啟系統失敗: ' + error.message)
        }
    }
}

onMounted(() => {
    loadTimes()
})
</script>

<style scoped>
.settings-container {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    margin: 0 auto;
}

.settings-panel {
    background: var(--panel-bg);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 8px 32px var(--shadow-color);
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
}

.settings-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
            transparent,
            var(--glow-color),
            transparent);
}

.header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
}

h1 {
    font-size: 2.5em;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 10px var(--shadow-color);
    letter-spacing: -0.5px;
}

.subtitle {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 1.1em;
    letter-spacing: 0.3px;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.settings-section {
    background: var(--panel-bg);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--border-color);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
}

h2 {
    color: var(--text-color);
    opacity: 0.9;
    font-size: 1.3em;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.3px;
}

.setting-item {
    margin-bottom: 24px;
}

.setting-item label {
    display: block;
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 10px;
    font-size: 0.95em;
    letter-spacing: 0.2px;
}

.setting-item input[type="text"],
.setting-item select {
    width: 100%;
    padding: 12px;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-color);
    font-size: 1em;
    transition: all 0.3s ease;
}

.setting-item input[type="text"]:focus,
.setting-item select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--glow-color);
}

.setting-item input[type="range"] {
    width: 100%;
    margin: 12px 0;
    -webkit-appearance: none;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    outline: none;
}

.setting-item input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.setting-item input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px var(--glow-color);
}

.value {
    color: var(--text-color);
    opacity: 0.6;
    font-size: 0.9em;
    letter-spacing: 0.2px;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 56px;
    height: 28px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--panel-bg);
    transition: .4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 28px;
    border: 1px solid var(--border-color);
}

.slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: var(--text-color);
    transition: .4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
}

input:checked+.slider {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    border-color: transparent;
    box-shadow: 0 0 15px var(--glow-color);
}

input:checked+.slider:before {
    transform: translateX(28px);
}

.time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.time-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.time-input {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 1.1em;
    transition: all 0.3s ease;
}

.time-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(0, 255, 135, 0.2);
}

.settings-actions {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.save-btn,
.load-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.save-btn {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: #ffffff;
    box-shadow: 0 4px 15px var(--shadow-color);
}

.load-btn {
    background: linear-gradient(45deg, #4a90e2, #5c9eff);
    color: white;
}

.restart-btn {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: white;
}

.save-btn:hover,
.load-btn:hover,
.restart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
}

.save-btn:active,
.load-btn:active,
.restart-btn:active {
    transform: translateY(0);
}

.system-controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

@media (max-width: 1200px) {
    .settings-container {
        padding: 15px;
    }

    .settings-panel {
        padding: 30px;
    }

    .settings-grid {
        gap: 20px;
    }
}

@media (max-width: 1024px) {
    .settings-panel {
        padding: 25px;
    }

    h1 {
        font-size: 2.2em;
    }

    .settings-section {
        padding: 20px;
    }

    .setting-item {
        margin-bottom: 20px;
    }
}

@media (max-width: 768px) {
    .settings-container {
        padding: 10px;
    }

    .settings-panel {
        padding: 20px;
    }

    h1 {
        font-size: 1.8em;
    }

    .subtitle {
        font-size: 1em;
    }

    .settings-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .settings-section {
        padding: 16px;
    }

    h2 {
        font-size: 1.2em;
        margin-bottom: 16px;
    }

    .setting-item input[type="text"],
    .setting-item select {
        padding: 10px;
        font-size: 0.95em;
    }

    .settings-actions {
        flex-direction: column;
        gap: 12px;
        margin-top: 30px;
    }

    .save-btn,
    .load-btn {
        width: 100%;
        justify-content: center;
        padding: 12px 20px;
        font-size: 1em;
    }
}

@media (max-width: 480px) {
    .settings-container {
        padding: 8px;
    }

    .settings-panel {
        padding: 16px;
    }

    h1 {
        font-size: 1.6em;
    }

    .header {
        margin-bottom: 24px;
    }

    .settings-section {
        padding: 12px;
    }

    .setting-item label {
        font-size: 0.9em;
    }

    .setting-item input[type="text"],
    .setting-item select {
        padding: 8px;
        font-size: 0.9em;
    }

    .toggle-switch {
        width: 48px;
        height: 24px;
    }

    .slider:before {
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
    }

    input:checked+.slider:before {
        transform: translateX(24px);
    }

    .save-btn,
    .load-btn {
        padding: 10px 16px;
        font-size: 0.95em;
    }
}

/* 橫向模式優化 */
@media (max-height: 600px) and (orientation: landscape) {
    .settings-container {
        padding: 10px;
    }

    .settings-panel {
        padding: 20px;
    }

    .header {
        margin-bottom: 20px;
    }

    h1 {
        font-size: 1.8em;
        margin-bottom: 5px;
    }

    .settings-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
    }

    .setting-item {
        margin-bottom: 16px;
    }

    .settings-actions {
        margin-top: 20px;
    }
}
</style>