<template>
    <div class="home-container">
        <!-- 角色切換開關 -->
        <div class="role-switch">
            <el-switch v-model="isAdminMode" active-text="管理員" inactive-text="一般用戶" @change="handleRoleChange" />
            <span class="role-label">{{ isAdmin ? '管理員模式' : '一般用戶模式' }}</span>
        </div>

        <!-- 只有管理員可以看到的按鈕組 -->
        <div v-if="isAdmin" class="action-buttons-group">
            <el-button type="primary" class="action-button" @click="showSortDialog = true">
                <el-icon>
                    <Sort />
                </el-icon>
                <span>調整順序</span>
            </el-button>
            <el-button type="primary" class="action-button" @click="handleAdd">
                <el-icon>
                    <Plus />
                </el-icon>
                <span>新增開關</span>
            </el-button>
        </div>

        <el-row :gutter="20">
            <el-col v-for="(item, index) in switches" :key="index" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
                <div class="switch-card">
                    <div class="switch-content">
                        <div class="switch-header">
                            <div class="name-section">
                                <span class="switch-name">{{ item.customName }}</span>
                                <el-button v-if="isAdmin" type="primary" link @click="handleEdit(item)"
                                    class="edit-button">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                </el-button>
                            </div>
                            <el-switch v-model="item.status" @change="handleSwitchChange(item)" :loading="item.loading"
                                class="switch-control" />
                        </div>

                        <!-- 管理員可見的詳細信息 -->
                        <template v-if="isAdmin">
                            <div class="switch-details">
                                <div class="info-item">
                                    <span class="label">GPIO:</span>
                                    <span class="value">{{ item.gpio }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">狀態:</span>
                                    <span class="value" :class="{ 'status-on': item.status }">
                                        {{ item.status ? '開啟' : '關閉' }}
                                    </span>
                                </div>
                                <div class="action-buttons">
                                    <el-button type="danger" link @click="handleDelete(item)" class="delete-button">
                                        刪除開關
                                    </el-button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 排序對話框 -->
        <el-dialog v-model="showSortDialog" title="調整開關順序" width="400px">
            <div class="sortable-list">
                <div v-for="(item, index) in switches" :key="item.gpio" class="sortable-item" draggable="true"
                    @dragstart="handleSortDragStart($event, index)" @dragend="handleSortDragEnd" @dragover.prevent
                    @drop="handleSortDrop($event, index)" @touchstart="handleSortTouchStart($event, index)"
                    @touchmove="handleSortTouchMove" @touchend="handleSortTouchEnd">
                    <el-icon class="drag-handle">
                        <Rank />
                    </el-icon>
                    <span class="switch-name">{{ item.customName }}</span>
                    <span class="switch-gpio">GPIO {{ item.gpio }}</span>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showSortDialog = false">取消</el-button>
                    <el-button type="primary" @click="handleSaveSort">保存順序</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 新增/編輯對話框 -->
        <el-dialog v-if="isAdmin" v-model="dialogVisible" :title="dialogType === 'add' ? '新增開關' : '編輯開關'" width="500px">
            <el-form :model="currentSwitch" label-width="100px">
                <el-form-item label="開關名稱" required>
                    <el-input v-model="currentSwitch.customName" placeholder="請輸入自定義名稱" />
                </el-form-item>
                <el-form-item label="GPIO" required>
                    <el-select v-model="currentSwitch.gpio" placeholder="請選擇 GPIO" style="width: 100%">
                        <el-option v-for="gpio in availableGpios" :key="gpio.value" :label="`GPIO ${gpio.value}`"
                            :value="gpio.value" :disabled="gpio.disabled" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSave">
                        確定
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Sort, Plus, ArrowUp, ArrowDown, Rank } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getLedState, toggleLed } from '@/api'

const userStore = useUserStore()
const isAdminMode = ref(true)
const showSortDialog = ref(false)

// 角色切換處理
const handleRoleChange = (value) => {
    userStore.setUserRole(value ? 'admin' : 'user')
}

onMounted(() => {
    userStore.setUserRole('admin')
})
const isAdmin = computed(() => userStore.isAdmin)

const switches = ref([
    {
        name: '客廳燈',
        customName: '客廳燈',
        gpio: 18,
        status: false,
        loading: false
    },
    {
        name: '臥室燈',
        customName: '臥室燈',
        gpio: 19,
        status: false,
        loading: false
    }
])

// 移動開關位置
const moveUp = (index) => {
    if (index > 0) {
        const temp = switches.value[index]
        switches.value[index] = switches.value[index - 1]
        switches.value[index - 1] = temp
    }
}

const moveDown = (index) => {
    if (index < switches.value.length - 1) {
        const temp = switches.value[index]
        switches.value[index] = switches.value[index + 1]
        switches.value[index + 1] = temp
    }
}

const dialogVisible = ref(false)
const dialogType = ref('add')
const currentSwitch = ref({
    name: '',
    customName: '',
    gpio: 18,
    status: false
})

// 處理開關狀態改變
const handleSwitchChange = async (item) => {
    item.loading = true
    try {
        await toggleLed(item.gpio, item.status)
        ElMessage.success(`${item.customName} ${item.status ? '開啟' : '關閉'}成功`)
    } catch (error) {
        item.status = !item.status // 恢復狀態
        ElMessage.error(`操作失敗: ${error.message}`)
    } finally {
        item.loading = false
    }
}

// 編輯開關
const handleEdit = (item) => {
    dialogType.value = 'edit'
    currentSwitch.value = { ...item }
    dialogVisible.value = true
}

// 新增開關
const handleAdd = () => {
    dialogType.value = 'add'
    currentSwitch.value = {
        name: '',
        customName: '',
        gpio: 18,
        status: false
    }
    dialogVisible.value = true
}

// 保存開關設定
const handleSave = () => {
    if (!currentSwitch.value.customName) {
        ElMessage.error('請輸入開關名稱')
        return
    }

    if (dialogType.value === 'add') {
        switches.value.push({
            ...currentSwitch.value,
            name: currentSwitch.value.customName,
            loading: false
        })
        ElMessage.success('新增成功')
    } else {
        // 編輯模式
        const index = switches.value.findIndex(s => s.gpio === currentSwitch.value.gpio)
        if (index !== -1) {
            switches.value[index] = {
                ...currentSwitch.value,
                name: currentSwitch.value.customName
            }
            ElMessage.success('更新成功')
        }
    }
    dialogVisible.value = false
}

// 刪除開關
const handleDelete = (item) => {
    ElMessageBox.confirm(
        `確定要刪除開關 "${item.customName}" 嗎？`,
        '警告',
        {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        const index = switches.value.findIndex(s => s.gpio === item.gpio)
        if (index !== -1) {
            switches.value.splice(index, 1)
            ElMessage.success('刪除成功')
        }
    }).catch(() => { })
}

// 初始化開關狀態
const initSwitchStates = async () => {
    for (const item of switches.value) {
        item.loading = true
        try {
            const status = await getLedState(item.gpio)
            item.status = status
        } catch (error) {
            console.error(`Failed to get LED ${item.gpio} state:`, error)
        } finally {
            item.loading = false
        }
    }
}

onMounted(() => {
    initSwitchStates()
})

// 計算可用的 GPIO 選項
const availableGpios = computed(() => {
    const usedGpios = switches.value.map(switchItem => switchItem.gpio)
    const currentGpio = currentSwitch.value.gpio

    return Array.from({ length: 41 }, (_, i) => ({
        value: i,
        disabled: usedGpios.includes(i) && i !== currentGpio
    }))
})

// 排序相關的變量和函數
const sortDraggedIndex = ref(-1)

// 排序拖動開始
const handleSortDragStart = (event, index) => {
    sortDraggedIndex.value = index
    event.target.classList.add('dragging')
}

// 排序拖動結束
const handleSortDragEnd = (event) => {
    sortDraggedIndex.value = -1
    event.target.classList.remove('dragging')
}

// 排序放置
const handleSortDrop = (event, index) => {
    if (sortDraggedIndex.value === -1) return

    const draggedItem = switches.value[sortDraggedIndex.value]
    switches.value.splice(sortDraggedIndex.value, 1)
    switches.value.splice(index, 0, draggedItem)
    sortDraggedIndex.value = index
}

// 保存排序
const handleSaveSort = () => {
    showSortDialog.value = false
    ElMessage.success('順序已更新')
}

// 觸控相關的變量
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const touchDraggedIndex = ref(-1)
const touchThreshold = 10 // 觸發拖動的閾值

// 觸控開始
const handleSortTouchStart = (event, index) => {
    touchStartY.value = event.touches[0].clientY
    touchCurrentY.value = touchStartY.value
    touchDraggedIndex.value = index
    event.target.classList.add('dragging')
}

// 觸控移動
const handleSortTouchMove = (event) => {
    if (touchDraggedIndex.value === -1) return

    touchCurrentY.value = event.touches[0].clientY
    const deltaY = touchCurrentY.value - touchStartY.value

    if (Math.abs(deltaY) > touchThreshold) {
        event.preventDefault() // 防止頁面滾動
        const items = document.querySelectorAll('.sortable-item')
        const draggedItem = items[touchDraggedIndex.value]

        // 計算目標位置
        let targetIndex = touchDraggedIndex.value
        items.forEach((item, index) => {
            const rect = item.getBoundingClientRect()
            const itemCenter = rect.top + rect.height / 2

            if (touchCurrentY.value < itemCenter && index < touchDraggedIndex.value) {
                targetIndex = index
            } else if (touchCurrentY.value > itemCenter && index > touchDraggedIndex.value) {
                targetIndex = index
            }
        })

        // 更新位置
        if (targetIndex !== touchDraggedIndex.value) {
            const draggedItem = switches.value[touchDraggedIndex.value]
            switches.value.splice(touchDraggedIndex.value, 1)
            switches.value.splice(targetIndex, 0, draggedItem)
            touchDraggedIndex.value = targetIndex
        }
    }
}

// 觸控結束
const handleSortTouchEnd = (event) => {
    if (touchDraggedIndex.value === -1) return

    event.target.classList.remove('dragging')
    touchDraggedIndex.value = -1
    touchStartY.value = 0
    touchCurrentY.value = 0
}
</script>

<style>
@keyframes borderPulse {
    0% {
        border-color: #409EFF;
    }

    50% {
        border-color: #79bbff;
    }

    100% {
        border-color: #409EFF;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }

    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

@keyframes grabEffect {
    0% {
        transform: scale(1) rotate(0deg);
    }

    25% {
        transform: scale(1.02) rotate(-2deg);
    }

    50% {
        transform: scale(1.04) rotate(0deg);
    }

    75% {
        transform: scale(1.02) rotate(2deg);
    }

    100% {
        transform: scale(1) rotate(0deg);
    }
}

@keyframes grabShadow {
    0% {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    50% {
        box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
    }

    100% {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
}

/* 優化動畫性能 */
.switch-card {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}

/* 只在需要時啟用動畫 */
@media (hover: hover) {
    .switch-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
}

/* 優化拖拽時的動畫 */
.switch-card.dragging {
    transition: none !important;
    transform: scale(1.05) translateZ(0);
    z-index: 100;
}

/* 優化其他卡片的動畫 */
.switch-card:not(.dragging) {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 移除不必要的動畫 */
@media (prefers-reduced-motion: reduce) {
    .switch-card {
        transition: none !important;
    }
}

/* 優化拖拽手柄的動畫 */
.drag-handle {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化排序列表的動畫 */
.sortable-list {
    will-change: transform;
    transform: translateZ(0);
}

.sortable-item {
    will-change: transform;
    transform: translateZ(0);
    transition: transform 0.2s ease;
}

/* 優化拖拽時的視覺效果 */
.sortable-item.dragging {
    transition: none !important;
    transform: scale(1.05) translateZ(0);
    z-index: 100;
}

/* 優化按鈕動畫 */
.action-button {
    will-change: transform;
    transform: translateZ(0);
    transition: transform 0.2s ease;
}

/* 優化開關狀態動畫 */
.switch-status {
    will-change: transform, opacity;
    transform: translateZ(0);
}

/* 優化卡片內容動畫 */
.card-content {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化拖拽提示動畫 */
.drag-prompt {
    will-change: opacity;
    transform: translateZ(0);
}

/* 優化長按效果 */
.switch-card.long-pressing {
    transition: none !important;
    transform: scale(1.05) translateZ(0);
}

/* 優化其他卡片的透明度變化 */
.switch-card:not(.long-pressing) {
    transition: opacity 0.2s ease;
}

/* 優化按鈕點擊效果 */
.action-button:active {
    transform: scale(0.95) translateZ(0);
}

/* 優化開關按鈕動畫 */
.switch-button {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片標題動畫 */
.card-title {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片描述動畫 */
.card-description {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片圖標動畫 */
.card-icon {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片操作按鈕動畫 */
.card-actions {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片狀態標籤動畫 */
.status-tag {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片拖拽手柄動畫 */
.drag-handle-icon {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片陰影動畫 */
.card-shadow {
    will-change: box-shadow;
    transform: translateZ(0);
}

/* 優化卡片邊框動畫 */
.card-border {
    will-change: border-color;
    transform: translateZ(0);
}

/* 優化卡片背景動畫 */
.card-background {
    will-change: background-color;
    transform: translateZ(0);
}

/* 優化卡片內容容器動畫 */
.card-container {
    will-change: transform;
    transform: translateZ(0);
}

/* 優化卡片懸停效果 */
@media (hover: hover) {
    .switch-card:hover .card-content {
        transform: translateY(-2px) translateZ(0);
    }
}

/* 優化卡片點擊效果 */
.switch-card:active {
    transform: scale(0.98) translateZ(0);
}

/* 優化卡片過渡效果 */
.switch-card-enter-active,
.switch-card-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.switch-card-enter-from,
.switch-card-leave-to {
    opacity: 0;
    transform: translateY(20px) translateZ(0);
}

/* 優化排序列表過渡效果 */
.sortable-list-move {
    transition: transform 0.3s ease;
    transform: translateZ(0);
}

/* 優化拖拽提示過渡效果 */
.drag-prompt-enter-active,
.drag-prompt-leave-active {
    transition: opacity 0.3s ease;
    transform: translateZ(0);
}

.drag-prompt-enter-from,
.drag-prompt-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}

/* 優化按鈕過渡效果 */
.action-button-enter-active,
.action-button-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.action-button-enter-from,
.action-button-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}

/* 優化開關狀態過渡效果 */
.switch-status-enter-active,
.switch-status-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.switch-status-enter-from,
.switch-status-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片內容過渡效果 */
.card-content-enter-active,
.card-content-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-content-enter-from,
.card-content-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}

/* 優化長按效果過渡 */
.long-press-enter-active,
.long-press-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.long-press-enter-from,
.long-press-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化按鈕點擊過渡效果 */
.button-click-enter-active,
.button-click-leave-active {
    transition: all 0.2s ease;
    transform: translateZ(0);
}

.button-click-enter-from,
.button-click-leave-to {
    opacity: 0;
    transform: scale(0.9) translateZ(0);
}

/* 優化開關按鈕過渡效果 */
.switch-button-enter-active,
.switch-button-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.switch-button-enter-from,
.switch-button-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片標題過渡效果 */
.card-title-enter-active,
.card-title-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-title-enter-from,
.card-title-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}

/* 優化卡片描述過渡效果 */
.card-description-enter-active,
.card-description-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-description-enter-from,
.card-description-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}

/* 優化卡片圖標過渡效果 */
.card-icon-enter-active,
.card-icon-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-icon-enter-from,
.card-icon-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片操作按鈕過渡效果 */
.card-actions-enter-active,
.card-actions-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-actions-enter-from,
.card-actions-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}

/* 優化卡片狀態標籤過渡效果 */
.status-tag-enter-active,
.status-tag-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.status-tag-enter-from,
.status-tag-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片拖拽手柄過渡效果 */
.drag-handle-enter-active,
.drag-handle-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.drag-handle-enter-from,
.drag-handle-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片陰影過渡效果 */
.card-shadow-enter-active,
.card-shadow-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-shadow-enter-from,
.card-shadow-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片邊框過渡效果 */
.card-border-enter-active,
.card-border-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-border-enter-from,
.card-border-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片背景過渡效果 */
.card-background-enter-active,
.card-background-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-background-enter-from,
.card-background-leave-to {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
}

/* 優化卡片內容容器過渡效果 */
.card-container-enter-active,
.card-container-leave-active {
    transition: all 0.3s ease;
    transform: translateZ(0);
}

.card-container-enter-from,
.card-container-leave-to {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
}
</style>

<style scoped>
.home-container {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.role-switch {
    position: fixed;
    top: 5px;
    right: 120px;
    z-index: 1000;
    background: white;
    padding: 10px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
}

.role-switch:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.role-label {
    font-size: 14px;
    color: #606266;
    margin-left: 8px;
    font-weight: 500;
}

.main-content {
    display: flex;
    gap: 20px;
    margin-top: 60px;
}

.switch-grid {
    flex: 1;
}

.switch-card {
    margin-bottom: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    position: relative;
}

.switch-content {
    padding: 16px;
    position: relative;
}

.switch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.name-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.switch-name {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-right: 8px;
    position: relative;
    z-index: 3;
}

.switch-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    position: relative;
    z-index: 3;
}

.info-item:last-child {
    margin-bottom: 0;
}

.label {
    color: #909399;
}

.value {
    color: #606266;
}

.status-on {
    color: #67C23A;
}

.sortable-list-container {
    width: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    padding: 16px;
    position: sticky;
    top: 20px;
    height: fit-content;
}

.sortable-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #EBEEF5;
}

.sortable-list-header span {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

.sortable-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

.action-buttons-group {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 12px;
}

.action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    margin: 0;
}

.action-button .el-icon {
    font-size: 16px;
}

.action-button span {
    font-size: 14px;
}

.sortable-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    cursor: grab;
    transition: all 0.3s;
    user-select: none;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    position: relative;
}

.sortable-item:active {
    cursor: grabbing;
}

.sortable-item:hover {
    background-color: #ecf5ff;
    animation: grabEffect 0.5s ease-in-out, grabShadow 0.5s ease-in-out;
}

.sortable-item.dragging {
    opacity: 0.8;
    background-color: #ecf5ff;
    border: 2px dashed #409EFF;
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
    z-index: 1000;
    animation: none;
}

.sortable-item.dragging::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.2));
    border-radius: 4px;
    pointer-events: none;
}

.drag-handle {
    margin-right: 12px;
    color: #909399;
    cursor: grab;
    transition: transform 0.3s;
}

.drag-handle:active {
    cursor: grabbing;
    transform: scale(1.2);
}

/* 移動設備上的觸控效果 */
@media (hover: none) {
    .sortable-item:active {
        background-color: #ecf5ff;
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
    }

    .sortable-item.dragging {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
    }
}

.switch-name {
    flex: 1;
    font-size: 14px;
    color: #303133;
}

.switch-gpio {
    font-size: 12px;
    color: #909399;
    background-color: #f0f2f5;
    padding: 2px 8px;
    border-radius: 10px;
}

/* 移除右側列表相關的樣式 */
.main-content,
.sortable-list-container,
.sortable-list-header {
    display: none;
}

:deep(.el-switch) {
    --el-switch-on-color: #67C23A;
}

:deep(.el-dialog) {
    @media screen and (max-width: 768px) {
        width: 90% !important;
    }
}

:deep(.el-select) {
    width: 100%;
}

:deep(.el-select-dropdown__item.is-disabled) {
    color: #C0C4CC;
    cursor: not-allowed;
}

:deep(.el-select-dropdown__item.is-disabled:hover) {
    background-color: #F5F7FA;
}

@media screen and (max-width: 768px) {
    .home-container {
        padding: 10px;
    }

    .role-switch {
        top: 10px;
        right: 80px;
        padding: 8px 12px;
        transform: scale(0.9);
    }

    .role-label {
        display: none;
    }

    .action-buttons-group {
        right: 10px;
        bottom: 10px;
        flex-direction: column;
        gap: 8px;
    }

    .action-button {
        padding: 8px 12px;
        width: 120px;
        justify-content: center;
    }

    .switch-card {
        margin-bottom: 15px;
    }

    .switch-content {
        padding: 12px;
    }

    .switch-header {
        margin-bottom: 8px;
    }

    .switch-name {
        font-size: 15px;
    }

    .switch-details {
        margin-top: 12px;
        padding-top: 12px;
    }

    .info-item {
        font-size: 13px;
        margin-bottom: 6px;
    }

    /* 優化排序列表在移動設備上的顯示 */
    .sortable-list {
        padding: 8px;
        max-height: 60vh;
    }

    .sortable-item {
        padding: 12px;
        font-size: 14px;
    }

    .drag-handle {
        margin-right: 8px;
        font-size: 16px;
    }

    .switch-gpio {
        font-size: 12px;
        padding: 2px 6px;
    }

    /* 優化對話框在移動設備上的顯示 */
    :deep(.el-dialog) {
        width: 90% !important;
        margin: 5vh auto !important;
    }

    :deep(.el-dialog__body) {
        padding: 15px;
    }

    :deep(.el-form-item) {
        margin-bottom: 15px;
    }

    /* 優化開關按鈕在移動設備上的觸控區域 */
    :deep(.el-switch) {
        transform: scale(1.2);
    }

    /* 優化按鈕在移動設備上的觸控區域 */
    .edit-button {
        padding: 8px;
    }

    .delete-button {
        padding: 8px 12px;
    }

    /* 優化卡片在移動設備上的交互 */
    .switch-card {
        touch-action: manipulation;
    }

    .switch-card:active {
        transform: scale(0.98);
    }

    /* 優化排序列表在移動設備上的交互 */
    .sortable-item {
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
    }

    .sortable-item:active {
        transform: scale(1.02);
    }

    /* 優化拖拽手柄在移動設備上的交互 */
    .drag-handle {
        touch-action: none;
    }

    /* 優化按鈕在移動設備上的點擊效果 */
    .action-button:active {
        transform: scale(0.95);
    }

    /* 優化卡片內容在移動設備上的顯示 */
    .card-content {
        padding: 10px;
    }

    /* 優化狀態標籤在移動設備上的顯示 */
    .status-tag {
        padding: 2px 6px;
        font-size: 12px;
    }
}
</style>