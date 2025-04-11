<template>
    <div class="logs-container">
        <el-card class="logs-card">
            <template #header>
                <div class="card-header">
                    <h3 class="title">操作日誌</h3>
                    <el-button type="primary" class="refresh-button" @click="refreshLogs">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        <span class="button-text">刷新</span>
                    </el-button>
                </div>
            </template>
            <div class="logs-content">
                <!-- 桌面版表格 -->
                <div class="desktop-table" v-if="!isMobile">
                    <el-table :data="logs" style="width: 100%" border>
                        <el-table-column prop="time" label="時間" width="180" />
                        <el-table-column prop="action" label="操作" width="120">
                            <template #default="{ row }">
                                <el-tag :type="row.status === '成功' ? 'success' : 'danger'">
                                    {{ row.action }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="狀態" width="120">
                            <template #default="{ row }">
                                <el-tag :type="row.status === '成功' ? 'success' : 'danger'">
                                    {{ row.status }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="details" label="詳細信息" />
                    </el-table>
                </div>

                <!-- 手機版卡片列表 -->
                <div class="mobile-logs" v-else>
                    <div v-for="(log, index) in logs" :key="index" class="log-card">
                        <div class="log-header">
                            <div class="log-time">{{ log.time }}</div>
                            <el-tag :type="log.status === '成功' ? 'success' : 'danger'" class="log-status">
                                {{ log.status }}
                            </el-tag>
                        </div>
                        <div class="log-body">
                            <div class="log-action">
                                <el-tag :type="log.status === '成功' ? 'success' : 'danger'" size="small">
                                    {{ log.action }}
                                </el-tag>
                            </div>
                            <div class="log-details" v-if="log.details">
                                {{ log.details }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogs } from '@/api'
import { Refresh } from '@element-plus/icons-vue'

const logs = ref([])
const screenWidth = ref(window.innerWidth)

// 判斷是否為移動設備
const isMobile = computed(() => {
    return screenWidth.value < 768
})

// 監聽屏幕尺寸變化
const handleResize = () => {
    screenWidth.value = window.innerWidth
}

const loadLogs = async () => {
    try {
        const response = await getLogs()
        logs.value = response.data || []
    } catch (error) {
        ElMessage.error('獲取日誌失敗')
        console.error(error)
    }
}

const refreshLogs = () => {
    loadLogs()
    ElMessage.success('日誌已刷新')
}

onMounted(() => {
    loadLogs()
    window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.logs-container {
    padding: 20px;
    min-height: calc(100vh - 60px);
    background-color: var(--bg-color, #f5f7fa);
}

.logs-card {
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

.refresh-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
}

.logs-content {
    padding: 20px;
}

/* 桌面版表格樣式 */
.desktop-table {
    margin-top: 10px;
}

:deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
}

:deep(.el-table__header) {
    background-color: #f5f7fa;
}

:deep(.el-table th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 500;
    padding: 12px;
}

:deep(.el-table td) {
    padding: 12px;
}

/* 手機版卡片列表樣式 */
.mobile-logs {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.log-card {
    background: var(--panel-bg, white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color, #ebeef5);
    padding: 16px;
    transition: all 0.3s ease;
}

.log-card:active {
    transform: scale(0.98);
}

.log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color, #ebeef5);
}

.log-time {
    font-size: 14px;
    color: var(--text-secondary, #909399);
}

.log-status {
    font-size: 12px;
}

.log-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.log-action {
    margin-bottom: 4px;
}

.log-details {
    font-size: 14px;
    color: var(--text-primary, #606266);
    line-height: 1.5;
}

/* 響應式設計 */
@media screen and (max-width: 768px) {
    .logs-container {
        padding: 10px;
    }

    .logs-card {
        border-radius: 10px;
    }

    .card-header {
        padding: 12px 15px;
    }

    .title {
        font-size: 20px;
    }

    .button-text {
        display: none;
    }

    .refresh-button {
        padding: 8px;
    }

    .logs-content {
        padding: 12px;
    }

    :deep(.el-card__header) {
        padding: 10px;
    }

    :deep(.el-card__body) {
        padding: 10px;
    }
}
</style>