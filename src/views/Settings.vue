<template>
    <div class="settings-container">
        <el-card class="settings-card">
            <template #header>
                <div class="card-header">
                    <h3>設備設置</h3>
                </div>
            </template>
            <div class="settings-content">
                <el-form :model="settingsForm" label-width="120px">
                    <el-form-item label="設備 IP">
                        <el-input v-model="settingsForm.deviceIP" placeholder="請輸入設備 IP 地址">
                            <template #append>
                                <el-button @click="scanNetwork" :loading="scanning">掃描網絡</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="端口">
                        <el-input-number v-model="settingsForm.port" :min="1" :max="65535" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveSettings" :loading="saving">保存設置</el-button>
                        <el-button @click="testConnection" :loading="testing">測試連接</el-button>
                    </el-form-item>
                </el-form>

                <!-- 掃描結果 -->
                <div v-if="scanResults.length > 0" class="scan-results">
                    <h4>掃描結果</h4>
                    <el-table :data="scanResults" style="width: 100%" border>
                        <el-table-column prop="ip" label="IP 地址" />
                        <el-table-column prop="status" label="狀態">
                            <template #default="{ row }">
                                <el-tag :type="row.status === '在線' ? 'success' : 'danger'">
                                    {{ row.status }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="selectIP(row.ip)">
                                    選擇
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { scanNetwork, testConnection, saveDeviceSettings } from '@/api'

const settingsForm = ref({
    deviceIP: '',
    port: 80
})

const scanResults = ref([])
const scanning = ref(false)
const saving = ref(false)
const testing = ref(false)

// 掃描網絡
const handleScanNetwork = async () => {
    scanning.value = true
    try {
        const results = await scanNetwork()
        scanResults.value = results.map(device => ({
            ip: device.ip,
            status: device.online ? '在線' : '離線'
        }))
        ElMessage.success('掃描完成')
    } catch (error) {
        ElMessage.error('掃描失敗：' + error.message)
    } finally {
        scanning.value = false
    }
}

// 保存設置
const saveSettings = async () => {
    saving.value = true
    try {
        await saveDeviceSettings(settingsForm.value)
        ElMessage.success('設置已保存')
    } catch (error) {
        ElMessage.error('保存失敗：' + error.message)
    } finally {
        saving.value = false
    }
}

// 測試連接
const handleTestConnection = async () => {
    testing.value = true
    try {
        await testConnection(settingsForm.value.deviceIP, settingsForm.value.port)
        ElMessage.success('連接成功')
    } catch (error) {
        ElMessage.error('連接失敗：' + error.message)
    } finally {
        testing.value = false
    }
}

// 選擇 IP
const selectIP = (ip) => {
    settingsForm.value.deviceIP = ip
    ElMessage.success(`已選擇 IP: ${ip}`)
}
</script>

<style scoped>
.settings-container {
    padding: 20px;
}

.settings-card {
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

.settings-content {
    padding: 20px 0;
}

.scan-results {
    margin-top: 20px;
}

.scan-results h4 {
    margin: 0 0 15px 0;
    color: #606266;
}

:deep(.el-form-item__label) {
    font-weight: 500;
}
</style>