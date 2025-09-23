// Express + GraphQL Server (強大版本)
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import cors from "cors";
import { randomUUID } from "crypto";
import "dotenv/config";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://breakfast-bonanza-monorepo-web.vercel.app/", // 如果有部署到 Vercel
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GraphQL Schema 定義
const schema = buildSchema(`
  type User {
    id: ID!
    email: String!
    avatar_url: String
    islevel2: Boolean!
    # 🎯 分數統計欄位（直接從 user_profiles 取得，提升查詢效能）
    highest_score: Int!
    latest_score: Int!
    total_games: Int!
    total_score: Int!
    average_score: Float        # 計算欄位：total_score / total_games
    lastplaytime: String
    created_at: String!
    updated_at: String!
    isfinishedtour: Boolean!
    # 🎯 關聯欄位：完整的遊戲歷史記錄
    scores: [Score!]!           # 此用戶的所有分數記錄
  }

  type Score {
    id: ID!
    user_id: ID!
    score: Int!
    time: String!
    created_at: String!
  }

  type LeaderboardEntry {
    id: ID!
    profile_id: ID!
    name: String!
    score: Int!
    updated_at: String!
  }

  type RankingEntry {
    rank: Int!
    profileId: ID!
    name: String!
    score: Int!
    updatedAt: String!
  }

  type RegisterResponse {
    id: ID!
    email: String!
    name: String!
    success: Boolean!
    message: String
    password: String
  }

  type Query {
    getUser(email: String!): User
    getUserScores(userId: ID!): [Score!]!
    getLeaderboard(limit: Int = 10): [LeaderboardEntry!]!
    getCurrentRankings: [RankingEntry!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): RegisterResponse!
    addScore(userId: ID!, score: Int!, timerStatus: String!): Boolean!
    finishTour(profileId: ID!): Boolean!
    updateLeaderboard(
      profileId: ID!, 
      score: Int!, 
      name: String!, 
      timerStatus: String!, 
      timestamp: String!,
      newLeaderboard: String!
    ): Boolean!
  }
`);

// GraphQL Resolvers
const root = {
  register: async ({ name, email, password }) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new Error("此電子郵件已被註冊");
      }

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing user:", checkError);
        throw new Error("檢查用戶時發生錯誤");
      }

      // 密碼加密
      const hashedPassword = bcrypt.hashSync(password, 12);
      const userId = randomUUID();

      // 在 next_auth.users 表中創建用戶
      const { error: nextAuthError } = await supabase
        .schema("next_auth")
        .from("users")
        .insert([
          {
            id: userId,
            email: email,
            name: name,
            emailVerified: null,
            image: null,
          },
        ])
        .select()
        .single();

      if (nextAuthError) {
        console.error("Error creating NextAuth user:", nextAuthError);
        throw new Error("創建 NextAuth 用戶時發生錯誤");
      }

      // 存儲密碼hash
      const { error: passwordError } = await supabase
        .from("user_credentials")
        .insert([
          {
            user_id: userId,
            password_hash: hashedPassword,
          },
        ]);

      if (passwordError) {
        console.error("Error storing password:", passwordError);
        throw new Error("存儲密碼時發生錯誤");
      }

      return {
        id: userId,
        email: email,
        name: name,
        success: true,
        message: "註冊成功",
        password: password,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(`註冊失敗: ${error.message}`);
    }
  },

  finishTour: async ({ profileId }) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ isfinishedtour: true })
      .eq("id", profileId);

    if (error) throw new Error(`更新用戶狀態失敗: ${error.message}`);
    return true;
  },

  addScore: async ({ userId, score, timerStatus }) => {
    if (timerStatus !== "end") {
      throw new Error("遊戲狀態異常");
    }

    const { error: addScoreError } = await supabase.rpc(
      "add_score_and_update_stats",
      {
        p_user_id: userId,
        p_score: score,
        p_time: Date.now(),
      }
    );

    if (addScoreError)
      throw new Error(`新增分數失敗: ${addScoreError.message}`);

    const LEVEL2_SCORE = 1000;
    const isLevel2 = score >= LEVEL2_SCORE;

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        islevel2: isLevel2,
      })
      .eq("id", userId);

    if (updateError)
      throw new Error(`更新用戶等級失敗: ${updateError.message}`);

    return true;
  },

  // 查詢用戶（包含分數統計）
  getUser: async ({ email }, context, info) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select(
        `
        id, email, islevel2
      `
      )
      .eq("email", email)
      .single();

    if (error) throw new Error(`查詢用戶失敗: ${error.message}`);

    // 計算平均分數
    const userData = {
      ...data,
      average_score:
        data.total_games > 0 ? data.total_score / data.total_games : 0,
    };

    return userData;
  },

  // 獲取用戶分數記錄
  getUserScores: async ({ userId }) => {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`查詢分數失敗: ${error.message}`);
    return data;
  },

  // 獲取排行榜
  getLeaderboard: async ({ limit }) => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`查詢排行榜失敗: ${error.message}`);
    return data;
  },

  // 獲取當前排名
  getCurrentRankings: async () => {
    // 先檢查是否有快取的排名
    const { data: cachedRankings } = await supabase
      .from("rankings")
      .select("rankings")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (cachedRankings) {
      return cachedRankings.rankings;
    }

    // 沒有快取則即時生成
    const { data, error } = await supabase
      .from("leaderboard")
      .select("profile_id, name, score, updated_at")
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw new Error(`查詢排名失敗: ${error.message}`);

    return data.map((entry, index) => ({
      rank: index + 1,
      profileId: entry.profile_id,
      name: entry.name,
      score: entry.score,
      updatedAt: entry.updated_at,
    }));
  },

  // 更新排行榜
  updateLeaderboard: async ({
    profileId,
    score,
    name,
    timerStatus,
    timestamp,
    newLeaderboard,
  }) => {
    const timeDiff = Date.now() - parseInt(timestamp);

    if (timerStatus !== "end" && timeDiff > 5000) {
      throw new Error("遊戲時間異常");
    }

    // 更新個人排行榜記錄
    const { error: leaderboardError } = await supabase
      .from("leaderboard")
      .upsert({
        profile_id: profileId,
        name: name,
        score: score,
        updated_at: new Date().toISOString(),
      });

    if (leaderboardError)
      throw new Error(`更新排行榜失敗: ${leaderboardError.message}`);

    // 清空舊排名並插入新排名
    await supabase
      .from("rankings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    const { error: rankingsError } = await supabase.from("rankings").insert({
      rankings: JSON.parse(newLeaderboard),
      updated_at: new Date().toISOString(),
    });

    if (rankingsError)
      throw new Error(`更新排名失敗: ${rankingsError.message}`);

    return true;
  },
};

// 設定 GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV === "development",
  })
);

// 健康檢查
app.get("/health", (_req, res) => res.json({ ok: true }));

// 測試 Supabase 連線
app.get("/test-db", async (_req, res) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, avatar_url")
    .limit(5);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 GraphQL API Server running on port ${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 GraphiQL available at: http://localhost:${PORT}/graphql`);
  }
});

export default app;
