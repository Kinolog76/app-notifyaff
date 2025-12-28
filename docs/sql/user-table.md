```sql
-- ============================================
-- 2. WORKSPACES TABLE
-- ============================================
CREATE TABLE workspaces (
  -- Уникальный ID воркспейса
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ID владельца воркспейса
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Название воркспейса (например: "Instagram", "YouTube", "Blog")
  name TEXT NOT NULL,
  
  -- Описание воркспейса (опционально)
  description TEXT,
  
  -- Эмодзи иконка для визуального различия (📸, 🎥, ✍️, и т.д.)
  icon TEXT DEFAULT '📁',
  
  -- Цвет воркспейса в HEX формате для визуального различия
  color TEXT DEFAULT '#3b82f6',
  
  -- Дата создания воркспейса
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Дата последнего обновления
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска воркспейсов пользователя
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);

-- Включаем Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть только свои воркспейсы
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь может создавать воркспейсы только для себя
CREATE POLICY "Users can create own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователь может обновлять только свои воркспейсы
CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователь может удалять только свои воркспейсы
CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);
```