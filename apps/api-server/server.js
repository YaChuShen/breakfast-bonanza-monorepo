// server.js
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

// 建立 Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 健康檢查：確認 API 活著
app.get("/health", (_req, res) => res.json({ ok: true }));

// 簡單測試 Supabase 連線（例如抓一筆資料）
app.get("/test-db", async (_req, res) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, avatar_url, nickname, updated_at, level")
    .limit(5);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("API running on port", process.env.PORT || 3000);
});
