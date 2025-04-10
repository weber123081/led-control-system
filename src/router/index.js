import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/home.vue'
import Schedule from '../views/Schedule.vue'
import Logs from '../views/Logs.vue'
import Settings from '../views/Settings.vue'
import Roles from '../views/Roles.vue'
import Login from '../views/login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule,
    meta: { requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: Logs,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: Roles,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log('路由守衛觸發:', to.name)
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  console.log('認證狀態:', isAuthenticated)

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('需要認證，重定向到登入頁面')
    next({ name: 'Login' })
  } else {
    console.log('允許訪問:', to.name)
    next()
  }
})

export default router
