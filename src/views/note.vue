<template>
    <div class="alarms-container">
        <div v-for="(alarm, index) in alarms" :key="index" class="alarm-card">
            <div class="alarm-header">
                <div class="time">
                    <input type="time" v-model="alarm.time" class="time-input" @change="handleTimeChange(index)"
                        :disabled="!hasPermission" />
                    <span class="period">{{ alarm.period }}</span>
                </div>
                <div class="toggle-switch">
                    <input type="checkbox" :id="'alarmToggle' + index" v-model="alarm.alarmOn"
                        @change="handleToggleChange(index)" :disabled="!hasPermission" />
                    <label :for="'alarmToggle' + index"></label>
                </div>
            </div>
            <div class="alarm-info">
                <span class="next-alarm">⏰ {{ alarm.nextAlarm || '尚未設定' }}</span>
                <span class="alarm-label">{{ alarm.label }}</span>
            </div>
        </div>
    </div>
    <div class="chip-time-container">
        <h3>晶片時間:</h3>
        <p class="chip-time" v-if="esp8266Time">{{ esp8266Time }}</p>
        <p class="chip-time" v-else>Loading...</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            alarms: [
                { label: '第一排走道ON', time: '', alarmOn: false, nextAlarm: '', period: '上午' },
                { label: '第二排走道ON', time: '', alarmOn: false, nextAlarm: '', period: '上午' },
                { label: '第三排走道ON', time: '', alarmOn: false, nextAlarm: '', period: '上午' },
                { label: '第一排走道OFF', time: '', alarmOn: false, nextAlarm: '', period: '上午' },
                { label: '第二排走道OFF', time: '', alarmOn: false, nextAlarm: '', period: '上午' },
                { label: '第三排走道OFF', time: '', alarmOn: false, nextAlarm: '', period: '上午' },
            ],
            esp8266Time: '',  // 存储ESP8266的时间
            hasPermission: true, // 权限状态
            userName: '',
            ipAddress: '192.168.50.1',
            intervalId: null, // 存储定时器ID
        };
    },
    mounted() {
        this.getFormDataFromServer();
        this.getTimeFromESP8266();
        this.checkPermission();
        this.fetchUserInfo();
        this.startInterval();
    },
    beforeUnmount() {
        clearInterval(this.intervalId); // 在组件卸载前清理定时器
    },
    methods: {
        startInterval() {
            this.updateAllAlarms();
            this.intervalId = setInterval(this.getTimeFromESP8266, 1000); // 每秒更新一次时间
        },

        updateAllAlarms() {
            this.alarms.forEach((alarm, index) => {
                this.calculateNextAlarm(index);
            });
        },

        calculateNextAlarm(index) {
            const alarm = this.alarms[index];
            if (!alarm.time) {
                alarm.nextAlarm = '尚未設定';
                return;
            }

            const now = new Date();
            const [hours, minutes] = alarm.time.split(':').map(Number);
            let alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

            if (alarmTime < now) {
                alarmTime.setDate(alarmTime.getDate() + 1);
            }

            const diff = alarmTime - now;
            const hoursDiff = Math.floor(diff / (1000 * 60 * 60));
            const minutesDiff = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            alarm.nextAlarm = `在 ${hoursDiff} 小时 ${minutesDiff} 分钟`;
        },

        handleTimeChange(index) {
            this.updateAlarm(index);
            this.calculateNextAlarm(index);
            this.logAction('時間設定', this.userName, this.getTaiwanISOTime(), `更新時間 ${index + 1}`, this.ipAddress);
        },

        handleToggleChange(index) {
            const alarm = this.alarms[index];
            if (!alarm.alarmOn) {
                alarm.time = '';
            }
            this.updateAlarm(index);
            this.calculateNextAlarm(index);
            this.logAction('開關狀態', this.userName, this.getTaiwanISOTime(), `切換開關 ${index + 1} 到 ${alarm.alarmOn ? '開啟' : '關閉'}`, this.ipAddress);
        },

        updateAlarm(index) {
            const alarm = this.alarms[index];
            const formData = new URLSearchParams({
                [`time${index + 1}`]: alarm.time || '',
                alarmOn: alarm.alarmOn,
            }).toString();

            fetch('/update_alarm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            })
                .then(response => response.text())
                .then(text => {
                    console.log("闹钟数据更新成功");
                })
                .catch(error => {
                    console.error("更新闹钟数据时出错：", error);
                });
        },

        async logAction(functionName, username, date, action, ip) {
            try {
                const response = await fetch('/logs', {
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

        getTimeFromESP8266() {
            fetch("/time")
                .then(response => response.text())
                .then(data => {
                    this.esp8266Time = data;
                })
                .catch(error => {
                    console.log("Error: " + error);
                    this.esp8266Time = 'N/A';
                });
        },

        async getFormDataFromServer() {
            try {
                const response = await fetch('/get_timeset');
                if (!response.ok) {
                    throw new Error('取得表單資料失敗');
                }
                const formDataJson = await response.json();
                this.alarms = this.alarms.map((alarm, index) => ({
                    ...alarm,
                    time: formDataJson[`time${index + 1}`] || '',
                    nextAlarm: formDataJson[`nextAlarm${index + 1}`] || '',
                    alarmOn: formDataJson[`alarmOn${index + 1}`] === 'true',
                }));
                this.updateAllAlarms();
            } catch (error) {
                console.error(`取得表單資料錯誤：${error}`);
            }
        },

        async checkPermission() {
            try {
                const response = await fetch('/function2');
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

        async fetchUserInfo() {
            try {
                const response = await fetch('/get_user_info');
                if (!response.ok) {
                    throw new Error('网络响应异常');
                }
                const data = await response.json();
                this.userName = data.name;
            } catch (error) {
                console.error(`获取用户信息错误：${error}`);
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
        }
    }
};
</script>

<style scoped>
.alarms-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    /* 间距自动平分 */
    padding: 20px;
    gap: 10px;
    /* 卡片之间的间距 */
}

.alarm-card {
    flex: 1 1 calc(33.333% - 40px);
    /* 三列布局，每列占据1/3减去间距 */
    max-width: calc(33.333% - 40px);
    /* 确保每列的最大宽度 */
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    /* 包含padding和border在宽度计算中 */
    margin-top: 45px;
}

.alarm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
}

.time {
    display: flex;
    align-items: baseline;
    font-size: 36px;
    /* 调整字体大小 */
    font-weight: bold;
    color: #555;
}

.period {
    font-size: 14px;
    /* 调整时间段的字体大小 */
    color: #999;
    margin-left: 5px;
}

.toggle-switch {
    position: relative;
}

.toggle-switch input {
    display: none;
}

.toggle-switch label {
    width: 30px;
    /* 缩小开关的宽度 */
    height: 15px;
    /* 缩小开关的高度 */
    background-color: #ccc;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    display: inline-block;
    transition: background-color 0.3s;
}

.toggle-switch label:before {
    content: '';
    width: 13px;
    /* 缩小开关滑块的宽度 */
    height: 13px;
    /* 缩小开关滑块的高度 */
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: left 0.3s;
}

.toggle-switch input:checked+label {
    background-color: #4caf50;
    /* 开启状态下的背景色 */
}

.toggle-switch input:checked+label:before {
    left: 16px;
    /* 调整开关滑块的位置 */
}


.alarm-info {
    margin-bottom: 10px;
    text-align: center;
    color: #555;
    font-size: 12px;
    /* 调整文本信息的字体大小 */
}

.next-alarm {
    display: block;
    margin-bottom: 5px;
    color: #999;
}

.alarm-label {
    font-size: 18px;
    /* 调整标签的字体大小 */
    font-weight: bold;
    color: #555;
    margin-top: 5px;
}

.time-input {
    border: none;
    background: none;
    font-size: 36px;
    /* 调整时间输入框的字体大小 */
    font-weight: bold;
    color: #555;
    text-align: center;
    outline: none;
}

.chip-time-container {
    text-align: center;
    margin-top: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chip-time {
    font-size: 18px;
    color: #333;
}
</style>
