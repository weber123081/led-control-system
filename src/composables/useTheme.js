import { ref, watch } from 'vue'

const themes = {
    dark: {
        primary: '#6366f1',    // 靛藍色
        secondary: '#818cf8',  // 亮靛藍
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',  // 深邃藍黑
        textColor: '#f8fafc',  // 純白文字
        panelBg: 'rgba(255, 255, 255, 0.05)',  // 更透明的深色
        borderColor: 'rgba(255, 255, 255, 0.08)', // 更細緻的邊框
        shadowColor: 'rgba(99, 102, 241, 0.15)',  // 主題色陰影
        glowColor: 'rgba(99, 102, 241, 0.3)'      // 發光效果
    }
}

const currentTheme = ref('dark')

export function useTheme() {
    const setTheme = (themeName) => {
        currentTheme.value = themeName
        const theme = themes[themeName]
        document.documentElement.style.setProperty('--primary-color', theme.primary)
        document.documentElement.style.setProperty('--secondary-color', theme.secondary)
        document.documentElement.style.setProperty('--background-gradient', theme.background)
        document.documentElement.style.setProperty('--text-color', theme.textColor)
        document.documentElement.style.setProperty('--panel-bg', theme.panelBg)
        document.documentElement.style.setProperty('--border-color', theme.borderColor)
        document.documentElement.style.setProperty('--shadow-color', theme.shadowColor)
        document.documentElement.style.setProperty('--glow-color', theme.glowColor)
    }

    // 初始化主題
    setTheme(currentTheme.value)

    return {
        currentTheme,
        themes,
        setTheme
    }
} 