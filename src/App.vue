<template>
    <div id="app">
        <!-- 使用 v-if 條件渲染，只在非登錄頁面時顯示側邊欄 -->
        <sidebar v-if="!isLoginPage" />
        <router-view></router-view>
    </div>
</template>

<script setup>
import sidebar from './views/sidebar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 檢查當前頁面是否為登錄頁面
const isLoginPage = computed(() => {
    return route.path === '/login'
})
</script>

<style scoped></style>
