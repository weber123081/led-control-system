<template>
    <div class="home-container">
        <div class="connection-status" :class="{ 'connected': isConnected }">
            {{ isConnected ? '已連接' : '未連接' }}
        </div>
        <div class="led-control">
            <div class="header">
                <h1>LED 控制面板</h1>
                <p class="subtitle">智能照明控制系統</p>
            </div>
            <div class="led-grid">
                <div v-for="(led, index) in leds" :key="index" class="led-item" :class="{ 'led-on': led.isOn }"
                    @click="toggleLed(index)">
                    <div class="led-bulb">
                        <div class="led-glow"></div>
                    </div>
                    <div class="led-label">LED {{ index + 1 }}</div>
                    <div class="led-status">{{ led.isOn ? '開啟' : '關閉' }}</div>
                </div>
            </div>
            <div class="controls">
                <button @click="toggleAll(true)" class="control-btn all-on">
                    <span class="icon">⚡</span>
                    全部開啟
                </button>
                <button @click="toggleAll(false)" class="control-btn all-off">
                    <span class="icon">⭕</span>
                    全部關閉
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gpioAPI, testConnection } from '../services/api'

const leds = ref([
    { pin: 3, isOn: false },
    { pin: 5, isOn: false },
    { pin: 7, isOn: false }
])

const isConnected = ref(false)

// 檢查連接狀態
const checkConnection = async () => {
    const result = await testConnection()
    isConnected.value = result.success
}

onMounted(() => {
    checkConnection()
    // 每30秒檢查一次連接狀態
    setInterval(checkConnection, 30000)
})

const toggleLed = async (index) => {
    try {
        const led = leds.value[index]
        const newState = !led.isOn
        await gpioAPI.control(led.pin, newState ? 'on' : 'off')
        led.isOn = newState
    } catch (error) {
        console.error('控制 LED 失敗:', error)
        alert('控制 LED 失敗: ' + error.message)
    }
}

const toggleAll = async (state) => {
    try {
        for (const led of leds.value) {
            await gpioAPI.control(led.pin, state ? 'on' : 'off')
            led.isOn = state
        }
    } catch (error) {
        console.error('控制 LED 失敗:', error)
        alert('控制 LED 失敗: ' + error.message)
    }
}
</script>

<style scoped>
.home-container {
    width: 100%;
    max-width: 1000px;
    padding: 20px;
    margin: 0 auto;
}

.connection-status {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 8px 16px;
    border-radius: 20px;
    background-color: #ff4444;
    color: white;
    font-weight: bold;
}

.connection-status.connected {
    background-color: #00C851;
}

.led-control {
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

.led-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.led-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.led-item:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.led-bulb {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #2a2a3a;
    margin-bottom: 15px;
    position: relative;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset -5px -5px 15px rgba(0, 0, 0, 0.3);
}

.led-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.led-on .led-bulb {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    box-shadow: 0 0 30px rgba(0, 255, 135, 0.5),
        inset -5px -5px 15px rgba(0, 0, 0, 0.3);
}

.led-on .led-glow {
    opacity: 1;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 70%);
}

.led-label {
    font-size: 1.2em;
    font-weight: 600;
    margin-bottom: 5px;
    color: rgba(255, 255, 255, 0.9);
}

.led-status {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.control-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.control-btn .icon {
    font-size: 1.2em;
}

.all-on {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: #1a1a2e;
}

.all-off {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: white;
}

.control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.control-btn:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .home-container {
        padding: 10px;
    }

    .led-control {
        padding: 20px;
    }

    h1 {
        font-size: 2em;
    }

    .led-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
    }

    .led-bulb {
        width: 80px;
        height: 80px;
    }
}
</style>