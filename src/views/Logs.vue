<template>
    <div class="logs-container">
        <!-- 查詢表單 -->
        <el-card class="query-card">
            <template #header>
                <div class="card-header">
                    <span>日誌查詢</span>
                    <div class="header-actions">
                        <el-button type="primary" @click="handleQuery" :loading="loading" size="small">
                            <el-icon>
                                <Search />
                            </el-icon>查詢
                        </el-button>
                        <el-button @click="resetQuery" size="small">
                            <el-icon>
                                <Refresh />
                            </el-icon>重置
                        </el-button>
                    </div>
                </div>
            </template>

            <el-form :model="queryParams" ref="queryForm" class="query-form">
                <el-form-item label="時間範圍">
                    <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至"
                        start-placeholder="開始時間" end-placeholder="結束時間" :shortcuts="dateShortcuts"
                        @change="handleDateRangeChange" class="date-picker" />
                </el-form-item>
                <el-form-item label="操作類型">
                    <el-select v-model="queryParams.action" placeholder="請選擇" clearable class="select-input">
                        <el-option v-for="item in actionOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="狀態">
                    <el-select v-model="queryParams.status" placeholder="請選擇" clearable class="select-input">
                        <el-option label="成功" value="成功" />
                        <el-option label="失敗" value="失敗" />
                    </el-select>
                </el-form-item>
                <el-form-item label="操作人">
                    <el-input v-model="queryParams.user" placeholder="請輸入" clearable class="text-input" />
                </el-form-item>
                <el-form-item label="設備">
                    <el-select v-model="queryParams.device" placeholder="請選擇" clearable class="select-input">
                        <el-option v-for="device in deviceOptions" :key="device.value" :label="device.label"
                            :value="device.value" />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 桌面版日誌列表 -->
        <el-card v-loading="loading" class="logs-card desktop-only">
            <template #header>
                <div class="card-header">
                    <span>操作日誌</span>
                    <el-button @click="refreshLogs" size="small">
                        <el-icon>
                            <Refresh />
                        </el-icon>刷新
                    </el-button>
                </div>
            </template>

            <el-table :data="logList" border stripe class="log-table">
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
                <el-table-column prop="description" label="描述" min-width="200">
                    <template #default="{ row }">
                        <div class="description-cell">
                            {{ row.description }}
                        </div>
                    </template>
                </el-table-column>
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
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" class="pagination" />
            </div>
        </el-card>

        <!-- 手機版日誌列表 -->
        <div class="mobile-logs mobile-only">
            <div v-for="log in logList" :key="log.id" class="log-card">
                <div class="log-header">
                    <div class="log-time">{{ log.time }}</div>
                    <el-tag :type="log.status === '成功' ? 'success' : 'danger'" size="small">
                        {{ log.status }}
                    </el-tag>
                </div>
                <div class="log-content">
                    <div class="log-item">
                        <span class="label">操作人：</span>
                        <span class="value">{{ log.user }}</span>
                    </div>
                    <div class="log-item">
                        <span class="label">操作：</span>
                        <el-tag :type="getActionType(log.action)" size="small">
                            {{ log.action }}
                        </el-tag>
                    </div>
                    <div class="log-item">
                        <span class="label">設備：</span>
                        <span class="value">{{ log.device }}</span>
                    </div>
                    <div class="log-item">
                        <span class="label">描述：</span>
                        <span class="value">{{ log.description }}</span>
                    </div>
                    <div class="log-details" v-if="log.details">
                        <el-button type="primary" link @click="showDetails(log)">
                            查看詳情
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 手機版分頁 -->
        <div class="mobile-pagination mobile-only">
            <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total"
                :page-size="queryParams.limit" layout="prev, pager, next" @current-change="handleCurrentChange"
                class="pagination" />
        </div>

        <!-- 詳情彈窗 -->
        <el-dialog v-model="detailsVisible" title="日誌詳情" :width="isMobile ? '90%' : '500px'" class="details-dialog">
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
    max-width: 1200px;
    margin: 0 auto;
}

.query-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    gap: 8px;
}

.query-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.logs-card {
    margin-bottom: 20px;
}

.log-table {
    width: 100%;
    margin-bottom: 20px;
    overflow-x: auto;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.details-content {
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 60vh;
    overflow-y: auto;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.description-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 手機版日誌卡片樣式 */
.mobile-logs {
    display: none;
}

.mobile-pagination {
    display: none;
    margin-top: 20px;
    padding: 0 10px;
}

.log-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
}

.log-time {
    font-size: 14px;
    color: #606266;
}

.log-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.log-item {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    line-height: 1.5;
}

.log-item .label {
    color: #909399;
    min-width: 60px;
}

.log-item .value {
    color: #303133;
    flex: 1;
}

.log-details {
    margin-top: 8px;
    text-align: right;
}

/* 響應式顯示控制 */
@media screen and (max-width: 768px) {
    .desktop-only {
        display: none;
    }

    .mobile-only {
        display: block;
    }

    .mobile-logs {
        display: block;
        padding: 0 10px;
    }

    .mobile-pagination {
        display: flex;
        justify-content: center;
    }
}

@media screen and (min-width: 769px) {
    .desktop-only {
        display: block;
    }

    .mobile-only {
        display: none;
    }
}
</style>