-- Supabase 遊戲資料庫 Schema
-- 替代 Firebase Firestore 結構

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- 用戶資料表（對應 Firebase users collection）
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    islevel2 BOOLEAN DEFAULT false,
    -- 分數相關欄位（提升查詢效能）
    highest_score INTEGER DEFAULT 0,     -- 最高分數
    latest_score INTEGER DEFAULT 0,      -- 最新分數
    total_games INTEGER DEFAULT 0,       -- 總遊戲次數
    total_score INTEGER DEFAULT 0,       -- 總累積分數
    lastPlayTime TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 分數記錄表（對應 Firebase users.score 陣列）
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    time BIGINT NOT NULL, -- Unix timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 排行榜表（對應 Firebase leaderboard collection）
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 即時排名表（對應 Firebase Realtime Database rankings）
CREATE TABLE IF NOT EXISTS public.rankings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rankings JSONB NOT NULL, -- 儲存整個排行榜 JSON
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 遊戲導覽狀態表（對應 tour API）
CREATE TABLE IF NOT EXISTS public.user_tour_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tour_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_score_desc ON public.scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_time_desc ON public.scores(time DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_updated_at ON public.leaderboard(updated_at DESC);

-- Row Level Security (RLS) 設定
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tour_status ENABLE ROW LEVEL SECURITY;

-- RLS 政策
-- 用戶只能查看和更新自己的資料
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 分數記錄：用戶只能查看自己的分數，但可以插入新分數
CREATE POLICY "Users can view own scores" ON public.scores
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own scores" ON public.scores
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 排行榜：所有人都可以查看，但只能更新自己的記錄
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can upsert own leaderboard entry" ON public.leaderboard
    FOR ALL USING (auth.uid()::text = profile_id::text);

-- 即時排名：所有人都可以查看
CREATE POLICY "Anyone can view rankings" ON public.rankings
    FOR SELECT USING (true);

-- 管理員可以更新排名
CREATE POLICY "Service role can manage rankings" ON public.rankings
    FOR ALL USING (auth.role() = 'service_role');

-- 導覽狀態：用戶只能查看和更新自己的狀態
CREATE POLICY "Users can manage own tour status" ON public.user_tour_status
    FOR ALL USING (auth.uid()::text = user_id::text);

-- 創建更新 updated_at 的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 實用的 SQL 函數
-- 獲取用戶最高分數
CREATE OR REPLACE FUNCTION get_user_highest_score(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT MAX(score) 
        FROM public.scores 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 獲取用戶總遊戲次數
CREATE OR REPLACE FUNCTION get_user_game_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.scores 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新排行榜的函數
CREATE OR REPLACE FUNCTION update_leaderboard_entry(
    p_profile_id UUID,
    p_name TEXT,
    p_score INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.leaderboard (profile_id, name, score, updated_at)
    VALUES (p_profile_id, p_name, p_score, NOW())
    ON CONFLICT (profile_id) 
    DO UPDATE SET 
        name = EXCLUDED.name,
        score = EXCLUDED.score,
        updated_at = EXCLUDED.updated_at
    WHERE leaderboard.score < EXCLUDED.score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🎯 新增分數並自動更新用戶統計的函數
CREATE OR REPLACE FUNCTION add_score_and_update_stats(
    p_user_id UUID,
    p_score INTEGER,
    p_time BIGINT
)
RETURNS VOID AS $$
DECLARE
    current_highest INTEGER;
    current_games INTEGER;
    current_total INTEGER;
BEGIN
    -- 插入新分數記錄
    INSERT INTO public.scores (user_id, score, time)
    VALUES (p_user_id, p_score, p_time);
    
    -- 獲取當前統計數據
    SELECT highest_score, total_games, total_score 
    INTO current_highest, current_games, current_total
    FROM public.user_profiles 
    WHERE id = p_user_id;
    
    -- 更新用戶統計
    UPDATE public.user_profiles 
    SET 
        latest_score = p_score,
        highest_score = GREATEST(COALESCE(current_highest, 0), p_score),
        total_games = COALESCE(current_games, 0) + 1,
        total_score = COALESCE(current_total, 0) + p_score,
        lastPlayTime = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 設定 GraphQL 自動生成
COMMENT ON SCHEMA public IS '@graphql({"inflect_names": true})';
