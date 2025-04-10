<template>
    <div class="login-container">
        <div class="background-animation"></div>
        <el-card class="login-card">
            <template #header>
                <div class="card-header">
                    <div class="logo">
                        <div class="led-icon">
                            <el-icon :size="32">
                                <Lightning />
                            </el-icon>
                        </div>
                    </div>
                    <h2>LED 控制系統</h2>
                </div>
            </template>
            <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="80px" class="login-form">
                <el-form-item label="帳號" prop="username">
                    <el-input v-model="loginForm.username" placeholder="請輸入帳號" />
                </el-form-item>
                <el-form-item label="密碼" prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="請輸入密碼" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
                        登入
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Lightning } from '@element-plus/icons-vue'
import { authAPI } from '@/services/api'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = ref({
    username: '',
    password: ''
})

const rules = {
    username: [
        { required: true, message: '請輸入使用者名稱', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '請輸入密碼', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    console.log('登入按鈕被點擊')
    console.log('表單數據:', loginForm.value)

    if (!loginFormRef.value) {
        console.log('表單引用不存在')
        return
    }

    try {
        console.log('開始表單驗證')
        const valid = await loginFormRef.value.validate()
        console.log('表單驗證結果:', valid)

        if (valid) {
            loading.value = true
            console.log('登入表單驗證通過')

            try {
                const response = await authAPI.login(loginForm.value.username, loginForm.value.password)
                console.log('登入成功:', response)
                // 設置登入狀態
                localStorage.setItem('isAuthenticated', 'true')
                localStorage.setItem('isAdmin', 'true')
                userStore.login()
                console.log('設置登入狀態完成')
                ElMessage.success('登入成功')
                // 使用 router.push 進行跳轉
                router.push({ name: 'Home' })
            } catch (error) {
                console.log('登入失敗:', error)
                ElMessage.error('帳號或密碼錯誤')
            }
        } else {
            console.log('表單驗證失敗')
            ElMessage.error('請填寫正確的登入資訊')
        }
    } catch (error) {
        console.error('登入過程發生錯誤:', error)
        ElMessage.error('登入過程發生錯誤')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1e2a4a 0%, #293c67 100%);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    overflow: hidden;
}

.background-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
    opacity: 0.8;
    animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.6;
    }

    100% {
        transform: scale(1);
        opacity: 0.8;
    }
}

.login-card {
    width: 100%;
    max-width: 400px;
    margin: 20px;
    border-radius: 16px;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
    transition: transform 0.3s ease;
}

.login-card:hover {
    transform: translateY(-5px);
}

.card-header {
    text-align: center;
    padding: 24px 0;
}

.logo {
    margin-bottom: 24px;
    position: relative;
}

.led-icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(145deg, #3699ff, #2575e6);
    color: white;
    position: relative;
    overflow: hidden;
    animation: float 3s ease-in-out infinite;
    transform: rotate(-10deg);
}

.led-icon::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 45%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 55%,
            transparent 100%);
    transform: rotate(45deg);
    animation: shine 3s ease-in-out infinite;
}

.led-icon :deep(svg) {
    font-size: 36px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    transform: translateZ(0) rotate(10deg);
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0) scale(1);
        box-shadow: 0 10px 20px rgba(54, 153, 255, 0.2);
    }

    50% {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 20px 30px rgba(54, 153, 255, 0.3);
    }
}

@keyframes shine {
    0% {
        transform: translateX(-200%) translateY(-200%) rotate(45deg);
    }

    40%,
    100% {
        transform: translateX(200%) translateY(200%) rotate(45deg);
    }
}

.card-header h2 {
    margin: 0;
    font-size: 28px;
    background: linear-gradient(to right, #3699ff, #2575e6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
    letter-spacing: 1px;
}

:deep(.el-input__wrapper) {
    padding-left: 0;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

:deep(.el-input__prefix) {
    width: 30px;
    justify-content: center;
    color: #909399;
}

.login-button {
    width: 100%;
    padding: 12px 0;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

@media screen and (max-width: 480px) {
    .login-card {
        margin: 16px;
    }

    .card-header h2 {
        font-size: 20px;
    }

    .led-icon {
        width: 56px;
        height: 56px;
    }
}
</style>
