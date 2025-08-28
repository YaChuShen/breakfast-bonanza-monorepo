# Express API 架構指南

## 🚀 **兩種選擇**

由於您使用獨立的 Express API server，我為您準備了兩種方案：

### **方案 1：Express + REST API**（推薦簡單）
- ✅ **簡單直接**，傳統 REST 架構
- ✅ **容易部署**，在 Render 上無額外設定
- ✅ **除錯友好**，每個功能一個 endpoint
- ✅ **學習成本低**，標準 HTTP methods

### **方案 2：Express + GraphQL**（功能強大）
- ✅ **單一 endpoint**，所有查詢都經過 `/graphql`
- ✅ **靈活查詢**，前端可以精確指定需要的資料
- ✅ **型別安全**，自動生成 schema
- ✅ **效能優化**，避免 over-fetching

## 📁 **檔案結構**

我已經為您創建了：

```
apps/
├── api-server/
│   ├── server.js          # 🔥 REST API 版本（主要）
│   ├── graphql-server.js  # 🔥 GraphQL 版本（可選）
│   └── package.json       # 🔥 更新的依賴
├── web/
│   └── lib/
│       └── api-client.js  # 🔥 前端 API 客戶端
└── database/
    └── supabase-schema.sql # ✅ 已保留
```

## 🛠️ **如何選擇和設置**

### **如果選擇 REST API**（推薦）

1. **使用現有的 `server.js`**：
```bash
cd apps/api-server
npm install
npm run dev
```

2. **API Endpoints**：
```
POST /api/scores              # 新增分數記錄
POST /api/leaderboard         # 更新排行榜
GET  /api/leaderboard/current # 獲取當前排行榜
GET  /api/user/:email         # 獲取用戶資料
GET  /api/user/:userId/scores # 獲取用戶分數記錄
GET  /api/leaderboard         # 獲取完整排行榜
POST /api/tour/complete       # 標記導覽完成
```

3. **前端使用方式**：
```javascript
import apiClient from 'lib/api-client';

// 新增分數
const result = await apiClient.addScore(profileId, score, 'end');

// 獲取排行榜
const leaderboard = await apiClient.getCurrentLeaderboard();
```

### **如果選擇 GraphQL**（進階）

1. **使用 `graphql-server.js`**：
```bash
cd apps/api-server
npm install
npm run dev:graphql
```

2. **GraphQL Endpoint**：
```
POST /graphql  # 所有查詢和變更
GET  /graphql  # GraphiQL 介面（開發環境）
```

3. **前端使用方式**：
```javascript
import { graphqlClient } from 'lib/api-client';

// 獲取用戶資料
const userData = await graphqlClient.getUser(email);

// 新增分數
const result = await graphqlClient.addScore(userId, score, 'end');
```

## 🔧 **環境變數設定**

在 `apps/api-server/.env` 中：
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LEVEL2_SCORE=1000
NEXTAUTH_SECRET=your-nextauth-secret
PORT=3002
```

在 `apps/web/.env.local` 中：
```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
# 或在 production: https://your-api.onrender.com
```

## 🚢 **Render 部署**

### **部署 Express API**：

1. **連結 GitHub repo**
2. **設定建置命令**：
```bash
cd apps/api-server && npm install
```

3. **設定啟動命令**：
```bash
cd apps/api-server && npm start
# 或 GraphQL 版本: npm start:graphql
```

4. **環境變數**：
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LEVEL2_SCORE=1000
NODE_ENV=production
```

### **部署 Next.js Web**：
```bash
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

## 📈 **API 對應表**

### **原本的 Next.js API → 新的 Express API**

| 原本                      | REST API                    | GraphQL                     |
|---------------------------|-----------------------------|-----------------------------|
| `/api/pointsTable`        | `POST /api/scores`          | `mutation addScore`         |
| `/api/leaderboard`        | `POST /api/leaderboard`     | `mutation updateLeaderboard`|
| `/api/getCurrentLeaderboard`| `GET /api/leaderboard/current`| `query getCurrentRankings` |
| `/api/tour`               | `POST /api/tour/complete`   | `mutation completeTour`     |

## 🎯 **我的建議**

**建議從 REST API 開始**：
1. ✅ 更簡單直接，容易理解和維護
2. ✅ 在 Render 部署無複雜設定
3. ✅ 與您現有的架構更相符
4. ✅ 如果之後需要，可以輕鬆切換到 GraphQL

**GraphQL 適合以下情況**：
- 前端需要靈活的資料查詢
- 想要型別安全和自動文檔
- 有複雜的關聯查詢需求
- 團隊熟悉 GraphQL 生態系

## 🔄 **資料遷移**

記得執行 Supabase schema 和資料遷移：
```bash
# 1. 在 Supabase Dashboard 執行 database/supabase-schema.sql
# 2. 執行資料遷移腳本
node scripts/migrate-firebase-to-supabase.js
```

## 💡 **下一步**

1. **選擇方案**：REST API 或 GraphQL
2. **設定環境變數**
3. **測試 API endpoints**
4. **更新前端程式碼**使用新的 API
5. **部署到 Render**

需要任何協助都可以詢問！ 🚀
