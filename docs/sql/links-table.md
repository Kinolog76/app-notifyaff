```sql
-- ============================================
-- 3. LINKS TABLE
-- ============================================
CREATE TABLE links (
  -- Уникальный ID ссылки
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ID владельца ссылки
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- ID воркспейса (NULL если ссылка без категории/uncategorized)
  -- При удалении воркспейса ссылки остаются, workspace_id становится NULL
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

  -- Название ссылки (например: "Protein powder Amazon", опционально)
  name TEXT,

  -- Полный URL партнерской ссылки
  url TEXT NOT NULL,

  -- Короткий URL (если используется url shortener, опционально)
  short_url TEXT,

  -- Категория ссылки (например: "Fitness", "Tech", опционально)
  category TEXT,

  -- Массив тегов для фильтрации (например: ["amazon", "protein", "supplement"])
  tags TEXT[],

  -- Текущий статус ссылки: checking - проверяется, active - работает, broken - не работает, warning - предупреждение
  status TEXT DEFAULT 'checking',

  -- Дата и время последней проверки ссылки
  last_checked_at TIMESTAMP,

  -- Дата добавления ссылки
  created_at TIMESTAMP DEFAULT NOW(),

  -- Дата последнего обновления
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска ссылок пользователя
CREATE INDEX idx_links_user_id ON links(user_id);

-- Индекс для поиска ссылок в воркспейсе
CREATE INDEX idx_links_workspace_id ON links(workspace_id);

-- Индекс для фильтрации по статусу (active, broken, warning)
CREATE INDEX idx_links_status ON links(status);

-- Индекс для быстрого поиска ссылок без воркспейса (uncategorized)
CREATE INDEX idx_links_no_workspace ON links(user_id) WHERE workspace_id IS NULL;

-- Включаем Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть только свои ссылки
CREATE POLICY "Users can view own links"
  ON links FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь может добавлять ссылки только для себя
CREATE POLICY "Users can insert own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователь может обновлять только свои ссылки
CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователь может удалять только свои ссылки
CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = user_id);


```
