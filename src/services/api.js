// API 基礎 URL，使用固定 IP
const BASE_URL = 'http://192.168.50.242'  // 請將此 IP 替換為您的固定 IP

// API 配置
const API_CONFIG = {
    timeout: 5000,  // 5秒超時
    maxRetries: 3,  // 最大重試次數
    retryDelay: 1000  // 重試延遲（毫秒）
}

// 快取配置
const CACHE_CONFIG = {
    enabled: true,
    defaultTTL: 30000, // 30 秒
    maxSize: 50
}

// 快取存儲
const cache = new Map()

// 清除過期快取
const clearExpiredCache = () => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
        if (value.expires < now) {
            cache.delete(key)
        }
    }
}

// 定期清理快取
setInterval(clearExpiredCache, 60000)

// 獲取快取
const getCache = (key) => {
    const cached = cache.get(key)
    if (cached && cached.expires > Date.now()) {
        return cached.data
    }
    return null
}

// 設置快取
const setCache = (key, data, ttl = CACHE_CONFIG.defaultTTL) => {
    if (cache.size >= CACHE_CONFIG.maxSize) {
        clearExpiredCache()
    }
    cache.set(key, {
        data,
        expires: Date.now() + ttl
    })
}

// 延遲函數
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 通用請求函數
const request = async (endpoint, options = {}) => {
    let retries = 0
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`
    const cached = CACHE_CONFIG.enabled ? getCache(cacheKey) : null

    if (cached) {
        return cached
    }

    while (retries < API_CONFIG.maxRetries) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (CACHE_CONFIG.enabled) {
                setCache(cacheKey, data)
            }

            return data
        } catch (error) {
            retries++
            if (retries === API_CONFIG.maxRetries) {
                console.error('API request failed after retries:', error)
                throw error
            }
            await delay(API_CONFIG.retryDelay * retries)
        }
    }
}

// 用戶認證相關 API
export const authAPI = {
    login: async (username, password) => {
        // 本地驗證
        if (username === 'admin' && password === '000000') {
            return {
                token: 'admin-token',
                user: {
                    id: 1,
                    username: 'admin',
                    role: 'admin',
                    name: '管理員'
                }
            }
        }
        throw new Error('帳號或密碼錯誤')
    },
    logout: async () => {
        return request('/logout', { method: 'POST' })
    },
    isAdmin: () => {
        return getCache('isAdmin') || false
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
    control: async (pin, state) => {
        return request('/gpio', {
            method: 'POST',
            body: JSON.stringify({ pin, state })
        })
    }
}

// 時間設置 API
export const timeAPI = {
    setTimes: async (times) => {
        return request('/timeset', {
            method: 'POST',
            body: JSON.stringify({ times })
        })
    },
    getTimes: async () => {
        return request('/get_timeset')
    }
}

// 日誌 API
export const logAPI = {
    getLogs: async () => {
        return request('/logs')
    },
    addLog: async (message) => {
        return request('/logs', {
            method: 'POST',
            body: JSON.stringify({ message })
        })
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
    restart: async () => {
        return request('/restart', { method: 'GET' })
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