-- ====================================================================
-- CycleCare Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/apjqcocxtylsofgxhetb/sql)
-- ====================================================================

-- 1. App Configuration Table (for payment gateway toggles & AI settings)
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial app config
INSERT INTO public.app_config (key, value)
VALUES 
    ('payment_gateway', '{"activeMpesaProvider": "PAYHERO", "mpesaEnabled": true, "okxEnabled": true, "autoVerifyWebhooks": true, "minDepositKes": 49, "sandboxMode": false}'::jsonb),
    ('economy_multipliers', '{"free": 1.0, "supporter": 2.0, "premium": 3.0, "dailyBase": 25, "streakBonus": 10}'::jsonb),
    ('coin_packages', '[
        {"id": "pkg_starter", "title": "Starter Glow", "coins": 70, "bonusCoins": 10, "priceKes": 49, "priceUsd": 0.99, "tag": "Hero Value", "isHero": true},
        {"id": "pkg_pocket", "title": "Pocket Reserve", "coins": 160, "bonusCoins": 30, "priceKes": 99, "priceUsd": 1.99, "tag": "Most Popular", "isHero": true},
        {"id": "pkg_bloom", "title": "Bloom Collection", "coins": 260, "bonusCoins": 50, "priceKes": 149, "priceUsd": 2.99, "tag": "Best Value"},
        {"id": "pkg_sanctuary", "title": "Sanctuary Vault", "coins": 400, "bonusCoins": 90, "priceKes": 197, "priceUsd": 4.99, "tag": "Supporter Choice"},
        {"id": "pkg_celestial", "title": "Celestial Treasury", "coins": 600, "bonusCoins": 150, "priceKes": 239, "priceUsd": 6.99, "tag": "Grand Reserve"},
        {"id": "pkg_sovereign", "title": "Sovereignty Patron", "coins": 1500, "bonusCoins": 450, "priceKes": 499, "priceUsd": 14.99, "tag": "Founder Tier"}
    ]'::jsonb),
    ('ai_config', '{"enableLayeredTranslation": true, "silentFallback": true, "gracefulExpertBusyNotice": true, "temperature": 0.7, "model": "gemini-1.5-flash-latest"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Economy Profiles Table
CREATE TABLE IF NOT EXISTS public.economy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    coin_balance BIGINT NOT NULL DEFAULT 120,
    lifetime_earned BIGINT NOT NULL DEFAULT 120,
    lifetime_spent BIGINT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'FREE', -- FREE, SUPPORTER, PREMIUM
    rank TEXT NOT NULL DEFAULT 'LUMEN', -- LUMEN, AURELIA, CELESTIA, SOLARA, NOCTURNE, FOUNDER
    active_frame TEXT,
    active_artifact TEXT DEFAULT 'cycle_coin',
    active_theme TEXT DEFAULT 'SOOTHING_ROSE',
    unlocked_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_kes NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL, -- MPESA, OKX
    provider_used TEXT NOT NULL, -- PAYHERO, PAYNEXUS, OKX
    provider_reference TEXT,
    phone_number TEXT,
    package_id TEXT,
    coins_to_credit BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    raw_callback_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Grant Access for anon/authenticated
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon / authenticated (or restrict according to your rules)
CREATE POLICY "Allow public read on app_config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Allow update on app_config" ON public.app_config FOR ALL USING (true);

CREATE POLICY "Allow read on economy_profiles" ON public.economy_profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert/update on economy_profiles" ON public.economy_profiles FOR ALL USING (true);

CREATE POLICY "Allow read on payment_transactions" ON public.payment_transactions FOR SELECT USING (true);
CREATE POLICY "Allow insert/update on payment_transactions" ON public.payment_transactions FOR ALL USING (true);

-- Ensure Realtime is enabled for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.economy_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_transactions;
