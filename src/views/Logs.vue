<template>
    <div class="logs-container">
        <!-- 查詢表單 -->
        <el-card class="query-card">
            <template #header>
                <div class="card-header">
                    <span>日誌查詢</span>
                    <div>
                        <el-button type="primary" @click="handleQuery" :loading="loading">
                            <el-icon>
                                <Search />
                            </el-icon>查詢
                        </el-button>
                        <el-button @click="resetQuery">
                            <el-icon>
                                <Refresh />
                            </el-icon>重置
                        </el-button>
                    </div>
                </div>
            </template>

            <el-form :model="queryParams" ref="queryForm" :inline="true" class="query-form">
                <el-form-item label="時間範圍">
                    <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至"
                        start-placeholder="開始時間" end-placeholder="結束時間" :shortcuts="dateShortcuts"
                        @change="handleDateRangeChange" />
                </el-form-item>
                <el-form-item label="操作類型">
                    <el-select v-model="queryParams.action" placeholder="請選擇" clearable>
                        <el-option v-for="item in actionOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="狀態">
                    <el-select v-model="queryParams.status" placeholder="請選擇" clearable>
                        <el-option label="成功" value="成功" />
                        <el-option label="失敗" value="失敗" />
                    </el-select>
                </el-form-item>
                <el-form-item label="操作人">
                    <el-input v-model="queryParams.user" placeholder="請輸入" clearable />
                </el-form-item>
                <el-form-item label="設備">
                    <el-select v-model="queryParams.device" placeholder="請選擇" clearable>
                        <el-option v-for="device in deviceOptions" :key="device.value" :label="device.label"
                            :value="device.value" />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 日誌列表 -->
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <span>操作日誌</span>
                    <el-button @click="refreshLogs">
                        <el-icon>
                            <Refresh />
                        </el-icon>刷新
                    </el-button>
                </div>
            </template>

            <el-table :data="logList" border stripe>
                <el-table-column prop="time" label="時間" sortable="custom" width="180" />
                <el-table-column prop="user" label="操作人" width="120" />
                <el-table-column prop="action" label="操作" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getActionType(row.action)" size="small">
                            {{ row.action }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="device" label="設備" width="120" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="status" label="狀態" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="showDetails(row)">
                            詳情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分頁 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit"
                    :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 詳情彈窗 -->
        <el-dialog v-model="detailsVisible" title="日誌詳情" width="500px">
            <pre class="details-content">{{ selectedDetails }}</pre>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getLogs } from '@/api'

// 數據
const loading = ref(false)
const logList = ref([])
const total = ref(0)
const dateRange = ref([])
const detailsVisible = ref(false)
const selectedDetails = ref('')

// 查詢參數
const queryParams = ref({
    page: 1,
    limit: 20,
    startTime: '',
    endTime: '',
    action: '',
    status: '',
    user: '',
    device: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
})

// 選項數據
const actionOptions = [
    { label: '開啟', value: '開啟' },
    { label: '關閉', value: '關閉' },
    { label: '查看', value: '查看' },
    { label: '設定', value: '設定' }
]

const deviceOptions = [
    { label: '客廳燈', value: '客廳燈' },
    { label: '臥室燈', value: '臥室燈' },
    { label: '廚房燈', value: '廚房燈' },
    { label: '所有設備', value: '所有設備' }
]

const dateShortcuts = [
    {
        text: '最近一小時',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000)
            return [start, end]
        }
    },
    {
        text: '今天',
        value: () => {
            const end = new Date()
            const start = new Date(new Date().setHours(0, 0, 0, 0))
            return [start, end]
        }
    },
    {
        text: '本週',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
        }
    }
]

// 方法
const handleDateRangeChange = (val) => {
    queryParams.value.startTime = val ? val[0] : ''
    queryParams.value.endTime = val ? val[1] : ''
}

const getActionType = (action) => {
    const types = {
        '開啟': 'success',
        '關閉': 'warning',
        '查看': 'info',
        '設定': 'primary'
    }
    return types[action] || 'info'
}

const handleQuery = async () => {
    loading.value = true
    try {
        const res = await getLogs(queryParams.value)
        logList.value = res.data
        total.value = res.total
    } catch (error) {
        ElMessage.error('查詢日誌失敗')
        console.error('查詢日誌失敗:', error)
    } finally {
        loading.value = false
    }
}

const resetQuery = () => {
    dateRange.value = []
    queryParams.value = {
        page: 1,
        limit: 20,
        startTime: '',
        endTime: '',
        action: '',
        status: '',
        user: '',
        device: '',
        sortBy: 'timestamp',
        sortOrder: 'desc'
    }
    handleQuery()
}

const refreshLogs = () => {
    handleQuery()
    ElMessage.success('日誌已刷新')
}

const handleSizeChange = (val) => {
    queryParams.value.limit = val
    handleQuery()
}

const handleCurrentChange = (val) => {
    queryParams.value.page = val
    handleQuery()
}

const showDetails = (row) => {
    selectedDetails.value = row.details
    detailsVisible.value = true
}

onMounted(() => {
    handleQuery()
})
</script>

<style scoped>
.logs-container {
    padding: 20px;
    min-height: calc(100vh - 60px);
    background-color: var(--bg-color, #f5f7fa);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.query-card {
    margin-bottom: 20px;
}

.query-form {
    margin-top: 20px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.details-content {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-family: monospace;
}

:deep(.el-form-item) {
    margin-bottom: 18px;
    margin-right: 18px;
}

:deep(.el-date-editor) {
    width: 360px;
}
</style>