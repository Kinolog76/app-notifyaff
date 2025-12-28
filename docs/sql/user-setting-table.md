```sql
-- ============================================
-- USER SETTINGS TABLE
-- Stores user subscription plan, limits, and preferences
-- ============================================

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription info
  plan TEXT DEFAULT 'free', -- 'free', 'basic', 'pro', 'agency'
  plan_status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP,
  
  -- Usage limits (based on plan)
  links_limit INTEGER DEFAULT 25,
  workspaces_limit INTEGER DEFAULT 2,
  
  -- Current usage (auto-updated by triggers)
  links_count INTEGER DEFAULT 0,
  workspaces_count INTEGER DEFAULT 0,
  
  -- Notification preferences
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT FALSE,
  notification_sms BOOLEAN DEFAULT FALSE,
  digest_mode BOOLEAN DEFAULT FALSE,
  
  -- Check frequency
  check_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_user_settings_plan ON user_settings(plan);
CREATE INDEX idx_user_settings_stripe_customer ON user_settings(stripe_customer_id);

-- Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```