```sql
-- ============================================
-- 1. USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
  -- Primary key, связь с auth.users
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Тип подписки пользователя (free, basic, pro, agency)
  plan TEXT DEFAULT 'free',
  
  -- Статус подписки (active - активна, canceled - отменена, past_due - просрочена, trialing - пробный период)
  plan_status TEXT DEFAULT 'active',
  
  -- ID клиента в Stripe для биллинга
  stripe_customer_id TEXT,
  
  -- ID подписки в Stripe
  stripe_subscription_id TEXT,
  
  -- Дата окончания текущего периода подписки
  current_period_end TIMESTAMP,
  
  -- Лимит ссылок по тарифу (free: 25, basic: 250, pro: 1000, agency: 10000)
  links_limit INTEGER DEFAULT 25,
  
  -- Лимит воркспейсов по тарифу (free: 2, basic: 5, pro: 15, agency: unlimited)
  workspaces_limit INTEGER DEFAULT 2,
  
  -- Текущее количество ссылок (автоматически обновляется триггером)
  links_count INTEGER DEFAULT 0,
  
  -- Текущее количество воркспейсов (автоматически обновляется триггером)
  workspaces_count INTEGER DEFAULT 0,
  
  -- Включены ли email уведомления о битых ссылках
  notification_email BOOLEAN DEFAULT TRUE,
  
  -- Включены ли push уведомления (для мобильного приложения)
  notification_push BOOLEAN DEFAULT FALSE,
  
  -- Включены ли SMS уведомления (платная опция)
  notification_sms BOOLEAN DEFAULT FALSE,
  
  -- Режим дайджеста: отправлять одно письмо в день вместо моментальных алертов
  digest_mode BOOLEAN DEFAULT FALSE,
  
  -- Частота проверки ссылок (hourly - каждый час, daily - раз в день, weekly - раз в неделю)
  check_frequency TEXT DEFAULT 'daily',
  
  -- Дата создания записи
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Дата последнего обновления
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска по типу плана
CREATE INDEX idx_user_settings_plan ON user_settings(plan);

-- Индекс для поиска по Stripe customer ID
CREATE INDEX idx_user_settings_stripe_customer ON user_settings(stripe_customer_id);

-- Включаем Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть только свои настройки
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь может обновлять только свои настройки
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

```