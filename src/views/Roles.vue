<template>
    <div class="roles-container">
        <el-row :gutter="20">
            <!-- 左側權限群組列表 -->
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="6">
                <el-card class="roles-list">
                    <template #header>
                        <div class="card-header">
                            <span>權限群組列表</span>
                            <el-button type="primary" @click="handleAddRole">
                                新增群組
                            </el-button>
                        </div>
                    </template>

                    <el-menu :default-active="currentRole?.id" class="roles-menu" @select="handleSelectRole">
                        <el-menu-item v-for="role in roles" :key="role.id" :index="role.id" class="role-menu-item">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            <div class="role-info">
                                <span class="role-name">{{ role.name }}</span>
                                <el-tag size="small" :type="role.type" class="role-tag">
                                    {{ role.users }}位用戶
                                </el-tag>
                            </div>
                        </el-menu-item>
                    </el-menu>
                </el-card>
            </el-col>

            <!-- 右側權限設定 -->
            <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="18">
                <el-card v-if="currentRole" class="permissions-card">
                    <template #header>
                        <div class="card-header">
                            <span>{{ currentRole.name }} - 權限設定</span>
                            <div>
                                <el-button type="primary" @click="handleSavePermissions">
                                    保存設定
                                </el-button>
                                <el-button type="danger" @click="handleDeleteRole">
                                    刪除群組
                                </el-button>
                            </div>
                        </div>
                    </template>

                    <el-form :model="currentRole" label-width="100px">
                        <el-form-item label="群組名稱">
                            <el-input v-model="currentRole.name" />
                        </el-form-item>
                        <el-form-item label="群組描述">
                            <el-input v-model="currentRole.description" type="textarea" rows="2" />
                        </el-form-item>
                    </el-form>

                    <div class="permissions-section">
                        <h3>頁面權限</h3>
                        <el-table :data="pagePermissions" style="width: 100%">
                            <el-table-column prop="pageName" label="頁面名稱" width="180">
                                <template #default="{ row }">
                                    <el-icon class="page-icon" :size="16">
                                        <component :is="row.icon" />
                                    </el-icon>
                                    <span>{{ row.pageName }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="權限設定">
                                <template #default="{ row }">
                                    <el-checkbox-group v-model="currentRole.permissions[row.path]">
                                        <el-checkbox v-for="perm in row.permissions" :key="perm" :label="perm">
                                            {{ getPermissionLabel(perm) }}
                                        </el-checkbox>
                                    </el-checkbox-group>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-card>
                <el-empty v-else description="請選擇一個權限群組" />
            </el-col>
        </el-row>

        <!-- 新增群組對話框 -->
        <el-dialog v-model="dialogVisible" title="新增權限群組" width="500px">
            <el-form :model="newRole" label-width="100px">
                <el-form-item label="群組名稱" required>
                    <el-input v-model="newRole.name" />
                </el-form-item>
                <el-form-item label="群組描述">
                    <el-input v-model="newRole.description" type="textarea" rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleCreateRole">
                        確定
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
    HomeFilled,
    Timer,
    Document,
    Setting,
    Lock,
    UserFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 頁面權限配置
const pagePermissions = ref([
    {
        pageName: '首頁',
        path: '/',
        icon: 'HomeFilled',
        permissions: ['view', 'edit']
    },
    {
        pageName: '定時設置',
        path: '/schedule',
        icon: 'Timer',
        permissions: ['view', 'edit', 'create', 'delete']
    },
    {
        pageName: '操作日誌',
        path: '/logs',
        icon: 'Document',
        permissions: ['view']
    },
    {
        pageName: '設備設置',
        path: '/settings',
        icon: 'Setting',
        permissions: ['view', 'edit']
    },
    {
        pageName: '權限設定',
        path: '/permissions',
        icon: 'Lock',
        permissions: ['view', 'edit', 'create', 'delete']
    },
    {
        pageName: '權限群組',
        path: '/roles',
        icon: 'UserFilled',
        permissions: ['view', 'edit', 'create', 'delete']
    }
])

// 權限群組數據
const roles = ref([
    {
        id: '1',
        name: '超級管理員',
        description: '擁有所有權限',
        type: 'danger',
        users: 1,
        permissions: {
            '/': ['view', 'edit'],
            '/schedule': ['view', 'edit', 'create', 'delete'],
            '/logs': ['view'],
            '/settings': ['view', 'edit'],
            '/permissions': ['view', 'edit', 'create', 'delete'],
            '/roles': ['view', 'edit', 'create', 'delete']
        }
    },
    {
        id: '2',
        name: '一般用戶',
        description: '基本操作權限',
        type: '',
        users: 5,
        permissions: {
            '/': ['view'],
            '/schedule': ['view'],
            '/logs': ['view'],
            '/settings': ['view']
        }
    }
])

const currentRole = ref(null)
const dialogVisible = ref(false)
const newRole = ref({
    name: '',
    description: '',
    permissions: {}
})

// 選擇權限群組
const handleSelectRole = (id) => {
    currentRole.value = { ...roles.value.find(role => role.id === id) }
}

// 新增權限群組
const handleAddRole = () => {
    newRole.value = {
        name: '',
        description: '',
        permissions: {}
    }
    dialogVisible.value = true
}

// 創建權限群組
const handleCreateRole = () => {
    if (!newRole.value.name) {
        ElMessage.error('請輸入群組名稱')
        return
    }

    const role = {
        id: String(roles.value.length + 1),
        name: newRole.value.name,
        description: newRole.value.description,
        type: '',
        users: 0,
        permissions: {}
    }

    roles.value.push(role)
    currentRole.value = { ...role }
    dialogVisible.value = false
    ElMessage.success('創建成功')
}

// 保存權限設定
const handleSavePermissions = () => {
    const index = roles.value.findIndex(role => role.id === currentRole.value.id)
    if (index !== -1) {
        roles.value[index] = { ...currentRole.value }
        ElMessage.success('保存成功')
    }
}

// 刪除權限群組
const handleDeleteRole = () => {
    if (!currentRole.value) return

    ElMessageBox.confirm(
        `確定要刪除 ${currentRole.value.name} 群組嗎？`,
        '警告',
        {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        const index = roles.value.findIndex(role => role.id === currentRole.value.id)
        if (index !== -1) {
            roles.value.splice(index, 1)
            currentRole.value = null
            ElMessage.success('刪除成功')
        }
    }).catch(() => { })
}

// 獲取權限標籤文字
const getPermissionLabel = (permission) => {
    const labels = {
        view: '瀏覽',
        edit: '編輯',
        create: '新增',
        delete: '刪除'
    }
    return labels[permission] || permission
}
</script>

<style scoped>
.roles-container {
    padding: 20px;
}

@media screen and (max-width: 768px) {
    .roles-container {
        padding: 10px;
    }

    .el-row {
        margin: 0 !important;
    }

    .el-col {
        padding: 0 !important;
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.roles-menu {
    border-right: none;
}

.role-menu-item {
    margin: 4px 0;
    border-radius: 4px;
}

.role-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    margin-left: 8px;
}

.role-name {
    font-size: 14px;
}

.role-tag {
    margin-left: 8px;
}

.permissions-card {
    margin-bottom: 20px;
}

@media screen and (max-width: 768px) {
    .permissions-card {
        margin-top: 20px;
    }
}

.permissions-section {
    margin-top: 20px;
    overflow-x: auto;
}

.permissions-section h3 {
    margin-bottom: 16px;
    font-weight: 500;
    color: #606266;
}

.page-icon {
    margin-right: 8px;
    vertical-align: middle;
}

:deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

:deep(.el-checkbox) {
    cursor: pointer;
}

:deep(.el-checkbox__input .el-checkbox__inner) {
    background-color: #fff;
    border-color: #dcdfe6;
    cursor: pointer;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #409EFF;
    border-color: #409EFF;
}

:deep(.el-checkbox__label) {
    color: #606266;
    cursor: pointer;
}

@media screen and (max-width: 480px) {
    :deep(.el-checkbox-group) {
        flex-direction: column;
        gap: 8px;
    }

    :deep(.el-checkbox) {
        margin-right: 0;
        white-space: nowrap;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

:deep(.el-menu-item) {
    display: flex;
    align-items: center;
}

:deep(.el-menu-item .el-icon) {
    margin-right: 8px;
}

:deep(.el-table) {
    width: 100%;
    min-width: 600px;
}

@media screen and (max-width: 768px) {
    .el-form-item {
        margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
        float: none;
        display: block;
        text-align: left;
        margin-bottom: 8px;
    }

    :deep(.el-form-item__content) {
        margin-left: 0 !important;
    }

    :deep(.el-dialog) {
        width: 90% !important;
        max-width: 500px;
    }
}

:deep(.el-input .el-input__wrapper) {
    background-color: #fff;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-textarea .el-textarea__inner) {
    background-color: #fff;
    color: #606266;
    cursor: text;
}

:deep(.el-button) {
    opacity: 1;
    cursor: pointer;
}

:deep(.el-menu-item) {
    cursor: pointer;
}

:deep(.el-menu-item:hover) {
    background-color: #ecf5ff;
}
</style>