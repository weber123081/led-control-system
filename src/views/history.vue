<template>
    <div class="content" id="content">
        <div class="background">
            <DataTable :columns="columns" :data="logs" class="table table-hover table-striped" style="width: 100%">
                <thead>
                    <tr>
                        <th>使用功能名稱</th>
                        <th>操作者</th>
                        <th>操作時間</th>
                        <th>操作動作</th>
                        <th>設備MAC</th>
                    </tr>
                </thead>
            </DataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';

DataTable.use(DataTablesCore);

const columns = [
    { title: '使用功能名稱', data: 'function' },
    { title: '操作者', data: 'username' },
    { title: '操作時間', data: 'date' },
    { title: '操作動作', data: 'action' },
    { title: '設備MAC', data: 'ip' }
];

const logs = ref([]);

onMounted(async () => {
    try {
        const response = await fetch('/logs', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        logs.value = data;
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
});
</script>


<style scoped>
@import 'bootstrap';
@import 'datatables.net-bs5';

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
    width: 100%;
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
