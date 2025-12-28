```sql
-- ============================================
-- 5. NOTIFICATIONS TABLE (Уведомления)
-- ============================================
CREATE TABLE notifications (
  -- Уникальный ID уведомления
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ID пользователя которому отправляется уведомление
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- ID ссылки о которой уведомление (может быть NULL для системных уведомлений)
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  
  -- Тип уведомления: broken_link - ссылка сломалась, link_recovered - ссылка восстановилась, slow_response - медленный ответ
  type TEXT NOT NULL,
  
  -- Текст уведомления для пользователя
  message TEXT NOT NULL,
  
  -- Прочитано ли уведомление (false - новое, true - прочитано)
  read BOOLEAN DEFAULT FALSE,
  
  -- Дата и время создания уведомления
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска уведомлений пользователя
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Индекс для фильтрации непрочитанных уведомлений
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- Индекс для сортировки по дате (новые первыми)
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Включаем Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть только свои уведомления
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь может обновлять только свои уведомления (например, отмечать как прочитанные)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователь может удалять только свои уведомления
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
```