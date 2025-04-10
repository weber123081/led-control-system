export const switches = [false, false, false]; // 存儲每個開關的狀態（開/關）
export const urls = ['/gpio3', '/gpio5', '/gpio7']; // 每個交換器與 Lolin S2 Mini 互動的 URL
export const labels = ['第一排', '第二排', '第三排']; // 每個開關的標籤

export function updateSwitch(index) {
    // 更新開關狀態的邏輯
    console.log(`開關 ${index + 1} 已更新`);
}

export function getStatusLabel(index) {
    return switches[index] ? `${labels[index]}走道On` : `${labels[index]}走道Off`;
}