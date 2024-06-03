<template>
    <div class="content" id="content">
        <div class="form">
            <form id="form-body">
                <div class="column">
                    <div class="aisle1">第一排走道On</div>
                    <label for="time1">設定時間:</label>
                    <input type="time" id="time1" name="time1" @change="updateFormParams">
                    <br><br>
                    <div class="aisle1">第二排走道On</div>
                    <label for="time2">設定時間:</label>
                    <input type="time" id="time2" name="time2" @change="updateFormParams">
                    <br><br>
                    <div class="aisle1">第三排走道On</div>
                    <label for="time3">設定時間:</label>
                    <input type="time" id="time3" name="time3" @change="updateFormParams">
                    <br><br>
                </div>
                <div class="column">
                    <div class="aisle2">第一排走道Off</div>
                    <label for="time4">設定時間:</label>
                    <input type="time" id="time4" name="time4" @change="updateFormParams">
                    <br><br>
                    <div class="aisle2">第二排走道Off</div>
                    <label for="time5">設定時間:</label>
                    <input type="time" id="time5" name="time5" @change="updateFormParams">
                    <br><br>
                    <div class="aisle2">第三排走道Off</div>
                    <label for="time6">設定時間:</label>
                    <input type="time" id="time6" name="time6" @change="updateFormParams">
                    <br><br>
                </div>
                <!-- 提交表單按鈕 -->
                <button class="button" type="button" @click="submitForm" style="margin-left: 50%;">確認</button>
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
            esp8266Time: '',  // 用來儲存從 ESP8266 獲取的時間
            formData: {
                time1: '',
                time2: '',
                time3: '',
                time4: '',
                time5: '',
                time6: ''
            },
            // 存儲定時器 ID
            intervalId: null
        };
    },
    mounted() {
        this.getTimeFromESP8266();
        this.loadFormData(); // 在組件掛載時載入表單資料
        this.intervalId = setInterval(this.getTimeFromESP8266, 1000);
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
                })
                .catch(error => {
                    console.error(error);
                });
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
        }
    },
    beforeUnmount() {
        // 清除定時器
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