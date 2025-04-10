<template>
    <el-config-provider :locale="zhTw">
        <router-view v-if="!userStore.isAuthenticated"></router-view>
        <el-container v-else class="app-container">
            <!-- 漢堡菜單按鈕 -->
            <div class="menu-toggle" :class="{ 'is-active': isCollapse }" @click="toggleSidebar">
                <el-icon size="24">
                    <Fold v-if="isCollapse" />
                    <Expand v-else />
                </el-icon>
            </div>

            <!-- 側邊欄 -->
            <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar" :class="{ 'is-collapse': isCollapse }">
                <div class="logo">
                    <h2 v-if="!isCollapse">LED 控制系統</h2>
                    <h2 v-else>LED</h2>
                </div>
                <el-menu :router="true" class="el-menu-vertical" :default-active="$route.path"
                    :collapse="isLargeScreen && isCollapse" @select="handleMenuSelect" background-color="#304156"
                    text-color="#bfcbd9" active-text-color="#409EFF">
                    <el-menu-item index="/">
                        <el-icon>
                            <HomeFilled />
                        </el-icon>
                        <template #title>首頁</template>
                    </el-menu-item>
                    <el-menu-item index="/schedule">
                        <el-icon>
                            <Timer />
                        </el-icon>
                        <template #title>定時設置</template>
                    </el-menu-item>
                    <el-menu-item index="/logs">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <template #title>操作日誌</template>
                    </el-menu-item>
                    <el-menu-item index="/settings">
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <template #title>設備設置</template>
                    </el-menu-item>
                    <el-menu-item index="/roles" v-if="userStore.isAdmin">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <template #title>權限群組</template>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 主內容區 -->
            <el-container :class="{ 'is-collapse': isCollapse }">
                <el-header class="header">
                    <div class="header-right">
                        <el-dropdown @command="handleCommand">
                            <span class="user-info">
                                <el-avatar :size="32" :src="userStore.userAvatar" />
                                <span class="username">{{ userStore.username }}</span>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="logout">登出</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-header>

                <el-main class="main-content">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </el-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import { HomeFilled, Timer, Document, Setting, Fold, Expand, Lock, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapse = ref(false)
const windowWidth = ref(window.innerWidth)
const isLargeScreen = computed(() => windowWidth.value > 1024)

const handleResize = () => {
    windowWidth.value = window.innerWidth
    if (!isLargeScreen.value) {
        isCollapse.value = false
    }
}

// 監聽認證狀態變化
watch(() => userStore.isAuthenticated, (newValue) => {
    if (!newValue && route.path !== '/login') {
        router.push('/login')
    }
})

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    // 檢查登入狀態
    if (!userStore.isAuthenticated) {
        router.push('/login')
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

const handleMenuSelect = () => {
    if (!isLargeScreen.value) {
        isCollapse.value = false
    }
}

const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
}

const activeMenu = computed(() => route.path)

const handleCommand = (command) => {
    if (command === 'logout') {
        userStore.logout()
        localStorage.removeItem('isAuthenticated')
        router.push('/login')
        ElMessage.success('已登出')
    }
}
</script>

<style>
.app-container {
    height: 100vh;
}

.menu-toggle {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 1002;
    cursor: pointer;
    color: #606266;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

@media screen and (max-width: 1024px) {
    .menu-toggle {
        display: flex;
    }

    .menu-toggle.is-active {
        left: calc(100vw - 68px);
        background: #304156;
        color: white;
    }
}

.sidebar {
    background-color: #304156;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;
    transition: all 0.3s;
}

@media screen and (max-width: 1024px) {
    .sidebar {
        transform: translateX(-200px);
    }

    .sidebar.is-collapse {
        transform: translateX(0);
        width: 100vw !important;
        background-color: rgba(48, 65, 86, 0.98);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sidebar.is-collapse .el-menu {
        width: 100% !important;
        background-color: transparent !important;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        padding: 20px;
        max-width: 800px;
    }

    .sidebar.is-collapse .el-menu-item {
        height: calc((100vh - 40px) / 4);
        margin: 0;
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px;
        padding: 20px !important;
    }

    .sidebar.is-collapse .el-menu-item .el-icon {
        margin: 0 0 16px 0 !important;
        font-size: min(15vw, 64px);
    }

    .sidebar.is-collapse .el-menu-item span {
        font-size: min(5vw, 20px);
        margin: 0 !important;
        text-align: center;
        color: #ffffff !important;
        font-weight: 500;
        opacity: 1 !important;
        visibility: visible !important;
    }

    .sidebar.is-collapse .logo {
        display: none;
    }
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b2f3a;
    color: #fff;
    padding: 0 20px;
    transition: all 0.3s;
    overflow: hidden;
    white-space: nowrap;
}

.logo h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    transition: all 0.3s;
}

.el-menu {
    border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
    width: 200px;
}

.header {
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    height: 60px;
    position: fixed;
    right: 0;
    left: 200px;
    z-index: 1000;
    transition: all 0.3s;
}

.el-container.is-collapse .header {
    left: 64px;
}

@media screen and (max-width: 1024px) {
    .header {
        left: 0;
        padding-left: 60px;
    }

    .el-container.is-collapse .header {
        left: 0;
    }
}

.header-right {
    display: flex;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.username {
    margin-left: 8px;
    color: #606266;
}

@media screen and (max-width: 480px) {
    .username {
        display: none;
    }
}

.main-content {
    background-color: #f0f2f5;
    padding: 20px;
    margin-left: 200px;
    margin-top: 60px;
    min-height: calc(100vh - 60px);
    transition: all 0.3s;
}

.el-container.is-collapse .main-content {
    margin-left: 64px;
}

@media screen and (max-width: 1024px) {
    .main-content {
        margin-left: 0;
        padding: 15px;
    }

    .el-container.is-collapse .main-content {
        margin-left: 0;
        filter: blur(3px);
        pointer-events: none;
    }
}

@media screen and (max-width: 768px) {
    .main-content {
        padding: 10px;
    }
}

html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#app {
    height: 100%;
}
</style>
