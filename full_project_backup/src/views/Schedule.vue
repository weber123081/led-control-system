<template>
    <div class="schedule-container">
        <div class="schedule-panel">
            <div class="header">
                <h1>排程管理</h1>
                <p class="subtitle">設定 LED 的定時控制</p>
            </div>

            <div class="schedule-grid">
                <div v-for="(schedule, index) in schedules" :key="index" class="schedule-card">
                    <div class="schedule-header">
                        <h3>排程 {{ index + 1 }}</h3>
                        <div class="schedule-status" :class="{ 'active': schedule.enabled }">
                            {{ schedule.enabled ? '啟用' : '停用' }}
                        </div>
                    </div>

                    <div class="schedule-content">
                        <div class="time-settings">
                            <div class="time-input-group">
                                <label>開始時間</label>
                                <input type="time" v-model="schedule.startTime" class="time-input">
                            </div>
                            <div class="time-input-group">
                                <label>結束時間</label>
                                <input type="time" v-model="schedule.endTime" class="time-input">
                            </div>
                        </div>

                        <div class="led-settings">
                            <div class="led-selector">
                                <label>LED 選擇</label>
                                <div class="led-buttons">
                                    <button v-for="led in 3" :key="led"
                                        :class="{ 'selected': schedule.leds.includes(led) }"
                                        @click="toggleLed(schedule, led)">
                                        LED {{ led }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="schedule-actions">
                            <button class="toggle-btn" :class="{ 'active': schedule.enabled }"
                                @click="toggleSchedule(schedule)">
                                {{ schedule.enabled ? '停用' : '啟用' }}
                            </button>
                            <button class="delete-btn" @click="deleteSchedule(index)">
                                刪除
                            </button>
                        </div>
                    </div>
                </div>

                <div class="add-schedule">
                    <button class="add-btn" @click="addNewSchedule">
                        <span class="icon">+</span>
                        新增排程
                    </button>
                </div>
            </div>

            <div class="schedule-actions">
                <button class="save-btn" @click="saveSchedules">
                    <span class="icon">💾</span>
                    保存排程
                </button>
                <button class="load-btn" @click="loadSchedules">
                    <span class="icon">🔄</span>
                    載入排程
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { timeAPI } from '../services/api'

const schedules = ref([])

const addNewSchedule = () => {
    schedules.value.push({
        enabled: false,
        startTime: '00:00',
        endTime: '00:00',
        leds: []
    })
}

const toggleLed = (schedule, led) => {
    const index = schedule.leds.indexOf(led)
    if (index === -1) {
        schedule.leds.push(led)
    } else {
        schedule.leds.splice(index, 1)
    }
}

const toggleSchedule = (schedule) => {
    schedule.enabled = !schedule.enabled
}

const deleteSchedule = (index) => {
    schedules.value.splice(index, 1)
}

const saveSchedules = async () => {
    try {
        await timeAPI.setTimes(schedules.value)
        alert('排程已保存')
    } catch (error) {
        console.error('保存排程失敗:', error)
        alert('保存排程失敗: ' + error.message)
    }
}

const loadSchedules = async () => {
    try {
        const response = await timeAPI.getTimes()
        schedules.value = response.schedules || []
    } catch (error) {
        console.error('載入排程失敗:', error)
        alert('載入排程失敗: ' + error.message)
    }
}

onMounted(() => {
    loadSchedules()
})
</script>

<style scoped>
.schedule-container {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    margin: 0 auto;
}

.schedule-panel {
    background: var(--panel-bg);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 8px 32px var(--shadow-color);
    border: 1px solid var(--border-color);
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
    text-shadow: 0 2px 10px var(--shadow-color);
}

.subtitle {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 1.1em;
}

.schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.schedule-card {
    background: var(--panel-bg);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.schedule-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
}

.schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

h3 {
    color: var(--text-color);
    font-size: 1.2em;
    font-weight: 600;
}

.schedule-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-color);
}

.schedule-status.active {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
}

.time-settings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.time-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

label {
    color: var(--text-color);
    opacity: 0.8;
    font-size: 0.95em;
}

.time-input {
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--panel-bg);
    color: var(--text-color);
    font-size: 1em;
    transition: all 0.3s ease;
}

.time-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--glow-color);
}

.led-settings {
    margin-bottom: 20px;
}

.led-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.led-buttons button {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--panel-bg);
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.led-buttons button.selected {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-color: transparent;
}

.schedule-actions {
    display: flex;
    gap: 10px;
}

.toggle-btn,
.delete-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.toggle-btn {
    background: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.toggle-btn.active {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-color: transparent;
}

.delete-btn {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: white;
}

.add-schedule {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.add-btn {
    padding: 12px 24px;
    border-radius: 12px;
    border: 2px dashed var(--border-color);
    background: transparent;
    color: var(--text-color);
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.add-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.schedule-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
}

.save-btn,
.load-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
}

.save-btn {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
}

.load-btn {
    background: linear-gradient(45deg, #4a90e2, #5c9eff);
    color: white;
}

@media (max-width: 768px) {
    .schedule-container {
        padding: 10px;
    }

    .schedule-panel {
        padding: 20px;
    }

    .schedule-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .time-settings {
        grid-template-columns: 1fr;
    }

    .schedule-actions {
        flex-direction: column;
    }

    .save-btn,
    .load-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>