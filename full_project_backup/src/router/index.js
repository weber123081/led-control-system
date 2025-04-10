import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Settings from '../views/Settings.vue'
import Schedule from '../views/Schedule.vue'
import Logs from '../views/Logs.vue'
import Admin from '../views/Admin.vue'
import Login from '../views/login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule
  },
  {
    path: '/logs',
    name: 'Logs',
    component: Logs
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
  // 暫時跳過權限檢查，以便測試
  next()
})

export default router
