<template>
    <div class="led">
        <!-- 为每个 URL 渲染一个开关容器 -->
        <div class="switch-container" v-for="(url, index) in urls" :key="index">
            <label :name="'switch' + (index + 1)">
                <!-- 创建一个开关勾选框并将其绑定到 switches 数组 -->
                <input type="checkbox" class="l" v-model="switches[index]" @change="updateSwitch(index)"
                    :disabled="!hasPermission">
            </label>
            <!-- 显示开关的状态 -->
            <span class="status">{{ switches[index] ? (labels[index] + '走道On') : (labels[index] + '走道Off') }}</span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            switches: [false, false, false], // 用于存储每个开关的状态（开/关）
            urls: ['http://192.168.50.242/gpio3', 'http://192.168.50.242/gpio5', 'http://192.168.50.242/gpio7'], // 每个开关与 ESP8266 交互的 URL
            labels: ['第一排', '第二排', '第三排'], // 每个开关的标签
            controllers: [], // 存储每个开关的 AbortController
            intervals: [], // 用于存储每个开关的定时器 ID
            function1: null, // 存储 function1 的值
            hasPermission: false, // 存储是否有权限的状态
            userName: '', // 存储当前登录的用户名
            ipAddress: '192.168.50.1' // 假设IP地址已知并在此处存储
        };
    },
    methods: {
        async updateSwitch(index) {
            if (this.hasPermission) {
                const isChecked = this.switches[index];
                const state = isChecked ? 'on' : 'off';
                const updateUrl = `http://192.168.50.242/gpio?pin=${index * 2 + 3}&state=${state}`;
                try {
                    const controller = new AbortController();
                    this.controllers[index] = controller;
                    const response = await fetch(updateUrl, { signal: controller.signal });
                    if (!response.ok) {
                        throw new Error('网络响应异常');
                    }

                    // 记录日志
                    await this.logAction('電源開關', this.userName, this.getTaiwanISOTime(), this.labels[index] + state, this.ipAddress);
                } catch (error) {
                    console.error(`错误：${error}`);
                }
            } else {
                alert('您没有权限执行此操作！');
            }
        },
        async updateStatus(index) {
            try {
                const controller = new AbortController();
                this.controllers[index] = controller;
                const response = await fetch(this.urls[index], { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('网络响应异常');
                }
                const data = await response.json();
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
                this.function1 = newFunction1Value;
                this.hasPermission = this.function1 === 1;
                if (!this.hasPermission) {
                    alert('您没有权限执行此操作！');
                    throw new Error('没有权限');
                }
            } catch (error) {
                console.error(`错误：${error}`);
            }
        },
        async fetchUserInfo() {
            try {
                const response = await fetch('http://192.168.50.242/get_user_info');
                if (!response.ok) {
                    throw new Error('网络响应异常');
                }
                const data = await response.json();
                this.userName = data.name;
            } catch (error) {
                console.error(`获取用户信息错误：${error}`);
            }
        },
        async logAction(functionName, username, date, action, ip) {
            try {
                const response = await fetch('http://192.168.50.242/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        function: functionName,
                        username: username,
                        date: date,
                        action: JSON.stringify(action),
                        ip: ip
                    })
                });
                if (!response.ok) {
                    throw new Error('日志记录失败');
                }
                console.log('日志记录成功');
            } catch (error) {
                console.error(`日志记录错误：${error}`);
            }
        },
        getTaiwanISOTime() {
            const currentTime = new Date();
            const options = {
                timeZone: 'Asia/Taipei',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };

            // 使用toLocaleString获取台湾时间字符串
            const [date, time] = currentTime.toLocaleString('en-GB', options).split(', ');
            const [day, month, year] = date.split('/');
            const taiwanTime = `${year}-${month}-${day},${time}`;

            // 返回ISO 8601格式的字符串
            return taiwanTime;
        }
    },
    async mounted() {
        await this.checkPermission();
        await this.fetchUserInfo(); // 获取用户信息

        this.urls.forEach((url, index) => {
            this.updateStatus(index);
            const intervalId = setInterval(() => {
                this.updateStatus(index);
            }, 1000);
            this.intervals.push(intervalId);
        });
    },
    beforeUnmount() {
        this.controllers.forEach(controller => {
            if (controller) {
                controller.abort();
            }
        });
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
