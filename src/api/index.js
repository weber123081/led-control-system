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
    logs: [
        { id: 1, time: '2024-04-08 10:00', action: '開啟', status: '成功' },
        { id: 2, time: '2024-04-08 18:00', action: '關閉', status: '成功' }
    ],
    switches: [
        { id: 1, name: '客廳燈', pin: 'LED1', state: false },
        { id: 2, name: '臥室燈', pin: 'LED2', state: false }
    ]
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

// 其他 API 函數
export const login = () => mockData.login
export const logout = () => ({ status: 200 })
export const getUserInfo = () => ({ data: mockData.userInfo })
export const getFunction = () => ({ data: mockData.functions })
export const getLogs = () => ({ data: mockData.logs })
export const addLog = () => ({ status: 200 })
export const restartESP = () => ({ status: 200 })

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

export default {
    login,
    logout,
    getUserInfo,
    getFunction,
    controlGPIO,
    getLogs,
    addLog,
    restartESP,
    getLedState,
    toggleLed,
    scanNetwork,
    testConnection,
    saveDeviceSettings,
    getSwitchConfig,
    addSwitch,
    removeSwitch
} 