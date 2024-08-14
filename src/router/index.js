import { createRouter, createWebHistory } from 'vue-router'
import loginView from '../views/login.vue' // 新增登入頁面組件

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login' // 將根路由重定向到登入頁面
    },
    {
      path: '/login',
      name: 'login',
      component: loginView // 登入頁面路由
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/home.vue')
    },
    {
      path: '/light',
      name: 'light',
      component: () => import('../views/light.vue')
    },
    {
      path: '/timeset',
      name: 'timeset',
      component: () => import('../views/timeset.vue')
    },
    {
      path: '/userroles',
      name: 'userroles',
      component: () => import('../views/userroles.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/history.vue')
    },
    {
      path: '/note',
      name: 'note',
      component: () => import('../views/note.vue')
    }
  ]
})

export default router
