<template>
    <div class="admin-container">
        <div class="admin-panel">
            <div class="header">
                <h1>用戶管理</h1>
                <p class="subtitle">管理系統用戶帳號</p>
            </div>

            <div class="admin-content">
                <div class="actions">
                    <button class="add-btn" @click="showAddUserModal = true">
                        <span class="icon">➕</span>
                        新增用戶
                    </button>
                </div>

                <div class="users-list">
                    <div v-for="user in users" :key="user.id" class="user-item">
                        <div class="user-info">
                            <div class="username">{{ user.username }}</div>
                            <div class="role">
                                {{
                                    user.role === 'admin' ? '管理員' :
                                        user.role === 'operator' ? '操作者' :
                                            '閱覽者'
                                }}
                            </div>
                            <div v-if="user.role === 'operator'" class="permissions">
                                <span v-if="user.permissions?.includes('controlGPIO')">LED控制</span>
                                <span v-if="user.permissions?.includes('manageSchedule')">排程管理</span>
                                <span v-if="user.permissions?.includes('viewLogs')">日誌查看</span>
                                <span v-if="user.permissions?.includes('manageSettings')">設定管理</span>
                            </div>
                        </div>
                        <div class="user-actions">
                            <button class="edit-btn" @click="editUser(user)">
                                <span class="icon">✏️</span>
                            </button>
                            <button class="delete-btn" @click="confirmDeleteUser(user)">
                                <span class="icon">🗑️</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增/編輯用戶模態框 -->
        <div v-if="showAddUserModal || showEditUserModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>{{ showEditUserModal ? '編輯用戶' : '新增用戶' }}</h2>
                    <button class="close-btn" @click="closeModal">✕</button>
                </div>
                <form @submit.prevent="handleSubmit" class="modal-form">
                    <div class="form-group">
                        <label for="username">用戶名</label>
                        <input type="text" id="username" v-model="userForm.username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">{{ showEditUserModal ? '新密碼 (留空則不修改)' : '密碼' }}</label>
                        <input type="password" id="password" v-model="userForm.password" :required="!showEditUserModal">
                    </div>
                    <div class="form-group">
                        <label>角色</label>
                        <div class="role-options">
                            <label class="role-option">
                                <input type="radio" v-model="userForm.role" value="admin">
                                <span>管理員</span>
                            </label>
                            <label class="role-option">
                                <input type="radio" v-model="userForm.role" value="operator">
                                <span>操作者</span>
                            </label>
                            <label class="role-option">
                                <input type="radio" v-model="userForm.role" value="reader">
                                <span>閱覽者</span>
                            </label>
                        </div>
                    </div>

                    <!-- 操作者權限設定 -->
                    <div v-if="userForm.role === 'operator'" class="form-group">
                        <label>操作權限</label>
                        <div class="permission-options">
                            <label class="permission-option">
                                <input type="checkbox" :checked="userForm.permissions.includes('controlGPIO')"
                                    @change="togglePermission('controlGPIO')">
                                <span>控制 LED</span>
                            </label>
                            <label class="permission-option">
                                <input type="checkbox" :checked="userForm.permissions.includes('manageSchedule')"
                                    @change="togglePermission('manageSchedule')">
                                <span>管理排程</span>
                            </label>
                            <label class="permission-option">
                                <input type="checkbox" :checked="userForm.permissions.includes('viewLogs')"
                                    @change="togglePermission('viewLogs')">
                                <span>查看日誌</span>
                            </label>
                            <label class="permission-option">
                                <input type="checkbox" :checked="userForm.permissions.includes('manageSettings')"
                                    @change="togglePermission('manageSettings')">
                                <span>管理設定</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="cancel-btn" @click="closeModal">取消</button>
                        <button type="submit" class="submit-btn">確定</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '../services/api'

const users = ref([])
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const userForm = ref({
    username: '',
    password: '',
    role: 'reader',
    permissions: []
})
const editingUserId = ref(null)

const fetchUsers = async () => {
    try {
        users.value = await adminAPI.getUsers()
    } catch (error) {
        console.error('獲取用戶列表失敗:', error)
    }
}

const editUser = (user) => {
    editingUserId.value = user.id
    userForm.value = {
        username: user.username,
        password: '',
        role: user.role || 'reader',
        permissions: Array.isArray(user.permissions) ? [...user.permissions] : []
    }
    showEditUserModal.value = true
}

const confirmDeleteUser = async (user) => {
    if (confirm(`確定要刪除用戶 ${user.username} 嗎？`)) {
        try {
            await adminAPI.deleteUser(user.id)
            await fetchUsers()
        } catch (error) {
            console.error('刪除用戶失敗:', error)
        }
    }
}

const handleSubmit = async () => {
    try {
        if (showEditUserModal.value) {
            await adminAPI.updateUser(
                editingUserId.value,
                userForm.value.password,
                userForm.value.role,
                userForm.value.role === 'operator' ? userForm.value.permissions : []
            )
        } else {
            await adminAPI.addUser(
                userForm.value.username,
                userForm.value.password,
                userForm.value.role,
                userForm.value.role === 'operator' ? userForm.value.permissions : []
            )
        }
        closeModal()
        await fetchUsers()
    } catch (error) {
        console.error('保存用戶失敗:', error)
    }
}

const closeModal = () => {
    showAddUserModal.value = false
    showEditUserModal.value = false
    editingUserId.value = null
    userForm.value = {
        username: '',
        password: '',
        role: 'reader',
        permissions: []
    }
}

const togglePermission = (permission) => {
    const index = userForm.value.permissions.indexOf(permission)
    if (index === -1) {
        userForm.value.permissions.push(permission)
    } else {
        userForm.value.permissions.splice(index, 1)
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.admin-container {
    padding: 20px;
}

.admin-panel {
    background: var(--panel-bg);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 30px;
    box-shadow: 0 8px 32px var(--shadow-color);
    border: 1px solid var(--border-color);
}

.header {
    margin-bottom: 30px;
}

h1 {
    font-size: 2em;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 1.1em;
}

.actions {
    margin-bottom: 20px;
}

.add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s ease;
}

.add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
}

.users-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.user-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.username {
    font-weight: 500;
    color: var(--text-color);
}

.role {
    font-size: 0.9em;
    color: var(--text-color);
    opacity: 0.7;
}

.user-actions {
    display: flex;
    gap: 8px;
}

.edit-btn,
.delete-btn {
    padding: 8px;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
}

.edit-btn:hover {
    background: rgba(59, 130, 246, 0.2);
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.2);
}

/* 模態框樣式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: var(--panel-bg);
    border-radius: 24px;
    padding: 30px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 8px 32px var(--shadow-color);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-header h2 {
    font-size: 1.5em;
    color: var(--text-color);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    color: var(--text-color);
    opacity: 0.7;
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: var(--text-color);
    opacity: 0.8;
}

.form-group input[type="text"],
.form-group input[type="password"] {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--panel-bg);
    color: var(--text-color);
}

.role-options {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.5rem;
}

.role-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.role-option input[type="radio"] {
    width: 1rem;
    height: 1rem;
    margin: 0;
}

.role-option span {
    font-size: 0.9rem;
    color: var(--text-color);
}

.permission-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
}

.permission-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
}

.permission-option:hover {
    background: rgba(255, 255, 255, 0.1);
}

.permission-option input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    margin: 0;
}

.permission-option span {
    font-size: 0.9rem;
    color: var(--text-color);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.cancel-btn,
.submit-btn {
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cancel-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
}

.submit-btn {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    border: none;
    color: white;
}

.permissions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.permissions span {
    font-size: 0.8em;
    padding: 0.2rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: var(--text-color);
    opacity: 0.8;
}

@media (max-width: 768px) {
    .admin-container {
        padding: 10px;
    }

    .admin-panel {
        padding: 20px;
    }

    .user-item {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .user-actions {
        width: 100%;
        justify-content: flex-end;
    }

    .modal-content {
        width: 95%;
        padding: 20px;
    }
}
</style>