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
                    <tr v-for="(user, index) in userList" :key="index">
                        <template v-if="editingIndex !== index">
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
                        </template>
                        <template v-else>
                            <td><input type="text" v-model="user.name"></td>
                            <td><input type="text" v-model="user.username"></td>
                            <td><input type="password" v-model="user.password"></td>
                            <td>
                                <input type="checkbox" v-model="user.function1">開關控制
                                <input type="checkbox" v-model="user.function2">時間控制
                                <input type="checkbox" v-model="user.function3">權限控制
                            </td>
                            <td>
                                <button @click="saveUser(index)">保存</button>
                                <button @click="cancelEdit(index)">取消</button>
                            </td>
                        </template>
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
                function3: false,  // 表單資料中的功能限制3
                id: null  // 表單資料中的用戶 ID
            },
            userList: [],  // 使用者清單
            editingIndex: null, // 編輯中的索引
            originalData: [] // 原始資料
        };
    },
    // 在 mounted 鉤子中發送 HTTP GET 請求以檢索帳戶資料
    mounted() {
        this.loadUserData();
    },
    methods: {
        // 切換表單顯示狀態的方法
        toggleForm() {
            this.showForm = !this.showForm;
        },
        // 提交表单的方法
        submitForm() {
            // 创建一个 FormData 对象
            const formData = new FormData();
            formData.append('name', this.formData.name);
            formData.append('username', this.formData.username);
            formData.append('password', this.formData.password);
            formData.append('function1', this.formData.function1 ? 1 : 0);
            formData.append('function2', this.formData.function2 ? 1 : 0);
            formData.append('function3', this.formData.function3 ? 1 : 0);

            // 檢查表單中是否有 id，如果有，则視為編輯操作
            if (this.formData.id) {
                // 發送 HTTP POST 請求到後端 /updatedata 端點
                fetch("http://192.168.50.242/updatedata", {
                    method: "POST",
                    body: formData  // 使用 FormData 對象作為請求體
                })
                    .then(response => {
                        // 檢查響應狀態碼
                        if (response.ok) {
                            // 如果響應狀態碼為 200，則表示成功
                            console.log("用戶已成功更新");
                            // 重置表單並隱藏
                            this.resetForm();
                            this.showForm = false;
                            // 重新加載用戶數據
                            this.loadUserData();
                        } else {
                            // 否則顯示錯誤消息
                            console.error("更新用戶時出現錯誤");
                        }
                    })
                    .catch(error => {
                        // 捕獲任何可能的錯誤並顯示錯誤消息
                        console.error("發生錯誤：", error);
                    });
            } else {
                // 如果沒有 id，則視為新增操作
                // 發送 HTTP POST 請求到後端 /insertdata 端點
                fetch("http://192.168.50.242/insertdata", {
                    method: "POST",
                    body: formData  // 使用 FormData 對象作為請求體
                })
                    .then(response => {
                        // 檢查響應狀態碼
                        if (response.ok) {
                            // 如果響應狀態碼為 200，則表示成功
                            console.log("用戶已成功新增");
                            // 重置表單並隱藏
                            this.resetForm();
                            this.showForm = false;
                            // 重新加載用戶數據
                            this.loadUserData();
                        } else {
                            // 否則顯示錯誤消息
                            console.error("新增用戶時出現錯誤");
                        }
                    })
                    .catch(error => {
                        // 捕獲任何可能的錯誤並顯示錯誤消息
                        console.error("發生錯誤：", error);
                    });
            }
        },
        loadUserData() {
            fetch("http://192.168.50.242/access")
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error("無法檢索用戶數據");
                    }
                })
                .then(data => {
                    // 將從後端加載的資料中的 0 和 1 轉換為布林值
                    this.userList = data.map(user => ({
                        ...user,
                        function1: user.function1 === 1,
                        function2: user.function2 === 1,
                        function3: user.function3 === 1
                    }));
                })
                .catch(error => {
                    console.error("發生錯誤：", error);
                });
        },
        editUser(index) {
            // 將選中的使用者資料複製到表單中
            this.formData = { ...this.userList[index] };
            // 檢查功能限制值
            console.log("Function 1:", this.userList[index].function1);
            console.log("Function 2:", this.userList[index].function2);
            console.log("Function 3:", this.userList[index].function3);
            // 複製一份原始資料，以便在取消編輯時恢復
            this.originalData[index] = { ...this.userList[index] };
            // 設置正在編輯的索引
            this.editingIndex = index;
        },
        saveUser(index) {
            const user = this.userList[index];
            const formData = new FormData();
            formData.append('id', user.id);
            formData.append('name', user.name);
            formData.append('username', user.username);
            formData.append('password', user.password);
            formData.append('function1', user.function1 ? 1 : 0);
            formData.append('function2', user.function2 ? 1 : 0);
            formData.append('function3', user.function3 ? 1 : 0);

            fetch("http://192.168.50.242/updatedata", {
                method: "POST",
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        console.log("用户已成功更新");
                        this.editingIndex = null; // 保存後取消編輯狀態
                        this.loadUserData(); // 重新加載用戶數據
                    } else {
                        console.error("更新用户时出现错误");
                    }
                })
                .catch(error => {
                    console.error("發生錯誤：", error);
                });
        },

        cancelEdit(index) {
            // 取消編輯，還原原始資料
            this.userList[index] = { ...this.originalData[index] };
            this.editingIndex = null;
        },

        // 刪除用戶的方法
        deleteUser(index) {
            const usernameToDelete = this.userList[index].username;
            const formData = new FormData();
            formData.append("username", usernameToDelete);

            // 發送 HTTP POST 請求到後端 /deletedata 端點
            fetch("http://192.168.50.242/deletedata", {
                method: "POST",
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        console.log("用戶已成功刪除");
                        // 刪除成功後重新加載用戶列表數據以更新表單
                        this.loadUserData();
                    } else {
                        console.error("刪除用戶時出現錯誤");
                    }
                })
                .catch(error => {
                    console.error("發生錯誤：", error);
                });
        },
        // 重置表單的方法
        resetForm() {
            this.formData = {
                name: '',
                username: '',
                password: '',
                function1: false,
                function2: false,
                function3: false,
                id: null
            };
            this.editingIndex = null;
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
