// GPIO 腳位定義
const GPIO_PINS = {
    // 常用且安全的 GPIO 腳位
    LED1: 2,   // GPIO2 - 通常用於板載 LED
    LED2: 4,   // GPIO4 - 安全可用
    LED3: 5,   // GPIO5 - 安全可用
    LED4: 12,  // GPIO12 - 安全可用
    LED5: 13,  // GPIO13 - 安全可用
    LED6: 14,  // GPIO14 - 安全可用
    LED7: 15,  // GPIO15 - 安全可用
    LED8: 16,  // GPIO16 - 安全可用
    LED9: 17,  // GPIO17 - 安全可用
    LED10: 18, // GPIO18 - 安全可用
    LED11: 19, // GPIO19 - 安全可用
    LED12: 21, // GPIO21 - 安全可用
    LED13: 22, // GPIO22 - 安全可用
    LED14: 23, // GPIO23 - 安全可用
    LED15: 25, // GPIO25 - 安全可用
    LED16: 26, // GPIO26 - 安全可用
    LED17: 27, // GPIO27 - 安全可用
    LED18: 32, // GPIO32 - 安全可用
    LED19: 33, // GPIO33 - 安全可用
    LED20: 34, // GPIO34 - 僅輸入
    LED21: 35, // GPIO35 - 僅輸入
    LED22: 36, // GPIO36 - 僅輸入
    LED23: 39  // GPIO39 - 僅輸入
}

// 注意事項：
// 1. GPIO0 用於啟動模式選擇，不建議用於 LED 控制
// 2. GPIO1 和 GPIO3 用於串口通信，不建議用於 LED 控制
// 3. GPIO6-11 用於連接閃存，不建議使用
// 4. GPIO34-39 只能用作輸入，不能用作輸出
// 5. GPIO16-17 通常用於 PSRAM，如果您的板子有 PSRAM，請避免使用

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 身份驗證和權限管理
const authAPI = {
    // 驗證用戶身份
    async verifyUser(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('身份驗證失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('驗證用戶身份時出錯:', error)
            throw error
        }
    },

    // 從資料庫獲取用戶權限
    async getUserPermissions(token) {
        try {
            const response = await fetch('/api/auth/permissions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('獲取用戶權限失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('獲取用戶權限時出錯:', error)
            throw error
        }
    }
}

// GPIO 控制 API
const gpioAPI = {
    // 獲取 GPIO 狀態
    async getState(pin) {
        try {
            const response = await fetch(`/api/gpio/${pin}/state`)
            if (!response.ok) {
                throw new Error('獲取 GPIO 狀態失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('獲取 GPIO 狀態時出錯:', error)
            throw error
        }
    },

    // 控制 GPIO
    async control(pin, state) {
        try {
            const response = await fetch(`/api/gpio/${pin}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state })
            })
            if (!response.ok) {
                throw new Error('控制 GPIO 失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('控制 GPIO 時出錯:', error)
            throw error
        }
    }
}

// 日誌記錄 API
const logAPI = {
    // 記錄操作日誌
    async addLog(action, details) {
        try {
            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    details,
                    timestamp: new Date().toISOString()
                })
            })
            if (!response.ok) {
                throw new Error('記錄日誌失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('記錄日誌時出錯:', error)
            throw error
        }
    },

    // 獲取日誌，支持條件查詢
    async getLogs(params = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                startTime,
                endTime,
                action,
                status,
                user,
                device,
                sortBy = 'timestamp',
                sortOrder = 'desc'
            } = params

            // 構建查詢參數
            const queryParams = new URLSearchParams({
                page,
                limit,
                sortBy,
                sortOrder
            })

            // 添加可選的查詢參數
            if (startTime) queryParams.append('startTime', startTime)
            if (endTime) queryParams.append('endTime', endTime)
            if (action) queryParams.append('action', action)
            if (status) queryParams.append('status', status)
            if (user) queryParams.append('user', user)
            if (device) queryParams.append('device', device)

            const response = await fetch(`/api/logs?${queryParams.toString()}`)
            if (!response.ok) {
                throw new Error('獲取日誌失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('獲取日誌時出錯:', error)
            throw error
        }
    },

    // 獲取日誌統計信息
    async getLogStats() {
        try {
            const response = await fetch('/api/logs/stats')
            if (!response.ok) {
                throw new Error('獲取日誌統計失敗')
            }
            return await response.json()
        } catch (error) {
            console.error('獲取日誌統計時出錯:', error)
            throw error
        }
    }
}

// 開關配置管理
const switchConfig = {
    // 默認配置
    switches: [],
    // 從服務器獲取配置
    async loadConfig() {
        try {
            const response = await fetch('/api/config/switches')
            if (!response.ok) {
                throw new Error('獲取開關配置失敗')
            }
            const data = await response.json()
            this.switches = data.switches
            return this.switches
        } catch (error) {
            console.error('加載開關配置時出錯:', error)
            return []
        }
    },
    // 保存配置到服務器
    async saveConfig(switches) {
        try {
            const response = await fetch('/api/config/switches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ switches })
            })
            if (!response.ok) {
                throw new Error('保存開關配置失敗')
            }
            this.switches = switches
            return true
        } catch (error) {
            console.error('保存開關配置時出錯:', error)
            return false
        }
    },
    // 添加新開關
    async addSwitch(name, pin) {
        if (!GPIO_PINS[pin]) {
            throw new Error('無效的 GPIO 腳位')
        }
        const newSwitch = {
            id: Date.now(),
            name,
            pin,
            enabled: true
        }
        const switches = [...this.switches, newSwitch]
        const success = await this.saveConfig(switches)
        if (success) {
            return newSwitch
        }
        throw new Error('添加開關失敗')
    },
    // 刪除開關
    async removeSwitch(id) {
        const switches = this.switches.filter(sw => sw.id !== id)
        const success = await this.saveConfig(switches)
        if (!success) {
            throw new Error('刪除開關失敗')
        }
    },
    // 更新開關狀態
    async updateSwitch(id, updates) {
        const switches = this.switches.map(sw =>
            sw.id === id ? { ...sw, ...updates } : sw
        )
        const success = await this.saveConfig(switches)
        if (!success) {
            throw new Error('更新開關失敗')
        }
    }
}

// 模擬數據
const mockData = {
    login: { status: 200, data: { success: true } },
    userInfo: { loggedIn: true, name: 'admin' },
    functions: { function1: true, function2: true, function3: true },
    switches: [
        { id: 1, name: '客廳燈', pin: 'LED1', state: false },
        { id: 2, name: '臥室燈', pin: 'LED2', state: false }
    ],
    details: [
        {
            id: 1,
            timestamp: '2024-04-08 10:00:00',
            action: '開啟',
            status: '成功',
            user: 'admin',
            device: '客廳燈',
            pin: 'LED1',
            state: true,
            ip: '192.168.1.100',
            message: '設備正常響應'
        },
        {
            id: 2,
            timestamp: '2024-04-08 18:00:00',
            action: '關閉',
            status: '成功',
            user: 'admin',
            device: '客廳燈',
            pin: 'LED1',
            state: false,
            ip: '192.168.1.100',
            message: '設備正常響應'
        },
        {
            id: 3,
            timestamp: '2024-04-08 20:30:00',
            action: '開啟',
            status: '成功',
            user: 'operator',
            device: '臥室燈',
            pin: 'LED2',
            state: true,
            ip: '192.168.1.101',
            message: '設備正常響應'
        },
        {
            id: 4,
            timestamp: '2024-04-08 22:00:00',
            action: '關閉',
            status: '失敗',
            user: 'operator',
            device: '臥室燈',
            pin: 'LED2',
            state: false,
            ip: '192.168.1.101',
            message: '設備無回應'
        },
        {
            id: 5,
            timestamp: '2024-04-08 23:00:00',
            action: '查看',
            status: '成功',
            user: 'reader',
            device: '所有設備',
            pin: 'ALL',
            state: null,
            ip: '192.168.1.102',
            message: '查看設備狀態'
        },
        {
            id: 6,
            timestamp: '2024-04-09 09:00:00',
            action: '開啟',
            status: '成功',
            user: 'admin',
            device: '廚房燈',
            pin: 'LED3',
            state: true,
            ip: '192.168.1.100',
            message: '設備正常響應'
        },
        {
            id: 7,
            timestamp: '2024-04-09 12:00:00',
            action: '關閉',
            status: '失敗',
            user: 'operator',
            device: '廚房燈',
            pin: 'LED3',
            state: false,
            ip: '192.168.1.101',
            message: '網絡連接超時'
        }
    ],
    // 添加日誌統計數據
    logStats: {
        totalLogs: 7,
        actionCounts: {
            '開啟': 3,
            '關閉': 3,
            '查看': 1
        },
        statusCounts: {
            '成功': 5,
            '失敗': 2
        },
        userCounts: {
            'admin': 2,
            'operator': 2,
            'reader': 1
        },
        deviceCounts: {
            '客廳燈': 2,
            '臥室燈': 2,
            '廚房燈': 1,
            '所有設備': 1
        }
    }
}

// 獲取開關配置
export const getSwitchConfig = async () => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockData.switches
}

// 添加新開關
export const addSwitch = async (name, pin) => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    const newSwitch = {
        id: Date.now(),
        name,
        pin,
        state: false
    }
    mockData.switches.push(newSwitch)
    return newSwitch
}

// 刪除開關
export const removeSwitch = async (id) => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    mockData.switches = mockData.switches.filter(sw => sw.id !== id)
    return { status: 200 }
}

// 獲取 LED 狀態
export const getLedState = async (switchId) => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    const sw = mockData.switches.find(s => s.id === switchId)
    return sw ? sw.state : false
}

// 切換 LED 狀態
export const toggleLed = async (switchId) => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    const sw = mockData.switches.find(s => s.id === switchId)
    if (sw) {
        sw.state = !sw.state
    }
    return { status: 200 }
}

// 掃描網絡
export const scanNetwork = async () => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    return [
        { ip: '192.168.1.100', online: true },
        { ip: '192.168.1.101', online: false },
        { ip: '192.168.1.102', online: true }
    ]
}

// 測試設備連接
export const testConnection = async (ip, port) => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    return { status: 200, message: '連接成功' }
}

// 保存設備設置
export const saveDeviceSettings = async (settings) => {
    // 模擬 API 調用延遲
    await new Promise(resolve => setTimeout(resolve, 100))
    return { status: 200, message: '設置已保存' }
}

// 重啟 ESP 設備
export const restartESP = async () => {
    try {
        const response = await fetch('/api/device/restart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            throw new Error('重啟設備失敗')
        }
        return await response.json()
    } catch (error) {
        console.error('重啟設備時出錯:', error)
        // 在開發環境中使用模擬數據
        return { status: 200, message: '設備重啟指令已發送' }
    }
}

// 其他 API 函數
export const login = () => mockData.login
export const logout = () => ({ status: 200 })
export const getUserInfo = () => ({ data: mockData.userInfo })
export const getFunction = () => ({ data: mockData.functions })

// 日誌相關函數
export const addLog = async (action, details) => {
    try {
        const response = await fetch('/api/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                details,
                timestamp: new Date().toISOString()
            })
        })
        if (!response.ok) {
            throw new Error('記錄日誌失敗')
        }
        return await response.json()
    } catch (error) {
        console.error('記錄日誌時出錯:', error)
        // 在開發環境中使用模擬數據
        return { status: 200 }
    }
}

export const getLogs = (params = {}) => {
    // 從模擬數據中篩選日誌
    let filteredLogs = [...mockData.details]

    // 時間範圍篩選
    if (params.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= params.startTime)
    }
    if (params.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= params.endTime)
    }

    // 操作類型篩選
    if (params.action) {
        filteredLogs = filteredLogs.filter(log => log.action === params.action)
    }

    // 狀態篩選
    if (params.status) {
        filteredLogs = filteredLogs.filter(log => log.status === params.status)
    }

    // 操作者篩選
    if (params.user) {
        filteredLogs = filteredLogs.filter(log => log.user === params.user)
    }

    // 設備篩選
    if (params.device) {
        filteredLogs = filteredLogs.filter(log => log.device === params.device)
    }

    // 排序處理
    const sortBy = params.sortBy || 'timestamp'
    const sortOrder = params.sortOrder || 'desc'
    filteredLogs.sort((a, b) => {
        let compareResult
        // 根據不同字段類型進行排序
        if (sortBy === 'timestamp') {
            compareResult = new Date(a.timestamp) - new Date(b.timestamp)
        } else {
            compareResult = String(a[sortBy]).localeCompare(String(b[sortBy]))
        }
        return sortOrder === 'desc' ? -compareResult : compareResult
    })

    // 分頁處理
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 50
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedLogs = filteredLogs.slice(start, end)

    // 返回格式化後的數據
    return {
        data: paginatedLogs.map(log => ({
            id: log.id,
            time: log.timestamp,
            user: log.user,
            action: log.action,
            device: log.device,
            status: log.status,
            description: `${log.action}${log.device}`,
            details: `時間: ${log.timestamp}
操作者: ${log.user}
設備: ${log.device}
操作: ${log.action}
狀態: ${log.status}
腳位: ${log.pin}
設備狀態: ${log.state !== null ? (log.state ? '開啟' : '關閉') : '無'}
IP位址: ${log.ip}
訊息: ${log.message}`
        })),
        total: filteredLogs.length,
        page,
        limit,
        // 返回統計信息
        stats: {
            totalFiltered: filteredLogs.length,
            actionCounts: countBy(filteredLogs, 'action'),
            statusCounts: countBy(filteredLogs, 'status'),
            userCounts: countBy(filteredLogs, 'user'),
            deviceCounts: countBy(filteredLogs, 'device')
        }
    }
}

// 輔助函數：計算分組統計
function countBy(array, key) {
    return array.reduce((acc, curr) => {
        const value = curr[key]
        acc[value] = (acc[value] || 0) + 1
        return acc
    }, {})
}

export const getLogStats = () => ({
    data: mockData.logStats
})

// 控制 GPIO
export const controlGPIO = async (pin, state) => {
    try {
        const response = await fetch(`/api/gpio/${pin}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ state })
        })
        if (!response.ok) {
            throw new Error('控制 GPIO 失敗')
        }
        return await response.json()
    } catch (error) {
        console.error('控制 GPIO 時出錯:', error)
        throw error
    }
}

// 導出 API 函數
export const verifyUser = authAPI.verifyUser
export const getUserPermissions = authAPI.getUserPermissions
export const getGpioState = gpioAPI.getState
export const controlGpio = gpioAPI.control

// 導出日誌為Excel
export const exportLogsToExcel = async (params) => {
    try {
        // 構建查詢參數
        const queryString = new URLSearchParams({
            startTime: params.startTime || '',
            endTime: params.endTime || '',
            action: params.action || '',
            status: params.status || '',
            user: params.user || '',
            device: params.device || ''
        }).toString()

        const response = await fetch(`/api/logs/export?${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('導出日誌失敗')
        }

        // 獲取blob數據
        const blob = await response.blob()

        // 創建下載鏈接
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `操作日誌_${new Date().toLocaleDateString()}.xlsx`
        document.body.appendChild(a)
        a.click()

        // 清理
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        return { status: 200, message: '導出成功' }
    } catch (error) {
        console.error('導出日誌時出錯:', error)
        throw error
    }
}

// 導出默認對象
export default {
    verifyUser,
    getUserPermissions,
    getGpioState,
    controlGpio,
    login,
    logout,
    getUserInfo,
    getFunction,
    controlGPIO,
    getLogs,
    getLogStats,
    addLog,
    restartESP,
    getLedState,
    toggleLed,
    scanNetwork,
    testConnection,
    saveDeviceSettings,
    getSwitchConfig,
    addSwitch,
    removeSwitch,
    exportLogsToExcel
} 