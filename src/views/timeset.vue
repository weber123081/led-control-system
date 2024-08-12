<template>
    <div class="content" id="content">
        <div class="form">
            <form id="form-body">
                <div class="column">
                    <div class="aisle1">第一排走道On</div>
                    <label for="time1">設定時間:</label>
                    <input type="time" id="time1" name="time1" @change="updateFormParams" :disabled="!hasPermission" />
                    <br><br>
                    <div class="aisle1">第二排走道On</div>
                    <label for="time2">設定時間:</label>
                    <input type="time" id="time2" name="time2" @change="updateFormParams" :disabled="!hasPermission" />
                    <br><br>
                    <div class="aisle1">第三排走道On</div>
                    <label for="time3">設定時間:</label>
                    <input type="time" id="time3" name="time3" @change="updateFormParams" :disabled="!hasPermission" />
                    <br><br>
                </div>
                <div class="column">
                    <div class="aisle2">第一排走道Off</div>
                    <label for="time4">設定時間:</label>
                    <input type="time" id="time4" name="time4" @change="updateFormParams" :disabled="!hasPermission" />
                    <br><br>
                    <div class="aisle2">第二排走道Off</div>
                    <label for="time5">設定時間:</label>
                    <input type="time" id="time5" name="time5" @change="updateFormParams" :disabled="!hasPermission" />
                    <br><br>
                    <div class="aisle2">第三排走道Off</div>
                    <label for="time6">設定時間:</label>
                    <input type="time" id="time6" name="time6" @change="updateFormParams" :disabled="!hasPermission" />
                    <br><br>
                </div>
                <!-- 提交表单按钮 -->
                <button class="button" type="button" @click="submitForm" style="margin-left: 50%;"
                    :disabled="!hasPermission">
                    確認
                </button>
            </form>
        </div>
        <h3>晶片時間:</h3>
        <!-- 显示 ESP8266 的时间 -->
        <p class="esp8266time" v-if="esp8266Time">{{ esp8266Time }}</p>
        <p class="esp8266time" v-else>Loading...</p>
    </div>
</template>
<script>
export default {
    data() {
        return {
            esp8266Time: '',  // 用于存储来自 ESP8266 的时间
            formData: {
                time1: '',
                time2: '',
                time3: '',
                time4: '',
                time5: '',
                time6: ''
            },
            intervalId: null, // 用于存储定时器 ID
            hasPermission: false, // 存储是否有权限的状态
            userName: '', // 存储当前登录的用户名
            ipAddress: '192.168.50.1' // 假设IP地址已知并存储在此处
        };
    },
    mounted() {
        this.getTimeFromESP8266();
        this.getFormDataFromServer(); // 在组件挂载时加载表单数据
        this.intervalId = setInterval(this.getTimeFromESP8266, 1000);
        this.checkPermission();
        this.fetchUserInfo();
    },
    methods: {
        // 从 ESP8266 获取时间
        getTimeFromESP8266() {
            fetch("http://192.168.50.242/time")
                .then(response => response.text())
                .then(data => {
                    this.esp8266Time = data;
                })
                .catch(error => {
                    console.log("Error: " + error);
                    this.esp8266Time = 'N/A';
                });
        },
        // 更新表单参数
        updateFormParams(event) {
            const input = event.target;
            this.formData[input.name] = input.value;
        },
        // 提交表单
        submitForm() {
            if (!this.hasPermission) {
                alert("您没有权限执行此操作！");
                return;
            }

            const formData = new URLSearchParams(this.formData).toString();

            fetch('http://192.168.50.242/timeset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            })
                .then(response => response.text())
                .then(text => {
                    alert("設定成功");
                    this.logAction('時間設定', this.userName, this.getTaiwanISOTime(), '更新時間設定', this.ipAddress);
                    this.getFormDataFromServer();
                })
                .catch(error => {
                    console.error(error);
                });
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
                        action: action,
                        ip: ip
                    })
                });
                if (!response.ok) {
                    throw new Error('記錄失敗');
                }
                console.log('記錄成功');
            } catch (error) {
                console.error(`記錄錯誤：${error}`);
            }
        },
        // 从服务器获取表单数据
        async getFormDataFromServer() {
            try {
                const response = await fetch('http://192.168.50.242/get_timeset');
                if (!response.ok) {
                    throw new Error('取得表單資料失敗');
                }
                const formDataJson = await response.json();
                this.formData = formDataJson;

                // 更新表单中的输入框值
                for (let i = 1; i <= 6; i++) {
                    document.getElementById(`time${i}`).value = this.formData[`time${i}`];
                }
            } catch (error) {
                console.error(`取得表單資料錯誤：${error}`);
            }
        },
        // 检查用户权限
        async checkPermission() {
            try {
                const response = await fetch('http://192.168.50.242/function2');
                if (!response.ok) {
                    throw new Error('網絡響應異常');
                }
                const data = await response.json();
                this.hasPermission = data.function2 === 1;
                if (!this.hasPermission) {
                    alert("您没有权限执行此操作！");
                }
            } catch (error) {
                console.error(`錯誤：${error}`);
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

            const [date, time] = currentTime.toLocaleString('en-GB', options).split(', ');
            const [day, month, year] = date.split('/');
            return `${year}-${month}-${day},${time}`;
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
        }
    },
    beforeUnmount() {
        clearInterval(this.intervalId);
    }
};
</script>
<style scoped>
.aisle1,
.aisle2 {
    margin-top: 0;
    text-align: left;
    font-family: 'Stick', sans-serif;
    font-size: 30px;
}

.column {
    margin-top: 30px;
    margin-right: 10px;
    margin-left: 110px;
    display: inline-block;
    vertical-align: top;
}

body {
    background-color: #fff;
    font-family: 'Stick', sans-serif;
}

input[type="time"] {
    background-color: #f0f0f0;
    border: none;
    border-radius: 5px;
    color: #333;
    font-size: 16px;
    padding: 10px;
}

.container {
    justify-content: space-between;
    align-items: center;
}

.button {
    background-color: #000;
    color: #fff;
    padding: 15px 32px;
    text-align: center;
    font-size: 16px;
    margin: 4px 2px;
    margin-top: 0;
    cursor: pointer;
    border: none;
    border-radius: 50px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px);
    min-width: 100px;
    display: block;
}

.button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button:hover {
    background-color: #fff;
    color: #000;
}

.esp8266time {
    position: fixed;
    bottom: 0;
    height: 45px;
    left: 340px;
}

h3 {
    position: fixed;
    bottom: 0;
    height: 50px;
    left: 210px;
}

.content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    font-family: 'Stick', sans-serif;
    font-size: 30px;
    position: absolute;
    top: 55px;
    left: 200px;
    width: calc(100% - 200px);
    height: calc(100% - 55px);
    background-color: #696969;
    color: #fff;
}

.form {
    width: 100%;
}
</style>
