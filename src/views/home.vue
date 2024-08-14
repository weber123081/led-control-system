<template>
    <div class="led">
        <div v-for="(button, index) in buttons" :key="index" class="button-container">
            <router-link :to="button.route" class="led-button-link">
                <button class="led-button">
                    <img :src="button.imgSrc" alt="" class="button-image" />
                    <span class="button-text">{{ button.name }}</span>
                </button>
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            buttons: [
                { name: '電燈開關', imgSrc: '/src/assets/light.png', route: '/light' },
                { name: '時間設定', imgSrc: '/src/assets/time.png', route: '/timeset' },
                { name: '紀錄查詢', imgSrc: '/src/assets/record.png', route: '/history' },
                { name: '帳號設定', imgSrc: '/src/assets/account.png', route: '/userroles' }
            ]
        };
    }
}
</script>

<style scoped>
/* 主容器样式 */
.led {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    font-family: 'Stick', sans-serif;
    font-size: 50px;
    position: absolute;
    top: 55px;
    height: calc(100% - 55px);
    width: 100%;
    background-color: #A9A9A9;
    color: #ffffff;
}

/* 按钮容器样式 */
.button-container {
    width: 25%;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* router-link 样式 */
.led-button-link {
    text-decoration: none;
}

/* 按钮样式 */
.led-button {
    width: 250px;
    height: 300px;
    font-size: 20px;
    font-weight: bold;
    background-color: #ffffff;
    color: #313131;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

/* 图片样式 */
.button-image {
    width: 80%;
    height: 200px;
    margin-bottom: 10px;
}

/* 文字样式 */
.button-text {
    font-size: 20px;
}

.led-button:hover {
    background-color: #fde8e8;
}
</style>
