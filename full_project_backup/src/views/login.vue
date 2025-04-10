<template>
    <div class="login-container">
        <div class="login-panel">
            <div class="header">
                <div class="logo">
                    <span class="icon">💡</span>
                </div>
                <h1>LED 控制系統</h1>
                <p class="subtitle">歡迎回來！請登入以繼續</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label>
                        <span class="label-text">帳號</span>
                        <div class="input-container">
                            <span class="input-icon">👤</span>
                            <input type="text" v-model="username" placeholder="請輸入帳號"
                                :class="{ 'error': errors.username }">
                        </div>
                    </label>
                    <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
                </div>

                <div class="form-group">
                    <label>
                        <span class="label-text">密碼</span>
                        <div class="input-container">
                            <span class="input-icon">🔒</span>
                            <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="請輸入密碼"
                                :class="{ 'error': errors.password }">
                            <span class="toggle-password" @click="showPassword = !showPassword">
                                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                            </span>
                        </div>
                    </label>
                    <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
                </div>

                <div class="form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" v-model="rememberMe">
                        <span class="checkbox-label">記住我</span>
                    </label>
                </div>

                <button type="submit" class="login-btn" :disabled="isLoading">
                    <span class="btn-content" v-if="!isLoading">
                        <span class="btn-icon">🔑</span>
                        登入
                    </span>
                    <span class="btn-content" v-else>
                        <span class="loading-icon">⌛</span>
                        登入中...
                    </span>
                </button>
            </form>

            <div class="divider">
                <span>或</span>
            </div>

            <div class="social-login">
                <button class="social-btn google">
                    <span class="icon">🌐</span>
                    使用 Google 登入
                </button>
                <button class="social-btn github">
                    <span class="icon">📱</span>
                    使用手機號碼登入
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errors = reactive({
    username: '',
    password: ''
})

const validateForm = () => {
    let isValid = true
    errors.username = ''
    errors.password = ''

    if (!username.value) {
        errors.username = '請輸入帳號'
        isValid = false
    }

    if (!password.value) {
        errors.password = '請輸入密碼'
        isValid = false
    }

    return isValid
}

const handleLogin = async () => {
    if (!validateForm()) return

    isLoading.value = true
    errors.username = ''
    errors.password = ''

    try {
        await authAPI.login(username.value, password.value)
        // 暫時將所有用戶設置為管理員權限
        localStorage.setItem('userRole', 'admin')
        router.push('/')
    } catch (error) {
        console.error('登入錯誤:', error)
        if (error.message.includes('用戶名或密碼')) {
            errors.password = '帳號或密碼錯誤'
        } else {
            errors.password = error.message || '登入失敗'
        }
    } finally {
        isLoading.value = false
    }
}

// 在組件掛載時檢查是否有保存的用戶名
onMounted(() => {
    const savedUsername = localStorage.getItem('username')
    if (savedUsername) {
        username.value = savedUsername
        rememberMe.value = true
    }
})
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: var(--background-gradient);
}

.login-panel {
    width: 100%;
    max-width: 420px;
    background: var(--panel-bg);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 8px 32px var(--shadow-color);
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
}

.login-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
            transparent,
            var(--glow-color),
            transparent);
}

.header {
    text-align: center;
    margin-bottom: 40px;
}

.logo {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo .icon {
    font-size: 2.5em;
    filter: drop-shadow(0 0 8px var(--glow-color));
}

h1 {
    font-size: 2em;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 8px var(--glow-color));
}

.subtitle {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 1.1em;
}

.login-form {
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 24px;
}

.label-text {
    display: block;
    color: var(--text-color);
    margin-bottom: 8px;
    font-size: 0.95em;
    opacity: 0.8;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 12px;
    font-size: 1.2em;
    opacity: 0.7;
}

.toggle-password {
    position: absolute;
    right: 12px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.toggle-password:hover {
    opacity: 1;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 12px 40px;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-color);
    font-size: 1em;
    transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--glow-color);
}

input.error {
    border-color: #ef4444;
}

.error-message {
    color: #ef4444;
    font-size: 0.85em;
    margin-top: 4px;
    display: block;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

input[type="checkbox"] {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    cursor: pointer;
}

.checkbox-label {
    color: var(--text-color);
    font-size: 0.9em;
    opacity: 0.8;
}

.login-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: #ffffff;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.loading-icon {
    animation: spin 1s linear infinite;
}

.divider {
    text-align: center;
    margin: 24px 0;
    position: relative;
}

.divider::before,
.divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 30px);
    height: 1px;
    background: var(--border-color);
}

.divider::before {
    left: 0;
}

.divider::after {
    right: 0;
}

.divider span {
    background: var(--panel-bg);
    padding: 0 10px;
    color: var(--text-color);
    opacity: 0.7;
}

.social-login {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--panel-bg);
    color: var(--text-color);
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.social-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 480px) {
    .login-panel {
        padding: 30px 20px;
    }

    .logo {
        width: 60px;
        height: 60px;
    }

    .logo .icon {
        font-size: 2em;
    }

    h1 {
        font-size: 1.8em;
    }

    input[type="text"],
    input[type="password"] {
        padding: 10px 36px;
        font-size: 0.95em;
    }

    .login-btn {
        padding: 12px;
        font-size: 1em;
    }
}
</style>
