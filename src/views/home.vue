<template>
    <div class="led">
        <!-- 為每個 URL 渲染一個開關容器 -->
        <div class="switch-container" v-for="(url, index) in urls" :key="index">
            <label :name="'switch' + (index + 1)">
                <!-- 創建一個開關勾選框並將其綁定到 switches 陣列 -->
                <input type="checkbox" class="l" v-model="switches[index]" @change="updateSwitch(index)"
                    :disabled="!hasPermission">
            </label>
            <!-- 顯示開關的狀態 -->
            <span class="status">{{ switches[index] ? (labels[index] + '走道On') : (labels[index] + '走道Off') }}</span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 用于存储每个开关的状态（开/关）
            switches: [false, false, false],
            // 每个开关与 ESP8266 交互的 URL
            urls: ['http://192.168.50.242/gpio3', 'http://192.168.50.242/gpio5', 'http://192.168.50.242/gpio7'],
            // 每个开关的标签
            labels: ['第一排', '第二排', '第三排'],
            // 存储每个开关的 AbortController
            controllers: [],
            // 用于存储每个开关的定时器 ID
            intervals: [],
            // 存储 function1 的值
            function1: null,
            // 存储是否有权限的状态
            hasPermission: false,
        };
    },
    methods: {
        async updateSwitch(index) {
            // 检查用户是否具有执行操作的权限（仅当 function1 的值为 1 时才允许操作）
            if (this.hasPermission) {
                // 获取开关的当前状态
                const isChecked = this.switches[index];
                // 确定发送到 ESP8266 的状态（开/关）
                const state = isChecked ? 'on' : 'off';
                // 构建带有引脚和状态参数的 URL
                const updateUrl = `http://192.168.50.242/gpio?pin=${index * 2 + 3}&state=${state}`;
                try {
                    // 发送请求更新开关状态
                    const controller = new AbortController();
                    this.controllers[index] = controller;
                    const response = await fetch(updateUrl, { signal: controller.signal });
                    if (!response.ok) {
                        throw new Error('网络响应异常');
                    }
                } catch (error) {
                    console.error(`错误：${error}`);
                }
            } else {
                // 没有权限，直接跳出提示框
                alert('您没有权限执行此操作！');
            }
        },
        async updateStatus(index) {
            try {
                // 发送请求获取开关的当前状态
                const controller = new AbortController();
                this.controllers[index] = controller;
                const response = await fetch(this.urls[index], { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('网络响应异常');
                }
                // 解析响应以获取状态数据
                const data = await response.json();
                // 根据响应更新开关状态
                this.switches[index] = data.state === 'on';
            } catch (error) {
                console.error(`错误：${error}`);
            }
        },
        async checkPermission() {
            try {
                const response = await fetch('http://192.168.50.242/function1');
                if (!response.ok) {
                    throw new Error('网络响应异常');
                }
                const data = await response.json();
                const newFunction1Value = data.function1;
                // 将新的 function1 值更新到组件的状态中
                this.function1 = newFunction1Value;
                // 更新权限状态
                this.hasPermission = this.function1 === 1;
                // 如果没有权限，直接跳出
                if (!this.hasPermission) {
                    alert('您没有权限执行此操作！');
                    throw new Error('没有权限');
                }
            } catch (error) {
                console.error(`错误：${error}`);
            }
        },
    },
    async mounted() {
        // 检查用户权限
        await this.checkPermission();

        // 组件挂载时更新每个开关的状态
        this.urls.forEach((url, index) => {
            this.updateStatus(index);
            // 设置间隔定期更新开关状态
            const intervalId = setInterval(() => {
                this.updateStatus(index);
            }, 1000);
            this.intervals.push(intervalId);
        });
    },
    beforeUnmount() {
        // 组件卸载时取消所有请求
        this.controllers.forEach(controller => {
            if (controller) {
                controller.abort();
            }
        });
        // 清除定时器
        this.intervals.forEach(interval => clearInterval(interval));
    }
};
</script>


<style scoped>
.switch-container .status {
    font-size: 30px;
    color: #000000;
    font-family: 'Potta One', cursive;
}

.switch-container {
    width: calc(33.33%);
    align-items: flex-start;
    margin-top: 30px;
    margin-bottom: 5px;
}

/* 開關樣式 */
.l {
    display: block;
    margin-bottom: 1.5em;
    font-size: 1em;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 0.75em;
    box-shadow: 0.125em 0.125em 0 0.125em rgba(0, 0, 0, 0.3) inset;
    color: #fdea7b;
    display: inline-flex;
    align-items: center;
    margin: auto;
    padding: 0.15em;
    width: 3em;
    height: 1.5em;
    transition: background-color 0.1s 0.3s ease-out, box-shadow 0.1s 0.3s ease-out;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

/* 開關樣式的擬元素 */
.l:before,
.l:after {
    content: "";
    display: block;
}

.l:before {
    background-color: #d7d7d7;
    border-radius: 50%;
    width: 1.2em;
    height: 1.2em;
    transition: background-color 0.1s 0.3s ease-out, transform 0.3s ease-out;
    z-index: 1;
}

.l:after {
    background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.15) 0) 0 50% / 50% 100%,
        repeating-linear-gradient(90deg, #bbb 0, #bbb, #bbb 20%, #999 20%, #999 40%) 0 50% / 50% 100%,
        radial-gradient(circle at 50% 50%, #888 25%, transparent 26%);
    background-repeat: no-repeat;
    border: 0.25em solid transparent;
    border-left: 0.4em solid #d8d8d8;
    border-right: 0 solid transparent;
    transition: border-left-color 0.1s 0.3s ease-out, transform 0.3s ease-out;
    transform: translateX(-22.5%);
    transform-origin: 25% 50%;
    width: 1.2em;
    height: 1em;
    box-sizing: border-box;
}

/* 選中狀態的開關樣式 */
.l:checked {
    background-color: rgba(0, 0, 0, 0.45);
    box-shadow: 0.125em 0.125em 0 0.125em rgba(0, 0, 0, 0.1) inset;
}

.l:checked:before {
    background-color: currentColor;
    transform: translateX(125%)
}

.l:checked:after {
    border-left-color: currentColor;
    transform: translateX(-2.5%) rotateY(180deg);
}

/* 移除焦點輪廓 */
.l:focus {
    outline: 0;
}

/* 主容器樣式 */
.led {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    font-family: 'Stick', sans-serif;
    font-size: 50px;
    position: absolute;
    top: 55px;
    left: 200px;
    width: calc(100% - 200px);
    height: calc(100% - 55px);
    background-color: #696969;
    color: #ffffff;
}
</style>
