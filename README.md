# LED 控制系統

這是一個基於 Vue 3 + Element Plus 的 LED 控制系統前端專案。

## 功能特點

- 🔐 使用者權限管理
- 💡 LED 開關控制
- ⏱️ 定時排程設置
- 📝 操作日誌記錄
- ⚙️ 設備管理配置

## 技術棧

- Vue 3
- Element Plus
- Vue Router
- Vite
- JavaScript/ES6+

## 安裝與運行

1. 克隆專案

```bash
git clone https://github.com/weber123081/led-control-system.git
cd led-control-system
```

2. 安裝依賴

```bash
npm install
```

3. 運行開發環境

```bash
npm run dev
```

4. 建置生產環境

```bash
npm run build
```

## 系統要求

- Node.js 16+
- npm 7+

## 瀏覽器支援

- Chrome
- Firefox
- Safari
- Edge

## 開發團隊

- 前端開發：LED Control System Team
- 設計：LED Control System Team

## 授權

MIT License

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

The project uses Vite for building and can be deployed in two ways:

### Method 1: Using the deployment script

1. Make the deployment script executable:

   ```bash
   chmod +x deploy.sh
   ```

2. Run the deployment script:

   ```bash
   ./deploy.sh
   ```

3. The built files will be available in the `deployment` directory, ready to be uploaded to your server.

### Method 2: Manual deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory. Upload these files to your web server.

### Server Configuration

For production deployment, ensure your web server is configured to:

1. Serve the static files from the build directory
2. Route all requests to index.html for SPA functionality
3. Set appropriate security headers

#### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

## Environment Variables

Create a `.env` file in the project root for environment-specific settings:

```env
VITE_API_URL=your-api-url
```

## Notes

- The `dist` directory is ignored in git as it contains built files
- Always use HTTPS in production
- Regularly backup your deployment configuration
