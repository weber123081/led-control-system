import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        isAdmin: true,
        username: '管理員',
        userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }),

    actions: {
        login() {
            this.isAuthenticated = true
            localStorage.setItem('isAuthenticated', 'true')
        },

        logout() {
            this.isAuthenticated = false
            localStorage.removeItem('isAuthenticated')
        }
    }
}) 