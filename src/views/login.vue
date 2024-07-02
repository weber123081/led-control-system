<template>
    <!-- 主要內容區 -->
    <div class="pattern-grid-lg d-flex align-items-center justify-content-center vh-100 body">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center">
                    <!-- 標題 -->
                    <h1 class="display-5">電燈開關系統</h1>
                </div>
            </div>
            <!-- 登入表單 -->
            <form class="custom-form-group" @submit.prevent="login">
                <div class="row">
                    <!-- 帳號輸入欄 -->
                    <div class="col-6">
                        <div class="wave-group">
                            <input required type="text" class="input" v-model="username" name="username">
                            <span class="bar"></span>
                            <label class="label">
                                <span class="label-char" style="--index: 0">請</span>
                                <span class="label-char" style="--index: 1">輸</span>
                                <span class="label-char" style="--index: 2">入</span>
                                <span class="label-char" style="--index: 3">帳</span>
                                <span class="label-char" style="--index: 3">號</span>
                            </label>
                        </div>
                    </div>
                    <!-- 登入按鈕 -->
                    <div class="col-6 text-right">
                        <button class="button" tabindex="-1" @click="buttonClick">
                            <!-- 登入圖示 -->
                            <svg xmlns="http://www.w3.org/2000/svg" height="8em" viewBox="0 0 384 512" class="svg2">
                                <path
                                    d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80V416H112v16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z">
                                </path>
                            </svg>
                            <!-- 登入圖示 -->
                            <svg xmlns="http://www.w3.org/2000/svg" height="8em" viewBox="0 0 384 512" class="svg">
                                <path
                                    d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H109c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H226.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H272v16c0 44.2-35.8 80-80 80z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="row">
                    <!-- 密碼輸入欄 -->
                    <div class="col-6">
                        <div class="wave-group">
                            <input required type="password" class="input" v-model="password" name="password">
                            <span class="bar"></span>
                            <label class="label">
                                <span class="label-char" style="--index: 0">請</span>
                                <span class="label-char" style="--index: 1">輸</span>
                                <span class="label-char" style="--index: 2">入</span>
                                <span class="label-char" style="--index: 3">密</span>
                                <span class="label-char" style="--index: 3">碼</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const username = ref('');
        const password = ref('');
        const router = useRouter();

        // 登入函式
        const login = async () => {
            try {
                const formData = new FormData();
                formData.append('username', username.value);
                formData.append('password', password.value);

                const response = await fetch('http://192.168.50.242/login', {
                    method: 'POST',
                    mode: 'cors',
                    body: formData
                });

                if (response.ok) {
                    alert("登入成功");
                    router.push('/home');
                } else {
                    alert("登入失敗");
                }
            } catch (error) {
                console.error('錯誤:', error);
            }
        };

        // 按鈕點擊事件
        const buttonClick = () => {
            // 在這裡添加其他按鈕點擊事件的處理邏輯
        };

        return {
            username,
            password,
            login,
            buttonClick
        };
    }
}
</script>

<style scoped>
/* 欄上下間距 */
.row {
    margin-top: 30px;
}

/* 調整輸入框寬度 */
.custom-form-group {
    max-width: 300px;
    margin: 0 auto;
}

/* 按钮寬度 */
.custom-btn-size {
    width: 270px;
    height: 40px;
    font-size: 20px;
}

/* 設定背景圖的URL */
.body {
    background-image: url(../assets/login.jpg);
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

/* 帳號特效 */
/* 定義波浪效果的容器，使用相對定位 */
.wave-group {
    position: relative;
}

/* 定義輸入框的樣式 */
.wave-group .input {
    font-size: 16px;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 270px;
    border: none;
    border-bottom: 1px solid #515151;
    background: transparent;
}

/* 移除輸入框的焦點時不顯示外框 */
.wave-group .input:focus {
    outline: none;
}

/* 定義標籤文字的樣式，並使用絕對定位使其浮在輸入框上方 */
.wave-group .label {
    color: #999;
    font-size: 18px;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 5px;
    display: flex;
}

/* 定義標籤文字中的字符效果 */
.wave-group .label-char {
    transition: 0.2s ease all;
    transition-delay: calc(var(--index) * .05s);
}

/* 當輸入框獲得焦點或輸入內容有效時，標籤文字的字符效果變化 */
.wave-group .input:focus~label .label-char,
.wave-group .input:valid~label .label-char {
    transform: translateY(-20px);
    font-size: 14px;
    color: #000247;
}

/* 定義底部的條紋效果 */
.wave-group .bar {
    position: relative;
    display: block;
    width: 540px;
}

/* 定義條紋的前半部分和後半部分 */
.wave-group .bar:before,
.wave-group .bar:after {
    content: '';
    height: 4px;
    width: 0;
    bottom: 1px;
    position: absolute;
    background: #000e45;
    transition: 0.2s ease all;
}

/* 輸入框獲得焦點時，條紋的前半部分和後半部分寬度變為50%以創造填充效果 */
.wave-group .input:focus~.bar:before,
.wave-group .input:focus~.bar:after {
    width: 50%;
}

/* 基本按鈕樣式 */
.button {
    position: relative;
    list-style: none;
    border: none;
    background-color: transparent;
    border-radius: 50%;
    cursor: grab;
}

/* 普通狀態下的圖標樣式 */
.button .svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(150%, -20%);
    transition: all 1s;
}

/* 滑鼠懸停狀態下的圖標樣式 */
.button:hover .svg {
    fill: #000000;
}

/* 普通狀態下的填充圖標樣式 */
.button .svg2 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(150%, -20%);
    fill: #626161;
    opacity: 0.5;
    transition: opacity 0.5s;
}

/* 滑鼠懸停狀態下的填充圖標樣式 */
.button:hover .svg2 {
    opacity: 1;
    fill: #ffffff;
}
</style>