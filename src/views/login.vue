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
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="使用者名稱">
                        <template #prefix>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密碼" show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
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
import { ElMessage } from 'element-plus'
import { User, Lock, Lightning } from '@element-plus/icons-vue'

const router = useRouter()
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

const handleLogin = () => {
    if (loginFormRef.value) {
        loginFormRef.value.validate((valid) => {
            if (valid) {
                loading.value = true
                // 檢查預設帳號密碼
                if (loginForm.value.username === 'admin' && loginForm.value.password === 'admin123') {
                    setTimeout(() => {
                        loading.value = false
                        localStorage.setItem('isAuthenticated', 'true')
                        ElMessage.success('登入成功')
                        router.push('/')
                    }, 1000)
                } else {
                    loading.value = false
                    ElMessage.error('帳號或密碼錯誤')
                }
            }
        })
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
