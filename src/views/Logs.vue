<template>
    <div class="logs-container">
        <el-card class="logs-card">
            <template #header>
                <div class="card-header">
                    <h3>操作日誌</h3>
                    <el-button type="primary" @click="refreshLogs">刷新</el-button>
                </div>
            </template>
            <div class="logs-content">
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
                </el-table>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogs } from '@/api'

const logs = ref([])

const loadLogs = async () => {
    try {
        const response = await getLogs()
        logs.value = response.data
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
})
</script>

<style scoped>
.logs-container {
    padding: 20px;
}

.logs-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
}

.logs-content {
    padding: 20px 0;
}

:deep(.el-table) {
    margin-top: 20px;
}

:deep(.el-table__header) {
    background-color: #f5f7fa;
}

:deep(.el-table th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 500;
}
</style>