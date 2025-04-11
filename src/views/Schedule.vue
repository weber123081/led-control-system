<template>
    <div class="schedule-container">
        <el-card class="schedule-card">
            <template #header>
                <div class="card-header">
                    <h3 class="title">定時設置</h3>
                </div>
            </template>
            <div class="schedule-grid">
                <el-card v-for="sw in switches" :key="sw.id" class="schedule-item">
                    <template #header>
                        <div class="schedule-header">
                            <div class="switch-info">
                                <span class="switch-name">{{ sw.name }}</span>
                                <span class="gpio-info">
                                    <el-icon>
                                        <Connection />
                                    </el-icon>
                                    GPIO: {{ sw.pin }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <div class="schedule-content">
                        <div class="time-picker">
                            <div class="time-item">
                                <div class="time-label">
                                    <el-icon>
                                        <Sunny />
                                    </el-icon>
                                    <span>開啟時間</span>
                                </div>
                                <el-time-picker v-model="sw.onTime" placeholder="開啟時間" format="HH:mm"
                                    value-format="HH:mm" class="time-input" />
                            </div>
                            <div class="time-item">
                                <div class="time-label">
                                    <el-icon>
                                        <Moon />
                                    </el-icon>
                                    <span>關閉時間</span>
                                </div>
                                <el-time-picker v-model="sw.offTime" placeholder="關閉時間" format="HH:mm"
                                    value-format="HH:mm" class="time-input" />
                            </div>
                        </div>
                        <div class="weekdays-container">
                            <div class="weekdays-label">選擇星期</div>
                            <div class="weekdays">
                                <el-checkbox-group v-model="sw.weekdays">
                                    <el-checkbox v-for="day in weekdays" :key="day.value" :label="day.value"
                                        class="weekday-checkbox">
                                        {{ day.label }}
                                    </el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </div>
                        <div class="schedule-actions">
                            <el-button type="primary" @click="saveSchedule(sw)" class="save-button">
                                <el-icon>
                                    <Check />
                                </el-icon>
                                保存設置
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSwitchConfig } from '@/api'
import { Connection, Sunny, Moon, Check } from '@element-plus/icons-vue'

// 開關列表
const switches = ref([])

// 星期選項
const weekdays = [
    { label: '週一', value: 1 },
    { label: '週二', value: 2 },
    { label: '週三', value: 3 },
    { label: '週四', value: 4 },
    { label: '週五', value: 5 },
    { label: '週六', value: 6 },
    { label: '週日', value: 0 }
]

// 加載開關配置
const loadSwitches = async () => {
    try {
        const config = await getSwitchConfig()
        switches.value = config.map(sw => ({
            ...sw,
            onTime: '08:00',
            offTime: '18:00',
            weekdays: [1, 2, 3, 4, 5] // 默認工作日
        }))
    } catch (error) {
        ElMessage.error('加載開關配置失敗')
    }
}

// 保存定時設置
const saveSchedule = async (sw) => {
    try {
        // 這裡可以添加保存定時設置的邏輯
        ElMessage.success(`${sw.name} 的定時設置已保存`)
    } catch (error) {
        ElMessage.error('保存定時設置失敗')
    }
}

// 組件掛載時加載開關配置
onMounted(() => {
    loadSwitches()
})
</script>

<style scoped>
.schedule-container {
    padding: 20px;
    min-height: calc(100vh - 60px);
    background-color: var(--bg-color, #f5f7fa);
}

.schedule-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    background: var(--panel-bg, white);
    border: none;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
}

.title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary, #303133);
    background: linear-gradient(45deg, var(--primary-color, #409EFF), var(--secondary-color, #67C23A));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-top: 20px;
    padding: 20px;
}

.schedule-item {
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 2px solid var(--border-color, #ebeef5);
    background: var(--panel-bg, white);
}

.schedule-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
}

.switch-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.switch-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #303133);
}

.gpio-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary, #909399);
    font-size: 14px;
}

.schedule-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
}

.time-picker {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.time-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
}

.time-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-weight: 500;
}

.time-item .el-icon {
    font-size: 20px;
    color: #409EFF;
}

:deep(.time-input) {
    width: 100%;
}

.weekdays-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
}

.weekdays-label {
    font-weight: 500;
    color: #606266;
    margin-bottom: 5px;
    text-align: center;
}

.weekdays {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

.schedule-actions {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.save-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.save-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

:deep(.weekday-checkbox) {
    margin: 0;
    padding: 8px 12px;
    border-radius: 6px;
    background: white;
    transition: all 0.3s ease;
}

:deep(.weekday-checkbox:hover) {
    background: #ecf5ff;
}

/* 手機模式下的響應式調整 */
@media screen and (max-width: 768px) {
    .schedule-container {
        padding: 10px;
    }

    .schedule-grid {
        grid-template-columns: 1fr;
        padding: 10px;
        gap: 15px;
        margin-top: 10px;
    }

    .schedule-item {
        width: 100%;
        margin-bottom: 0;
    }

    .schedule-content {
        gap: 15px;
        padding: 15px 10px;
    }

    .time-item {
        padding: 10px 8px;
    }

    .time-label {
        font-size: 14px;
    }

    :deep(.el-time-picker) {
        width: 100%;
    }

    :deep(.el-input__wrapper) {
        width: 100%;
        padding: 0 10px;
    }

    .save-button {
        width: 100%;
        justify-content: center;
        margin-top: 5px;
    }

    .weekdays-container {
        padding: 12px 8px;
    }

    .weekdays {
        gap: 5px;
    }

    :deep(.weekday-checkbox) {
        padding: 4px 6px;
        font-size: 0.85em;
    }

    :deep(.el-checkbox__label) {
        font-size: 12px;
        padding-left: 4px;
    }

    :deep(.el-checkbox) {
        margin-right: 2px;
        height: auto;
    }

    :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    :deep(.el-card__header) {
        padding: 10px;
    }

    :deep(.el-card__body) {
        padding: 10px;
    }

    .card-header {
        padding: 5px;
    }

    .title {
        font-size: 20px;
    }

    .switch-name {
        font-size: 16px;
    }

    .gpio-info {
        font-size: 12px;
    }

    .schedule-header {
        padding: 10px;
    }
}
</style>