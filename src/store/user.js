import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: {
            role: 'user', // 'admin' 或 'user'
            permissions: {}
        }
    }),

    getters: {
        isAdmin: (state) => state.userInfo.role === 'admin',
        hasPermission: (state) => (permission) => {
            return state.userInfo.permissions[permission] || state.userInfo.role === 'admin'
        }
    },

    actions: {
        setUserRole(role) {
            this.userInfo.role = role
        },

        setPermissions(permissions) {
            this.userInfo.permissions = permissions
        }
    }
}) 