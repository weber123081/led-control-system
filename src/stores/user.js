import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserInfo } from '../api'

export const useUserStore = defineStore('user', {
    state: () => ({
        isLoggedIn: true,
        name: 'admin',
        token: 'dummy-token',
        functions: {
            function1: true,
            function2: true,
            function3: true
        }
    }),

    actions: {
        login() {
            this.isLoggedIn = true
            this.name = 'admin'
            return true
        },

        logout() {
            // 保持登录状态
            return
        },

        checkAuth() {
            this.isLoggedIn = true
            this.name = 'admin'
            return true
        }
    }
}) 