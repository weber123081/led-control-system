import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Schedule from '../views/Schedule.vue'
import Logs from '../views/Logs.vue'
import Settings from '../views/Settings.vue'
import Roles from '../views/Roles.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/roles',
    name: 'Roles',
    component: Roles
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

router.beforeEach((to, from, next) => {
  next()
})

export default router
