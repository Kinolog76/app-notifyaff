```sql
-- ============================================
-- 4. LINK CHECKS TABLE (История проверок)
-- ============================================
CREATE TABLE link_checks (
  -- Уникальный ID записи проверки
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ID проверяемой ссылки (при удалении ссылки история проверок тоже удаляется)
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  
  -- HTTP статус код ответа (200, 404, 500 и т.д.)
  status_code INTEGER,
  
  -- Время ответа в миллисекундах (для отслеживания медленных ссылок)
  response_time_ms INTEGER,
  
  -- Текст ошибки если ссылка не работает
  error_message TEXT,
  
  -- JSON массив с цепочкой редиректов (полезно для отслеживания изменений)
  redirect_chain JSONB,
  
  -- Дата и время проверки
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска всех проверок конкретной ссылки
CREATE INDEX idx_link_checks_link_id ON link_checks(link_id);

-- Индекс для сортировки по дате (последние проверки первыми)
CREATE INDEX idx_link_checks_checked_at ON link_checks(checked_at DESC);

-- Включаем Row Level Security
ALTER TABLE link_checks ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть проверки только своих ссылок
CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );
```