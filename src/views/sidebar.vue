<template>
    <!-- 標頭 -->
    <div class="header">
        <h1>5F資訊智慧開關</h1>
    </div>
    <!-- 用戶資訊 -->
    <div id="user-info"></div>
    <!-- 登出按鈕 -->
    <button id="logout-btn" @click="logout">登出</button>
    <!-- 使用者資訊組件 -->
    <UserInfo :loggedIn="loggedIn" :userName="name" />
    <!-- 隱藏的按鈕區塊 -->
    <div class="none">
        <div class="input">
            <!-- 帳號權限連結 -->
            <router-link to="/userroles">
                <button class="value">
                    <iconroles />
                    <a>
                        帳號權限
                    </a>
                </button>
            </router-link>
            <router-link to="/timeset">
                <!-- 時間設定連結 -->
                <button class="value">
                    <icontimeset />
                    <a>
                        時間設定
                    </a>
                </button>
            </router-link>
            <router-link to="/history">
                <!-- 紀錄查詢連結 -->
                <button class="value">
                    <iconhistory />
                    <a>
                        紀錄查詢
                    </a>
                </button>
            </router-link>
            <router-link to="/home">
                <!-- 回首頁連結 -->
                <button class="value">
                    <iconhome />
                    <a>
                        回首頁
                    </a>
                </button>
            </router-link>
            <a href="/restart" @click.prevent="restartESP8266">
                <!-- 重新開機按鈕 -->
                <button class="value">
                    <iconreset />
                    重新開機
                </button>
            </a>
        </div>
    </div>
</template>

<script setup>
import iconroles from '../components/icons/iconroles.vue'
import icontimeset from '../components/icons/icontimeset.vue'
import iconhistory from '../components/icons/iconhistory.vue'
import iconhome from '../components/icons/iconhome.vue'
import iconreset from '../components/icons/iconreset.vue'
</script>

<script>
// 直接在這裡聲明 `UserInfo` 組件
const UserInfo = {
    props: ['loggedIn', 'userName'],
    template: `
        <div>
            <p>Logged In: {{ loggedIn }}</p>
            <p>User Name: {{ userName }}</p>
        </div>
    `
};

export default {
    data() {
        return {
            loggedIn: false,
            name: ''
        };
    },
    methods: {
        // 重新開機方法
        restartESP8266() {
            // 發送重新開機請求到 ESP8266
            fetch('http://192.168.50.242/restart')
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    // 可以在這裡處理成功後的邏輯
                })
                .catch(error => {
                    console.error('錯誤：', error);
                    // 可以在這裡處理錯誤的邏輯
                });
        },
        // 登出方法
        logout() {
            // 向服务器发送登出请求
            fetch('http://192.168.50.242/logout', {
                method: 'POST'
            })
                .then(response => {
                    if (response.ok) {
                        alert('已登出'); // 登出成功后显示警告消息
                        window.location.href = '/login'; // 重定向到登录页面
                    } else {
                        throw new Error('登出失败');
                    }
                })
                .catch(error => {
                    console.error('错误：', error);
                });
        }
    },
    mounted() {
        // 獲取用戶信息
        fetch('http://192.168.50.242/get_user_info')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('獲取用戶信息時出錯');
                }
            })
            .then(data => {
                const userInfoElem = document.getElementById('user-info');
                if (data.loggedIn) {
                    // 如果用戶已登入
                    this.loggedIn = true;
                    this.name = data.name;
                    userInfoElem.textContent = '登入人員: ' + data.name;
                    document.getElementById('logout-btn').style.display = 'inline';
                } else {
                    // 如果用戶未登入
                    this.loggedIn = false;
                    userInfoElem.textContent = '未登入';
                    document.getElementById('logout-btn').style.display = 'none';
                }
            })
            .catch(error => {
                console.error(`錯誤：${error.message}`);
            });

        var userIsActive = false; // 初始化用戶活動狀態為false
        var inactivityTimeout = 15 * 60 * 1000; // 15分鐘（以毫秒為單位）
        var activityTimer;

        // 開始記錄用戶活動時間
        const startActivityTimer = () => {
            userIsActive = true; // 用戶活動狀態為true
            clearTimeout(activityTimer); // 清除之前的計時器
            activityTimer = setTimeout(this.performLogoutAndRedirect, inactivityTimeout);
        };

        // 監測用戶的活動
        document.addEventListener('mousemove', startActivityTimer); // 鼠標移動事件
        document.addEventListener('keypress', startActivityTimer); // 鍵盤按鍵事件

        // 初始化啟動計時器
        startActivityTimer();
    }
};
</script>

<style scoped>
#user-info {
    position: fixed;
    top: 10px;
    right: 80px;
    background-color: #808080;
    padding: 1px;
    border-radius: 5px;
    font-family: 'Stick', sans-serif;

}

#logout-btn {
    position: fixed;
    top: 10px;
    right: 10px;
    /* 負數值將按鈕上移 */
    font-family: 'Stick', sans-serif;
    background-color: #808080;
    font-family: 'Stick', sans-serif;
}

/* 標頭樣式 */
.header {
    text-align: center;
    font-family: 'Stick', sans-serif;
    font-size: 30px;
    position: absolute;
    top: 0;
    width: 100%;
    background-color: #A9A9A9;
    color: #ffffff;
}

/* 隱藏的區塊樣式 */
.none {
    height: 100vh;
    background-color: #0D1117;
    width: 200px;
}

/* 輸入區塊樣式 */
.input {
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 450px;
    top: 90px;
    position: absolute;
    background-color: #0D1117;
    justify-content: center;
}

/* 按鈕樣式 */
.value {
    background-color: transparent;
    border: none;
    padding: 0px;
    margin-top: 50px;
    color: white;
    display: flex;
    position: relative;
    gap: 5px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 30px;
    font-family: 'Stick', sans-serif;
    align-items: center;
    /* 垂直居中對齊 */
}

/* 按鈕的樣式 */
.value:not(:active):hover,
.value:focus {
    background-color: #21262C;
}

/* 按鈕的樣式 */
.value:focus,
.value:active {
    background-color: #1A1F24;
    outline: none;
}

/* 選中狀態下的擬元素 */
.value::before {
    content: "";
    position: absolute;
    top: 5px;
    left: -10px;
    width: 5px;
    height: 80%;
    background-color: #2F81F7;
    border-radius: 5px;
    opacity: 0;
}

/* 選中狀態下的擬元素 */
.value:focus::before,
.value:active::before {
    opacity: 1;
}

/* SVG 圖標的大小 */
.value svg {
    width: 15px
}

/* 滑鼠懸停時的樣式 */
.input:hover> :not(.value:hover) {
    transition: 300ms;
    filter: blur(1px);
    transform: scale(0.95, 0.95);
}

/* 連結的顏色 */
a {
    color: #ffffff;
    /* 將YourDesiredColor替換為您想要的顏色 */
    text-decoration: none;
    /* 可選：移除下劃線 */
}

/* 已訪問連結的顏色 */
a:visited {
    color: #ffffff;
    /* 將YourVisitedColor替換為您想要的已訪問連結顏色 */
}
</style>
