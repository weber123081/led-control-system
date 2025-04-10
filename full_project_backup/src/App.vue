<template>
    <div class="app-container">
        <nav class="nav-bar" v-if="isAuthenticated">
            <div class="nav-brand">
                <span class="icon">💡</span>
                <span class="title">LED 控制系統</span>
            </div>
            <div class="nav-links">
                <router-link to="/" class="nav-link">
                    <span class="icon">🏠</span>
                    <span class="text">首頁</span>
                </router-link>
                <router-link to="/settings" class="nav-link">
                    <span class="icon">⚙️</span>
                    <span class="text">設定</span>
                </router-link>
                <router-link to="/schedule" class="nav-link">
                    <span class="icon">📅</span>
                    <span class="text">排程</span>
                </router-link>
                <router-link to="/logs" class="nav-link">
                    <span class="icon">📝</span>
                    <span class="text">日誌</span>
                </router-link>
                <router-link to="/admin" class="nav-link" v-if="isAdmin">
                    <span class="icon">👤</span>
                    <span class="text">管理</span>
                </router-link>
            </div>
            <div class="nav-actions">
                <button class="logout-btn" @click="handleLogout">
                    <span class="icon">🚪</span>
                    <span class="text">登出</span>
                </button>
            </div>
        </nav>

        <main class="main-content">
            <router-view></router-view>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from './services/api'

const router = useRouter()
const isAuthenticated = ref(true) // 暫時設為 true 以便測試
const isAdmin = ref(true) // 暫時設為 true 以便測試

const handleLogout = async () => {
    try {
        await authAPI.logout()
        router.push('/login')
    } catch (error) {
        console.error('登出失敗:', error)
    }
}
</script>

<style>
:root {
    --primary-color: #00ff87;
    --secondary-color: #00d4ff;
    --panel-bg: rgba(255, 255, 255, 0.1);
    --text-color: #ffffff;
    --border-color: rgba(255, 255, 255, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.1);
    --glow-color: rgba(0, 255, 135, 0.2);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: var(--text-color);
    min-height: 100vh;
}

.app-container {
    display: flex;
    min-height: 100vh;
}

.nav-bar {
    width: 250px;
    background: var(--panel-bg);
    backdrop-filter: blur(20px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    border-right: 1px solid var(--border-color);
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-bottom: 1px solid var(--border-color);
}

.nav-brand .icon {
    font-size: 1.5em;
}

.nav-brand .title {
    font-size: 1.2em;
    font-weight: 600;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s ease;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: #1a1a2e;
}

.nav-actions {
    margin-top: auto;
}

.logout-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.logout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .app-container {
        flex-direction: column;
    }

    .nav-bar {
        width: 100%;
        padding: 10px;
    }

    .nav-links {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 10px;
    }

    .nav-link {
        white-space: nowrap;
    }

    .main-content {
        padding: 10px;
    }
}
</style>
