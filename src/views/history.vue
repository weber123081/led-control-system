<template>
    <div class="content" id="content">
        <div class="background">
            <DataTable id="example" class="display" :columns="columns" style="width: 100%">
                <thead>
                    <tr>
                        <th>使用功能名稱</th>
                        <th>使用者員工編號</th>
                        <th>操作時間</th>
                        <th>操作動作</th>
                        <th>設備MAC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>功能1</td>
                        <td>001</td>
                        <td>2024-04-01 09:30:00</td>
                        <td>操作1</td>
                        <td>00:11:22:33:44:55</td>
                    </tr>
                    <tr>
                        <td>功能2</td>
                        <td>002</td>
                        <td>2024-04-01 10:00:00</td>
                        <td>操作2</td>
                        <td>AA:BB:CC:DD:EE:FF</td>
                    </tr>
                    <tr>
                        <td>功能3</td>
                        <td>003</td>
                        <td>2024-04-01 10:30:00</td>
                        <td>操作3</td>
                        <td>11:22:33:44:55:66</td>
                    </tr>
                </tbody>
            </DataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';

DataTable.use(DataTablesCore);

const columns = [
    { data: '使用功能名稱' },
    { data: '使用者員工編號' },
    { data: '操作時間' },
    { data: '操作動作' },
    { data: '設備MAC' },
];
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
    width: calc(100% - 220px);
    height: calc(100% - 55px);
    background-color: #ffffff;
    color: #000000;
}

table {
    border-collapse: collapse;
    width: 100%;
}

th,
td {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
}

th {
    background-color: #f2f2f2;
}
</style>
