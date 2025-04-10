import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        isAdmin: localStorage.getItem('isAdmin') === 'true',
        username: localStorage.getItem('username') || '管理員',
        userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }),

    actions: {
        login(username = 'admin') {
            this.isAuthenticated = true
            this.isAdmin = true
            this.username = username
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('isAdmin', 'true')
            localStorage.setItem('username', username)
        },

        logout() {
            this.isAuthenticated = false
            this.isAdmin = false
            this.username = ''
            localStorage.removeItem('isAuthenticated')
            localStorage.removeItem('isAdmin')
            localStorage.removeItem('username')
        }
    }
}) 