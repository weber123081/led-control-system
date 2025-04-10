import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || null)
    const isAuthenticated = computed(() => !!token.value)
    const userRole = computed(() => user.value?.role || 'guest')

    const roles = {
        admin: ['read', 'write', 'delete', 'manage'],
        user: ['read', 'write'],
        guest: ['read']
    }

    const hasPermission = (permission) => {
        return roles[userRole.value]?.includes(permission) || false
    }

    const login = async (credentials) => {
        try {
            // 這裡應該調用實際的 API
            // 模擬 API 調用
            const response = await new Promise((resolve) => {
                setTimeout(() => {
                    if (credentials.username === 'admin' && credentials.password === 'admin') {
                        resolve({
                            token: 'admin-token',
                            user: {
                                id: 1,
                                username: 'admin',
                                role: 'admin',
                                name: '管理員'
                            }
                        })
                    } else if (credentials.username === 'user' && credentials.password === 'user') {
                        resolve({
                            token: 'user-token',
                            user: {
                                id: 2,
                                username: 'user',
                                role: 'user',
                                name: '一般用戶'
                            }
                        })
                    } else {
                        throw new Error('無效的憑證')
                    }
                }, 1000)
            })

            token.value = response.token
            user.value = response.user
            localStorage.setItem('token', response.token)
            return true
        } catch (error) {
            console.error('登入失敗:', error)
            return false
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
    }

    const checkAuth = async () => {
        if (!token.value) return false

        try {
            // 這裡應該調用實際的 API 來驗證 token
            // 模擬 API 調用
            const response = await new Promise((resolve) => {
                setTimeout(() => {
                    if (token.value === 'admin-token') {
                        resolve({
                            user: {
                                id: 1,
                                username: 'admin',
                                role: 'admin',
                                name: '管理員'
                            }
                        })
                    } else if (token.value === 'user-token') {
                        resolve({
                            user: {
                                id: 2,
                                username: 'user',
                                role: 'user',
                                name: '一般用戶'
                            }
                        })
                    } else {
                        throw new Error('無效的 token')
                    }
                }, 500)
            })

            user.value = response.user
            return true
        } catch (error) {
            console.error('驗證失敗:', error)
            logout()
            return false
        }
    }

    return {
        user,
        token,
        isAuthenticated,
        userRole,
        hasPermission,
        login,
        logout,
        checkAuth
    }
}) 