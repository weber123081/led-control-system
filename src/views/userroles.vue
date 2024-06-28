<template>
    <div class="content clearfix">
        <div class="left-column">
            <button @click="toggleForm" class="button1">新增使用者</button>
            <form v-if="showForm" @submit.prevent="submitForm">
                <label for="name">姓名:</label>
                <input type="text" v-model="newUser.name" required><br><br>

                <label for="username">帳號:</label>
                <input type="text" v-model="newUser.username" required><br><br>

                <label for="password">密碼:</label>
                <input type="text" v-model="newUser.password" required><br><br>

                <label>功能限制:</label><br>
                <input type="checkbox" id="checkbox1" v-model="newUser.function1">
                <label for="checkbox1">開關控制</label><br>

                <input type="checkbox" id="checkbox2" v-model="newUser.function2">
                <label for="checkbox2">時間控制</label><br>

                <input type="checkbox" id="checkbox3" v-model="newUser.function3">
                <label for="checkbox3">權限控制</label><br><br>

                <input type="submit" value="提交">
                <input type="reset" @click="resetNewUserForm" value="刪除">
            </form>
        </div>

        <div class="right-column">
            <h2>使用者清單</h2>
            <table>
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th v-if="hasPermission">帳號</th>
                        <th v-if="hasPermission">密碼</th>
                        <th v-if="hasPermission">功能限制</th>
                        <th>設定</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(user, index) in userList" :key="index">
                        <template v-if="editingIndex !== index">
                            <td>{{ user.name }}</td>
                            <td v-if="hasPermission">{{ user.username }}</td>
                            <td v-if="hasPermission">{{ hidePassword(user.password) }}</td>
                            <td v-if="hasPermission">
                                {{ user.function1 ? '開關控制 ' : '' }}
                                {{ user.function2 ? '時間控制 ' : '' }}
                                {{ user.function3 ? '權限控制 ' : '' }}
                            </td>
                            <td>
                                <button @click="editUser(index)" :disabled="!hasPermission">編輯</button>
                                <button @click="deleteUser(index)" :disabled="!hasPermission">刪除</button>
                            </td>
                        </template>

                        <template v-else>
                            <td><input type="text" v-model="editingUser.name" readonly class="readonly-input"></td>
                            <td v-if="hasPermission"><input type="text" v-model="editingUser.username" readonly
                                    class="readonly-input"></td>
                            <td v-if="hasPermission"><input type="password" v-model="editingUser.password"></td>
                            <td v-if="hasPermission">
                                <input type="checkbox" v-model="editingUser.function1">開關控制
                                <input type="checkbox" v-model="editingUser.function2">時間控制
                                <input type="checkbox" v-model="editingUser.function3">權限控制
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
            showForm: false,
            newUser: {
                name: '',
                username: '',
                password: '',
                function1: false,
                function2: false,
                function3: false
            },
            editingUser: {
                name: '',
                username: '',
                password: '',
                function1: false,
                function2: false,
                function3: false,
                id: null
            },
            userList: [],
            editingIndex: null,
            originalData: {},
            function3: null,
            hasPermission: false,
            userName: '',
            ipAddress: '192.168.50.1'
        };
    },
    mounted() {
        this.loadUserData();
        this.checkPermission();
        this.fetchUserInfo(); // 確保在組件加載時調用 fetchUserInfo 方法
    },
    methods: {
        async checkPermission() {
            try {
                const response = await fetch('http://192.168.50.242/function3');
                if (!response.ok) {
                    throw new Error('網絡響應異常');
                }
                const data = await response.json();
                this.hasPermission = data.function3 === 1;
                if (!this.hasPermission) {
                    const button = document.querySelector('.button');
                    button.style.display = 'none';
                }
            } catch (error) {
                console.error(`錯誤：${error}`);
            }
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
                        action: action,
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
        beforeUnmount() {
            this.controllers.forEach(controller => {
                if (controller) {
                    controller.abort();
                }
            });
            this.intervals.forEach(interval => clearInterval(interval));
        },
        hidePassword(password) {
            return '*'.repeat(password.length);
        },
        toggleForm() {
            this.showForm = !this.showForm;
            this.resetNewUserForm();
        },
        async submitForm() {
            const username = this.newUser.username;
            const isDuplicateUsername = this.userList.some(user => user.username === username && user.id !== this.newUser.id);

            if (isDuplicateUsername) {
                alert("已存在相同的使用者名稱，請選擇不同的帳號名稱。");
                return;
            }

            const formData = new FormData();
            formData.append('name', this.newUser.name);
            formData.append('username', this.newUser.username);
            formData.append('password', this.newUser.password);
            formData.append('function1', this.newUser.function1 ? 1 : 0);
            formData.append('function2', this.newUser.function2 ? 1 : 0);
            formData.append('function3', this.newUser.function3 ? 1 : 0);

            if (this.newUser.id) {
                formData.append('id', this.newUser.id);

                try {
                    const response = await fetch("http://192.168.50.242/updatedata", {
                        method: "POST",
                        body: formData
                    });
                    if (response.ok) {
                        alert("用戶已成功更新");
                        await this.logAction("帳號權限", this.userName, this.getTaiwanISOTime(), `修改用戶 ${this.newUser.username}（開關控制：${this.getFunctionName(this.newUser.function1)}，時間控制：${this.getFunctionName(this.newUser.function2)}，權限控制：${this.getFunctionName(this.newUser.function3)}）`, this.ipAddress);
                        this.resetNewUserForm();
                        this.showForm = false;
                        this.loadUserData();
                    } else {
                        console.error("更新用戶時出現錯誤");
                    }
                } catch (error) {
                    console.error("發生錯誤：", error);
                }
            } else {
                try {
                    const response = await fetch("http://192.168.50.242/insertdata", {
                        method: "POST",
                        body: formData
                    });
                    if (response.ok) {
                        alert("用戶已成功新增");
                        await this.logAction("帳號權限", this.userName, this.getTaiwanISOTime(), `新增用戶 ${this.newUser.username}（開關控制：${this.getFunctionName(this.newUser.function1)}，時間控制：${this.getFunctionName(this.newUser.function2)}，權限控制：${this.getFunctionName(this.newUser.function3)}）`, this.ipAddress);
                        this.resetNewUserForm();
                        this.showForm = false;
                        this.loadUserData();
                    } else {
                        console.error("新增用戶時出現錯誤");
                    }
                } catch (error) {
                    console.error("發生錯誤：", error);
                }
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
            this.editingUser = { ...this.userList[index] };
            this.originalData = { ...this.userList[index] };
            this.editingIndex = index;
        },
        async saveUser(index) {
            const formData = new FormData();
            formData.append('id', this.editingUser.id);
            formData.append('name', this.editingUser.name);
            formData.append('username', this.editingUser.username);
            formData.append('password', this.editingUser.password);
            formData.append('function1', this.editingUser.function1 ? 1 : 0);
            formData.append('function2', this.editingUser.function2 ? 1 : 0);
            formData.append('function3', this.editingUser.function3 ? 1 : 0);

            try {
                const response = await fetch("http://192.168.50.242/updatedata", {
                    method: "POST",
                    body: formData
                });
                if (response.ok) {
                    alert("用戶已成功更新");
                    await this.logAction("帳號權限", this.userName, this.getTaiwanISOTime(), `修改用戶 ${this.editingUser.username}（開關控制：${this.getFunctionName(this.editingUser.function1)}，時間控制：${this.getFunctionName(this.editingUser.function2)}，權限控制：${this.getFunctionName(this.editingUser.function3)}）`, this.ipAddress);
                    this.resetEditForm();
                    this.loadUserData();
                } else {
                    console.error("更新用戶時出現錯誤");
                }
            } catch (error) {
                console.error("發生錯誤：", error);
            }
        },
        cancelEdit() {
            this.resetEditForm();
        },
        async deleteUser(index) {
            const usernameToDelete = this.userList[index].username;
            const formData = new FormData();
            formData.append("username", usernameToDelete);

            try {
                const response = await fetch("http://192.168.50.242/deletedata", {
                    method: "POST",
                    body: formData
                });
                if (response.ok) {
                    alert("用戶已成功刪除");
                    await this.logAction("帳號權限", this.userName, this.getTaiwanISOTime(), `刪除用戶 ${usernameToDelete}`, this.ipAddress);
                    this.loadUserData();
                } else {
                    console.error("刪除用戶時出現錯誤");
                }
            } catch (error) {
                console.error("發生錯誤：", error);
            }
        },
        resetNewUserForm() {
            this.newUser = {
                name: '',
                username: '',
                password: '',
                function1: false,
                function2: false,
                function3: false
            };
        },
        resetEditForm() {
            this.editingUser = {
                name: '',
                username: '',
                password: '',
                function1: false,
                function2: false,
                function3: false,
                id: null
            };
            this.editingIndex = null;
        },
        functions() {
            const functions = [];
            if (this.newUser.function1) functions.push("開關控制");
            if (this.newUser.function2) functions.push("時間控制");
            if (this.newUser.function3) functions.push("權限控制");
            return functions.join(", ");
        },
        getFunctionName(value) {
            return value ? "啟用" : "禁用";
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

.readonly-input {
    background-color: #befd9e;
    /* 設置背景顏色為灰色 */

}
</style>
