<template>
    <div class="logs-container">
        <div class="logs-panel">
            <div class="header">
                <h1>系統日誌</h1>
                <p class="subtitle">查看系統操作記錄</p>
            </div>

            <div class="logs-controls">
                <div class="search-box">
                    <input type="text" v-model="searchQuery" placeholder="搜尋日誌..." class="search-input">
                    <span class="search-icon">🔍</span>
                </div>
                <div class="filter-controls">
                    <button v-for="type in logTypes" :key="type.value"
                        :class="{ 'active': selectedType === type.value }" @click="selectedType = type.value">
                        {{ type.label }}
                    </button>
                </div>
            </div>

            <div class="logs-list">
                <div v-for="log in filteredLogs" :key="log.id" class="log-item" :class="log.type">
                    <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                    <div class="log-content">
                        <div class="log-type">{{ getTypeText(log.type) }}</div>
                        <div class="log-message">{{ log.message }}</div>
                        <div class="log-details" v-if="log.details">{{ log.details }}</div>
                    </div>
                </div>
            </div>

            <div class="logs-actions">
                <button class="refresh-btn" @click="loadLogs">
                    <span class="icon">🔄</span>
                    重新整理
                </button>
                <button class="clear-btn" @click="clearLogs">
                    <span class="icon">🗑️</span>
                    清除日誌
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { logAPI } from '../services/api'

const logs = ref([])
const searchQuery = ref('')
const selectedType = ref('all')

const logTypes = [
    { label: '全部', value: 'all' },
    { label: '系統', value: 'system' },
    { label: '操作', value: 'action' },
    { label: '錯誤', value: 'error' }
]

const filteredLogs = computed(() => {
    return logs.value.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (log.details && log.details.toLowerCase().includes(searchQuery.value.toLowerCase()))
        const matchesType = selectedType.value === 'all' || log.type === selectedType.value
        return matchesSearch && matchesType
    })
})

const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const getTypeText = (type) => {
    const types = {
        system: '系統',
        action: '操作',
        error: '錯誤'
    }
    return types[type] || type
}

const loadLogs = async () => {
    try {
        const response = await logAPI.getLogs()
        logs.value = response.logs || []
    } catch (error) {
        console.error('載入日誌失敗:', error)
        alert('載入日誌失敗: ' + error.message)
    }
}

const clearLogs = async () => {
    if (confirm('確定要清除所有日誌嗎？')) {
        try {
            await logAPI.clearLogs()
            logs.value = []
            alert('日誌已清除')
        } catch (error) {
            console.error('清除日誌失敗:', error)
            alert('清除日誌失敗: ' + error.message)
        }
    }
}

onMounted(() => {
    loadLogs()
})
</script>

<style scoped>
.logs-container {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    margin: 0 auto;
}

.logs-panel {
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

.logs-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
}

.search-box {
    position: relative;
    flex: 1;
}

.search-input {
    width: 100%;
    padding: 12px 40px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--panel-bg);
    color: var(--text-color);
    font-size: 1em;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--glow-color);
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color);
    opacity: 0.5;
}

.filter-controls {
    display: flex;
    gap: 10px;
}

.filter-controls button {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--panel-bg);
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-controls button.active {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-color: transparent;
}

.logs-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 10px;
}

.log-item {
    background: var(--panel-bg);
    border-radius: 12px;
    padding: 15px;
    border: 1px solid var(--border-color);
    display: flex;
    gap: 20px;
    transition: all 0.3s ease;
}

.log-item:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px var(--shadow-color);
}

.log-time {
    min-width: 160px;
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.9em;
}

.log-content {
    flex: 1;
}

.log-type {
    font-weight: 600;
    margin-bottom: 5px;
}

.log-message {
    color: var(--text-color);
    margin-bottom: 5px;
}

.log-details {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.9em;
}

.log-item.system {
    border-left: 4px solid var(--primary-color);
}

.log-item.action {
    border-left: 4px solid #4a90e2;
}

.log-item.error {
    border-left: 4px solid #ff6b6b;
}

.logs-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.refresh-btn,
.clear-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.refresh-btn {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
}

.clear-btn {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: white;
}

@media (max-width: 768px) {
    .logs-container {
        padding: 10px;
    }

    .logs-panel {
        padding: 20px;
    }

    .logs-controls {
        flex-direction: column;
    }

    .search-box {
        width: 100%;
    }

    .filter-controls {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 10px;
    }

    .log-item {
        flex-direction: column;
        gap: 10px;
    }

    .log-time {
        min-width: auto;
    }

    .logs-actions {
        flex-direction: column;
    }

    .refresh-btn,
    .clear-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>