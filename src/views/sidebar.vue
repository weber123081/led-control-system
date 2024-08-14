<template>
    <div class="header">
        <h1>5F資訊智慧開關</h1>
        <router-link to="/home" class="home-button">
            <iconhome class="home-icon" />
        </router-link>
    </div>
    <div id="user-info"></div>
    <button id="logout-btn" @click="logout">登出</button>
    <UserInfo :loggedIn="loggedIn" :userName="name" />
</template>

<script setup>
import iconhome from '../components/icons/iconhome.vue';
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
            fetch('/restart')
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('錯誤：', error);
                });
        },
        logout() {
            fetch('/logout', {
                method: 'POST'
            })
                .then(response => {
                    if (response.ok) {
                        alert('已登出');
                        window.location.href = '/';
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
        fetch('/get_user_info')
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
/* 回首頁按鈕 */
.home-button {
    position: absolute;
    top: 10px;
    left: 10px;
    font-family: 'Stick', sans-serif;
    background-color: #808080;
    color: #ffffff;
    padding: 5px;
    border-radius: 5px;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 30px;
    cursor: pointer;
}

/* SVG 圖標的樣式 */
.home-icon {
    width: 20px;
    /* 調整圖標大小 */
    height: 20px;
}

/* 回首頁按鈕懸停和焦點樣式 */
.home-button:not(:active):hover,
.home-button:focus {
    background-color: #21262C;
}

.home-button:focus,
.home-button:active {
    background-color: #1A1F24;
    outline: none;
}

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
    font-family: 'Stick', sans-serif;
    background-color: #808080;
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

/* 其他樣式保持不變 */
</style>
