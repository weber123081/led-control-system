// API 基礎 URL，使用固定 IP
const BASE_URL = 'http://192.168.50.242'  // 請將此 IP 替換為您的固定 IP

// 用戶認證相關 API
export const authAPI = {
    async login(username, password) {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            })

            if (!response.ok) {
                throw new Error('登入失敗')
            }

            const data = await response.text()
            if (data === 'success') {
                // 獲取用戶信息
                const userInfo = await this.getUserInfo()
                return userInfo
            } else {
                throw new Error('帳號或密碼錯誤')
            }
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('無法連接到伺服器')
            }
            throw error
        }
    },

    logout() {
        return fetch(`${BASE_URL}/logout`, {
            method: 'POST'
        })
    },

    async getUserInfo() {
        const response = await fetch(`${BASE_URL}/get_user_info`)
        if (!response.ok) throw new Error('獲取用戶信息失敗')
        return await response.json()
    },

    async checkPermission(functionNumber) {
        const response = await fetch(`${BASE_URL}/function${functionNumber}`)
        if (!response.ok) throw new Error('檢查權限失敗')
        const data = await response.json()
        return data.function === 1
    }
}

// 用戶相關 API
export const userAPI = {
    // 獲取當前用戶信息
    getCurrentUser: async () => {
        try {
            const response = await fetch(`${BASE_URL}/get_user_info`)
            if (!response.ok) throw new Error('獲取用戶信息失敗')
            return await response.json()
        } catch (error) {
            console.error('獲取用戶信息失敗:', error)
            throw error
        }
    }
}

// 權限控制
export const permissions = {
    admin: {
        canManageUsers: true,
        canControlGPIO: true,
        canManageSchedule: true,
        canViewLogs: true,
        canManageSettings: true
    },
    operator: {
        canManageUsers: false,
        canControlGPIO: false,
        canManageSchedule: false,
        canViewLogs: false,
        canManageSettings: false
    },
    viewer: {
        canManageUsers: false,
        canControlGPIO: false,
        canManageSchedule: false,
        canViewLogs: true,
        canManageSettings: false
    }
}

// GPIO 控制 API
export const gpioAPI = {
    async control(pin, state) {
        const response = await fetch(`${BASE_URL}/gpio?pin=${pin}&state=${state}`, {
            method: 'GET'
        })
        if (!response.ok) throw new Error('GPIO 控制失敗')
        return response.text()
    }
}

// 時間設置 API
export const timeAPI = {
    async setTimes(times) {
        const formData = new FormData()
        for (let i = 1; i <= 6; i++) {
            formData.append(`time${i}`, times[i - 1])
        }

        const response = await fetch(`${BASE_URL}/timeset`, {
            method: 'POST',
            body: formData
        })
        if (!response.ok) throw new Error('時間設置失敗')
        return response.text()
    },

    async getTimes() {
        const response = await fetch(`${BASE_URL}/get_timeset`)
        if (!response.ok) throw new Error('獲取時間設置失敗')
        return await response.json()
    }
}

// 日誌 API
export const logAPI = {
    async getLogs() {
        const response = await fetch(`${BASE_URL}/logs`)
        if (!response.ok) throw new Error('獲取日誌失敗')
        return await response.json()
    },

    async addLog(logData) {
        const formData = new FormData()
        Object.keys(logData).forEach(key => {
            formData.append(key, logData[key])
        })

        const response = await fetch(`${BASE_URL}/logs`, {
            method: 'POST',
            body: formData
        })
        if (!response.ok) throw new Error('添加日誌失敗')
        return response.text()
    }
}

// 管理員相關 API
export const adminAPI = {
    async getUsers() {
        try {
            const response = await fetch(`${BASE_URL}/users`)
            if (!response.ok) throw new Error('獲取用戶列表失敗')
            return await response.json()
        } catch (error) {
            console.error('獲取用戶列表失敗:', error)
            throw error
        }
    },

    async addUser(username, password, role, permissions = []) {
        try {
            const response = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, role, permissions })
            })
            if (!response.ok) throw new Error('新增用戶失敗')
            return await response.json()
        } catch (error) {
            console.error('新增用戶失敗:', error)
            throw error
        }
    },

    async updateUser(username, password, role, permissions = []) {
        try {
            const response = await fetch(`${BASE_URL}/users/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, role, permissions })
            })
            if (!response.ok) throw new Error('更新用戶失敗')
            return await response.json()
        } catch (error) {
            console.error('更新用戶失敗:', error)
            throw error
        }
    },

    async deleteUser(username) {
        try {
            const response = await fetch(`${BASE_URL}/users/${username}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('刪除用戶失敗')
            return await response.json()
        } catch (error) {
            console.error('刪除用戶失敗:', error)
            throw error
        }
    }
}

// 系統 API
export const systemAPI = {
    async restart() {
        const response = await fetch(`${BASE_URL}/restart`)
        if (!response.ok) throw new Error('重啟失敗')
        return response.text()
    }
}

// 測試連接
export const testConnection = async () => {
    try {
        const response = await fetch(`${BASE_URL}/test_connection`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Connection failed')
        }

        const data = await response.json()
        return {
            success: true,
            message: 'Connected to chip successfully',
            data
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to connect to chip',
            error: error.message
        }
    }
} 