<template>
    <div class="content" id="content">
        <div class="form">
            <form id="form-body">
                <div class="column">
                    <div class="aisle1">第一排走道On</div>
                    <label for="time1">設定時間:</label>
                    <input type="time" id="time1" name="time1" @change="updateFormParams" :disabled="!hasPermission">
                    <br><br>
                    <div class="aisle1">第二排走道On</div>
                    <label for="time2">設定時間:</label>
                    <input type="time" id="time2" name="time2" @change="updateFormParams" :disabled="!hasPermission">
                    <br><br>
                    <div class="aisle1">第三排走道On</div>
                    <label for="time3">設定時間:</label>
                    <input type="time" id="time3" name="time3" @change="updateFormParams" :disabled="!hasPermission">
                    <br><br>
                </div>
                <div class="column">
                    <div class="aisle2">第一排走道Off</div>
                    <label for="time4">設定時間:</label>
                    <input type="time" id="time4" name="time4" @change="updateFormParams" :disabled="!hasPermission">
                    <br><br>
                    <div class="aisle2">第二排走道Off</div>
                    <label for="time5">設定時間:</label>
                    <input type="time" id="time5" name="time5" @change="updateFormParams" :disabled="!hasPermission">
                    <br><br>
                    <div class="aisle2">第三排走道Off</div>
                    <label for="time6">設定時間:</label>
                    <input type="time" id="time6" name="time6" @change="updateFormParams" :disabled="!hasPermission">
                    <br><br>
                </div>
                <!-- 提交表單按鈕 -->
                <button class="button" type="button" @click="submitForm" style="margin-left: 50%;"
                    :disabled="!hasPermission">確認</button>
            </form>
        </div>
        <h3>晶片時間:</h3>
        <!-- 顯示 ESP8266 的時間 -->
        <p class="esp8266time" v-if="esp8266Time">{{ esp8266Time }}</p>
        <p class="esp8266time" v-else>Loading...</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            esp8266Time: '',  // 用来存储从 ESP8266 获取的时间
            formData: {
                time1: '',
                time2: '',
                time3: '',
                time4: '',
                time5: '',
                time6: ''
            },
            // 存储定时器 ID
            intervalId: null,
            // 存储是否有权限的状态
            hasPermission: false,
            userName: '', // 存储当前登录的用户名
            ipAddress: '192.168.50.1' // 假设IP地址已知并在此处存储
        };
    },
    mounted() {
        this.getTimeFromESP8266();
        this.loadFormData(); // 在组件挂载时加载表单数据
        this.intervalId = setInterval(this.getTimeFromESP8266, 1000);
        // 检查用户权限
        this.checkPermission();
        this.fetchUserInfo();
    },
    methods: {
        // 從 ESP8266 獲取時間
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
        // 更新表單參數
        updateFormParams(event) {
            const input = event.target;
            this.formData[input.name] = input.value;
            this.saveFormData(); // 更新表單數據後保存到本地存儲
        },
        // 提交表單
        submitForm() {
            // 检查用户权限
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
                    alert("设置成功");
                    // 在设置成功后记录日志
                    this.logAction('時間設定', this.userName, this.getTaiwanISOTime(), '更新時間設定', this.ipAddress);
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
        // 將表單數據保存到本地存儲
        saveFormData() {
            localStorage.setItem('formData', JSON.stringify(this.formData));
        },
        // 從本地存儲載入表單數據
        loadFormData() {
            const formDataStr = localStorage.getItem('formData');
            if (formDataStr) {
                this.formData = JSON.parse(formDataStr);
                // 更新表單中的輸入框值
                for (let i = 1; i <= 6; i++) {
                    document.getElementById(`time${i}`).value = this.formData[`time${i}`];
                }
            }
        },
        // 檢查使用者權限
        async checkPermission() {
            try {
                const response = await fetch('http://192.168.50.242/function2');
                if (!response.ok) {
                    throw new Error('網絡響應異常');
                }
                const data = await response.json();
                const newFunction2Value = data.function2;
                // 更新權限狀態
                this.hasPermission = newFunction2Value === 1;
                // 如果没有权限，弹出警告
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

            // 使用toLocaleString获取台湾时间字符串
            const [date, time] = currentTime.toLocaleString('en-GB', options).split(', ');
            const [day, month, year] = date.split('/');
            const taiwanTime = `${year}-${month}-${day},${time}`;

            // 返回ISO 8601格式的字符串
            return taiwanTime;
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
        // 清除定时器
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
    background-color: rgb(255, 255, 255);
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
    background-color: #000000;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    margin: 4px 2px;
    margin-top: 0px;
    cursor: pointer;
    border: none;
    border-radius: 50px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px);
    min-width: 100px;
    display: block;
}

.button:active {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button:hover {
    background-color: #fff;
    color: #000000;
}

.marquee div {
    display: block;
    width: 100%;
    height: 70px;
    position: relative;
    left: 100%;
    overflow: hidden;
    animation: marquee 5s linear infinite;
    font-size: 30px;
    margin-top: 0px;
}

@keyframes marquee {
    0% {
        left: 100%;
    }

    100% {
        left: 0;
    }
}

#loading {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#loading img {
    width: 100%;
    height: 100%;
}

.esp8266time {
    position: fixed;
    bottom: 0%;
    height: 45px;
    left: 340px;
}

h3 {
    position: fixed;
    bottom: 0%;
    height: 50px;
    left: 210px;
}

.top {
    position: fixed;
    top: 10px;
    right: 0px;
    width: 100%;
}

.cutdown {
    position: fixed;
    bottom: 0%;
    height: 20px;
    width: 100%;
    text-align: right;
    right: 3px;
    background-color: #939699;
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
    color: #ffffff;
}

.form {
    width: 100%;
}
</style>