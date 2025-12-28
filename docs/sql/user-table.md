```sql
-- User settings and subscription info
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription
  plan TEXT DEFAULT 'free', -- 'free', 'basic', 'pro', 'agency'
  plan_status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP,
  
  -- Usage limits (based on plan)
  links_limit INTEGER DEFAULT 25,
  workspaces_limit INTEGER DEFAULT 2,
  
  -- Current usage
  links_count INTEGER DEFAULT 0,
  workspaces_count INTEGER DEFAULT 0,
  
  -- Notification preferences
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT FALSE,
  notification_sms BOOLEAN DEFAULT FALSE,
  digest_mode BOOLEAN DEFAULT FALSE, -- Send daily digest instead of instant alerts
  
  -- Check frequency
  check_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
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

-- Function: Auto-create user settings on signup
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Create settings when user signs up
CREATE TRIGGER on_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings();

-- Function: Update usage counts
CREATE OR REPLACE FUNCTION update_user_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update links count
  UPDATE user_settings
  SET 
    links_count = (SELECT COUNT(*) FROM links WHERE user_id = NEW.user_id),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update counts when links change
CREATE TRIGGER on_link_count_change
  AFTER INSERT OR DELETE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_user_usage();
```