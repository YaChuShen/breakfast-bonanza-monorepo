# EC2 Socket Server 自動啟動設置指南

## 問題說明
目前 EC2 重啟後，socket-server 不會自動啟動，需要手動 SSH 進去執行 `node server.js`。

## 解決方案：使用 systemd 服務

### 步驟 1: SSH 連線到 EC2
```bash
ssh -i ~/Downloads/socket-server.pem ec2-user@56.155.163.184
```

### 步驟 2: 確認服務文件已上傳
確保 `socket-server.service` 已經在專案中，如果沒有，需要先 pull 最新代碼：
```bash
cd ~/breakfast-bonanza-monorepo
git pull origin main  # 或你的分支名稱
```

### 步驟 3: 複製 systemd 服務文件
```bash
sudo cp ~/breakfast-bonanza-monorepo/apps/socket-server/socket-server.service /etc/systemd/system/
```

### 步驟 4: 創建日誌文件並設置權限
```bash
sudo touch /var/log/socket-server.log
sudo touch /var/log/socket-server-error.log
sudo chown ec2-user:ec2-user /var/log/socket-server.log
sudo chown ec2-user:ec2-user /var/log/socket-server-error.log
```

### 步驟 5: 重新載入 systemd 並啟用服務
```bash
# 重新載入 systemd 配置
sudo systemctl daemon-reload

# 啟用服務（開機自動啟動）
sudo systemctl enable socket-server

# 立即啟動服務
sudo systemctl start socket-server
```

### 步驟 6: 檢查服務狀態
```bash
# 查看服務狀態
sudo systemctl status socket-server

# 查看日誌（即時）
sudo journalctl -u socket-server -f

# 查看服務日誌文件
tail -f /var/log/socket-server.log
tail -f /var/log/socket-server-error.log
```

## 常用管理命令

### 啟動/停止/重啟服務
```bash
sudo systemctl start socket-server    # 啟動
sudo systemctl stop socket-server     # 停止
sudo systemctl restart socket-server  # 重啟
```

### 查看日誌
```bash
# 查看最近 100 行日誌
sudo journalctl -u socket-server -n 100

# 即時查看日誌
sudo journalctl -u socket-server -f

# 查看今天的日誌
sudo journalctl -u socket-server --since today
```

### 禁用自動啟動
```bash
sudo systemctl disable socket-server
```

## 測試自動重啟功能

1. 故意停止服務，系統應該會在 10 秒後自動重啟：
```bash
sudo systemctl stop socket-server
# 等待 10 秒
sudo systemctl status socket-server  # 應該顯示 active (running)
```

2. 測試 EC2 重啟後自動啟動：
```bash
sudo reboot
# 重啟後重新 SSH 連線
ssh -i ~/Downloads/socket-server.pem ec2-user@56.155.163.184
# 檢查服務狀態
sudo systemctl status socket-server  # 應該自動運行
```

## 檢查清單

- [ ] `.env` 檔案存在於 `/home/ec2-user/breakfast-bonanza-monorepo/apps/socket-server/`
- [ ] `.env` 包含所有必要的環境變數（REDIS_URL, CORS_ORIGIN 等）
- [ ] Node.js 已安裝在 EC2 上
- [ ] systemd 服務文件已複製到 `/etc/systemd/system/`
- [ ] 服務已啟用（`sudo systemctl enable socket-server`）
- [ ] 服務正在運行（`sudo systemctl status socket-server`）
- [ ] 可以從外部訪問 https://socket.yachu.me/test

## 環境變數提醒

確保 `.env` 文件包含：
```env
PORT=3001
REDIS_URL=redis://your-redis-url
CORS_ORIGIN=https://breakfast-bonanza-monorepo-web.vercel.app,http://localhost:3000
DATABASE_URL=your-database-url
```

## Troubleshooting

### 服務無法啟動
```bash
# 檢查詳細錯誤訊息
sudo journalctl -u socket-server -n 50 --no-pager

# 檢查服務配置是否正確
sudo systemctl cat socket-server
```

### 檢查 Node.js 路徑
```bash
which node  # 確認 Node.js 安裝路徑
# 如果不是 /usr/bin/node，需要修改 socket-server.service 中的 ExecStart
```

### 手動測試服務
```bash
cd ~/breakfast-bonanza-monorepo/apps/socket-server
node server.js  # 如果手動可以運行但服務不行，檢查環境變數和權限
```

## 更新代碼後重啟服務

每次更新代碼後，需要重啟服務：
```bash
cd ~/breakfast-bonanza-monorepo
git pull
sudo systemctl restart socket-server
sudo systemctl status socket-server
```
