# Mockoon CLI Docker for Railway

這是一個可以在 Railway 或任何支援 Docker 的平台上運行 Mockoon CLI 的 Docker 配置，包含網頁控制介面和檔案管理功能。

## 功能特點

- 🚀 **Mockoon CLI** - 輕量級的 mock API 服務器
- 📂 **FileBrowser** - 網頁檔案管理器，用於上傳和管理 JSON 檔案
- 🎮 **控制面板** - 簡潔的網頁介面來啟動/停止 Mockoon 服務
- 🔄 **動態載入** - 可以隨時切換不同的 mock 資料檔案
- 📊 **即時狀態** - 即時監控服務運行狀態

## 檔案結構

```
.
├── Dockerfile              # Docker 映像配置
├── start.sh               # 啟動腳本
├── supervisord.conf       # 進程管理配置
├── api-server.js          # Node.js API 控制服務器
├── control-panel.html     # 網頁控制介面
└── README.md             # 本文件
```

## 部署到 Railway

### 1. 準備檔案

將所有檔案放在一個資料夾中：

```bash
mkdir mockoon-railway
cd mockoon-railway

# 將所有提供的檔案複製到此資料夾
# - Dockerfile
# - start.sh
# - supervisord.conf
# - api-server.js
# - control-panel.html
```

### 2. 初始化 Git 倉庫

```bash
git init
git add .
git commit -m "Initial commit for Mockoon CLI on Railway"
```

### 3. 在 Railway 部署

1. 登入 [Railway](https://railway.app/)
2. 創建新專案
3. 選擇 "Deploy from GitHub repo" 或 "Deploy from local directory"
4. 推送你的程式碼

### 4. 設定環境變數

在 Railway 專案設定中，添加以下環境變數：

```
WEB_USERNAME=admin          # FileBrowser 使用者名稱
WEB_PASSWORD=your_password  # FileBrowser 密碼
PORT=80                      # 主要服務端口（Railway 會自動設定）
MOCKOON_PORT=3000           # Mockoon API 端口
```

## 本地建置和運行

### 建置 Docker 映像

```bash
docker build -t mockoon-cli-railway .
```

### 運行容器

```bash
docker run -d \
  -p 80:80 \
  -p 3000:3000 \
  -p 8080:8080 \
  -e WEB_USERNAME=admin \
  -e WEB_PASSWORD=password123 \
  -e MOCKOON_PORT=3000 \
  --name mockoon-container \
  mockoon-cli-railway
```

## 使用說明

### 1. 存取控制面板

開啟瀏覽器訪問：`http://localhost` （或你的 Railway URL）

你會看到 Mockoon 控制面板，包含：
- 服務狀態指示器
- 檔案選擇器
- 啟動/停止按鈕
- 快速連結

### 2. 上傳 Mock 資料檔案

點擊 "File Manager" 連結或訪問 `/files/`：
1. 使用設定的使用者名稱和密碼登入
2. 上傳你的 Mockoon JSON 檔案
3. 檔案會自動出現在控制面板的選擇器中

### 3. 啟動 Mockoon

1. 從下拉選單選擇要使用的 JSON 檔案
2. 點擊 "Start Mockoon" 按鈕
3. 服務狀態會變為 "Running"

### 4. 存取 Mock API

Mock API 可通過以下方式存取：
- 直接存取：`http://localhost:3000`
- 通過代理：`http://localhost/mock/`
- Admin API：`http://localhost/mock/mockoon-admin/`

## API 端點

### 控制 API

- `GET /api/mockoon?action=start&file=filename.json` - 啟動 Mockoon
- `GET /api/mockoon?action=stop` - 停止 Mockoon
- `GET /api/mockoon?action=status` - 獲取狀態
- `GET /api/mockoon?action=list` - 列出可用檔案

### 代理路徑

- `/` - 控制面板
- `/files/` - FileBrowser（檔案管理器）
- `/mock/` - Mockoon API 代理

## Mockoon 資料檔案格式

Mockoon 使用 JSON 格式的環境檔案。你可以：
1. 使用 Mockoon 桌面應用程式創建和匯出
2. 手動編寫 JSON 檔案
3. 從 OpenAPI/Swagger 規範匯入

範例檔案結構：

```json
{
  "uuid": "unique-id",
  "name": "My API",
  "port": 3000,
  "routes": [
    {
      "method": "get",
      "endpoint": "users",
      "responses": [
        {
          "body": "{\"users\": []}",
          "statusCode": 200
        }
      ]
    }
  ]
}
```

## 疑難排解

### Mockoon 無法啟動
- 檢查選擇的 JSON 檔案是否有效
- 查看日誌：在 FileBrowser 中查看 `/var/log/supervisor/` 下的日誌檔案

### 無法上傳檔案
- 確認 FileBrowser 使用者名稱和密碼正確
- 檢查磁碟空間是否足夠

### API 無回應
- 確認 Mockoon 服務狀態為 "Running"
- 檢查 mock 資料檔案中的路由配置

## 進階配置

### 自訂預設 Mock

編輯 `start.sh` 中的預設 mock 配置來自訂初始 API 回應。

### 修改端口

在環境變數中設定：
- `PORT` - 主要網頁服務端口
- `MOCKOON_PORT` - Mockoon API 端口

### 增加更多功能

可以修改 `api-server.js` 來添加更多控制功能，例如：
- 即時日誌檢視
- 多個 mock 實例管理
- 自動備份功能

## 支援

- [Mockoon 官方文檔](https://mockoon.com/docs/)
- [Mockoon CLI GitHub](https://github.com/mockoon/mockoon/tree/main/packages/cli)
- [Railway 文檔](https://docs.railway.app/)

## 授權

本專案基於開源軟體：
- Mockoon CLI - MIT License
- FileBrowser - Apache License 2.0
- Node.js - MIT License