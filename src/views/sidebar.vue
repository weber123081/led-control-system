<template>
    <div class="header">
        <h1>5F資訊智慧開關</h1>
    </div>
    <div id="user-info"></div>
    <button id="logout-btn" @click="logout">登出</button>
    <UserInfo :loggedIn="loggedIn" :userName="name" />
    <div class="none">
        <div class="input">
            <router-link to="/userroles">
                <button class="value">
                    <iconroles />
                    <a>帳號權限</a>
                </button>
            </router-link>
            <router-link to="/timeset">
                <button class="value">
                    <icontimeset />
                    <a>時間設定</a>
                </button>
            </router-link>
            <router-link to="/history">
                <button class="value">
                    <iconhistory />
                    <a>紀錄查詢</a>
                </button>
            </router-link>
            <router-link to="/home">
                <button class="value">
                    <iconhome />
                    <a>回首頁</a>
                </button>
            </router-link>
            <a href="/restart" @click.prevent="restartESP8266">
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
        restartESP8266() {
            fetch('http://192.168.50.242/restart')
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('錯誤：', error);
                });
        },
        logout() {
            fetch('http://192.168.50.242/logout', {
                method: 'POST'
            })
                .then(response => {
                    if (response.ok) {
                        alert('已登出');
                        window.location.href = '/login';
                    } else {
                        throw new Error('登出失敗');
                    }
                })
                .catch(error => {
                    console.error('錯誤：', error);
                });
        },
        checkInactivity() {
            const lastActivity = localStorage.getItem('lastActivityTime');
            if (lastActivity && Date.now() - parseInt(lastActivity) > 15 * 60 * 1000) { // 15分鐘
                this.logout();
                window.location.href = '/login';
            }
        },
        resetActivityTimer() {
            const currentTime = Date.now();
            localStorage.setItem('lastActivityTime', currentTime);
        }
    },
    mounted() {
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
                    this.loggedIn = true;
                    this.name = data.name;
                    userInfoElem.textContent = '登入人員: ' + data.name;
                    document.getElementById('logout-btn').style.display = 'inline';
                } else {
                    this.loggedIn = false;
                    userInfoElem.textContent = '未登入';
                    document.getElementById('logout-btn').style.display = 'none';
                    window.location.href = '/login';
                }
            })
            .catch(error => {
                console.error(`錯誤：${error.message}`);
            });

        // 在頁面加載時檢查最後的活動時間
        this.checkInactivity();

        document.addEventListener('mousemove', this.resetActivityTimer);
        document.addEventListener('keypress', this.resetActivityTimer);

        this.resetActivityTimer();

        // 每秒檢查一次用戶是否超時
        setInterval(this.checkInactivity, 1000);
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
