<template>
    <div class="content">
        <div class="left-column">
            <!-- 點擊按鈕切換表單顯示狀態 -->
            <button @click="toggleForm" class="button1">新增使用者</button>
            <!-- 使用 v-if 條件渲染表單，防止顯示在未切換時 -->
            <form v-if="showForm" @submit.prevent="submitForm">
                <label for="name">姓名:</label>
                <!-- 綁定輸入框與 formData 中的 name 屬性 -->
                <input type="text" v-model="formData.name" required><br><br>

                <label for="username">帳號:</label>
                <!-- 綁定輸入框與 formData 中的 username 屬性 -->
                <input type="text" v-model="formData.username" required><br><br>

                <label for="password">密碼:</label>
                <!-- 綁定輸入框與 formData 中的 password 屬性 -->
                <input type="password" v-model="formData.password" required><br><br>

                <label>功能限制:</label><br>
                <!-- 綁定複選框與 formData 中的 function1 屬性 -->
                <input type="checkbox" id="checkbox1" v-model="formData.function1">
                <label for="checkbox1">開關控制</label><br>

                <!-- 綁定複選框與 formData 中的 function2 屬性 -->
                <input type="checkbox" id="checkbox2" v-model="formData.function2">
                <label for="checkbox2">時間控制</label><br>

                <!-- 綁定複選框與 formData 中的 function3 屬性 -->
                <input type="checkbox" id="checkbox3" v-model="formData.function3">
                <label for="checkbox3">權限控制</label><br><br>

                <!-- 提交表單按鈕 -->
                <input type="submit" value="提交">
                <!-- 重置表單按鈕，點擊時重置表單資料 -->
                <input type="reset" @click="resetForm" value="刪除">
            </form>
        </div>
        <div class="right-column">
            <h2>使用者清單</h2>
            <table>
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>帳號</th>
                        <th>密碼</th>
                        <th>功能限制</th>
                        <th>設定</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 使用 v-for 迭代 userList，顯示每個使用者的資料 -->
                    <tr v-for="(user, index) in userList" :key="index">
                        <td>{{ user.name }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.password }}</td>
                        <td>
                            {{ user.function1 ? '開關控制 ' : '' }}
                            {{ user.function2 ? '時間控制 ' : '' }}
                            {{ user.function3 ? '權限控制 ' : '' }}
                        </td>
                        <td>
                            <!-- 編輯按鈕，點擊時觸發 editUser 方法 -->
                            <button @click="editUser(index)">編輯</button>
                            <!-- 刪除按鈕，點擊時觸發 deleteUser 方法 -->
                            <button @click="deleteUser(index)">刪除</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showForm: false,  // 表單顯示狀態
            formData: {
                name: '',  // 表單資料中的姓名
                username: '',  // 表單資料中的帳號
                password: '',  // 表單資料中的密碼
                function1: false,  // 表單資料中的功能限制1
                function2: false,  // 表單資料中的功能限制2
                function3: false  // 表單資料中的功能限制3
            },
            userList: []  // 使用者清單
        };
    },
    methods: {
        // 切換表單顯示狀態的方法
        toggleForm() {
            this.showForm = !this.showForm;
        },
        // 提交表單的方法
        submitForm() {
            this.userList.push({ ...this.formData });  // 將表單資料新增到使用者清單中
            this.resetForm();  // 重置表單
            this.showForm = false;  // 隱藏表單
        },
        // 重置表單的方法
        resetForm() {
            this.formData = {
                name: '',
                username: '',
                password: '',
                function1: false,
                function2: false,
                function3: false
            };
        },
        // 編輯使用者的方法
        editUser(index) {
            this.formData = { ...this.userList[index] };  // 將選中的使用者資料複製到表單中
            this.userList.splice(index, 1);  // 從使用者清單中刪除選中的使用者
            this.showForm = true;  // 顯示表單
        },
        // 刪除使用者的方法
        deleteUser(index) {
            this.userList.splice(index, 1);  // 從使用者清單中刪除選中的使用者
        }
    }
};
</script>

<style scoped>
@viewport {
    width: device-width;
    zoom: 1.0;
}

* {
    box-sizing: border-box;
    max-width: 100%;
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

tfoot input {
    width: 100%;
    padding: 3px;
    box-sizing: border-box;
}

.background {
    background-color: #fffbfb;
    width: 100%;
}

.button1 {
    background-color: #000000;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    margin: 4px 2px;
    margin-top: 20px;
    cursor: pointer;
    border: none;
    border-radius: 50px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px);
    min-width: 100px;
    display: block;
}

.button1:active {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button1:hover {
    background-color: #fff;
    color: #000000;
}

.content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    font-family: 'Stick', sans-serif;
    font-size: 16px;
    position: absolute;
    top: 55px;
    left: 200px;
    width: calc(100% - 200px);
    height: calc(100% - 55px);
    background-color: #696969;
    color: #000000;
}

.left-column {
    width: 20%;
}

.right-column {
    width: 80%;
    margin-right: 70px;
}

table {
    border-collapse: collapse;
    width: 100%;
    border: 1px solid black;
    /* 添加黑色邊框 */
}

th,
td {
    border: 1px solid black;
    /* 添加黑色邊框 */
    padding: 8px;
    text-align: left;
    background-color: #f1f1f1;
}

th {
    background-color: #ecf2f8;
}
</style>
