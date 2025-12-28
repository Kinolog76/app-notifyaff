```sql
-- ============================================
-- FUNCTION: Проверка лимита ссылок перед добавлением
-- ============================================
CREATE OR REPLACE FUNCTION check_links_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_limit INTEGER;
  current_count INTEGER;
BEGIN
  -- Получаем лимит пользователя
  SELECT links_limit INTO user_limit
  FROM user_settings
  WHERE user_id = NEW.user_id;
  
  -- Если лимит не найден (новый пользователь), используем дефолтный
  IF user_limit IS NULL THEN
    user_limit := 25;
  END IF;
  
  -- Получаем текущее количество ссылок
  SELECT COUNT(*) INTO current_count
  FROM links
  WHERE user_id = NEW.user_id;
  
  -- Проверяем превышение лимита
  IF current_count >= user_limit THEN
    RAISE EXCEPTION 'Link limit exceeded. Your plan allows % links. Upgrade to add more.', user_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер: Проверка перед добавлением ссылки
CREATE TRIGGER enforce_links_limit
  BEFORE INSERT ON links
  FOR EACH ROW
  EXECUTE FUNCTION check_links_limit();
```

```sql
-- ============================================
-- FUNCTION: Проверка лимита воркспейсов перед добавлением
-- ============================================
CREATE OR REPLACE FUNCTION check_workspaces_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_limit INTEGER;
  current_count INTEGER;
BEGIN
  -- Получаем лимит пользователя
  SELECT workspaces_limit INTO user_limit
  FROM user_settings
  WHERE user_id = NEW.user_id;
  
  -- Если лимит не найден, используем дефолтный
  IF user_limit IS NULL THEN
    user_limit := 2;
  END IF;
  
  -- Получаем текущее количество воркспейсов
  SELECT COUNT(*) INTO current_count
  FROM workspaces
  WHERE user_id = NEW.user_id;
  
  -- Проверяем превышение лимита
  IF current_count >= user_limit THEN
    RAISE EXCEPTION 'Workspace limit exceeded. Your plan allows % workspaces. Upgrade to add more.', user_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер: Проверка перед добавлением воркспейса
CREATE TRIGGER enforce_workspaces_limit
  BEFORE INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION check_workspaces_limit();
```

```js
// app/api/links/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 1. Получаем настройки пользователя
  const { data: settings } = await supabase
    .from('user_settings')
    .select('links_count, links_limit, plan')
    .eq('user_id', session.user.id)
    .single()
  
  // 2. Проверяем лимит
  if (settings && settings.links_count >= settings.links_limit) {
    return NextResponse.json({
      error: 'Link limit exceeded',
      message: `Your ${settings.plan} plan allows ${settings.links_limit} links. Please upgrade to add more.`,
      current: settings.links_count,
      limit: settings.links_limit,
      needsUpgrade: true,
    }, { status: 403 })
  }
  
  // 3. Добавляем ссылку
  const body = await request.json()
  const { data, error } = await supabase
    .from('links')
    .insert({
      user_id: session.user.id,
      ...body,
    })
    .select()
    .single()
  
  if (error) {
    // Database trigger может выбросить ошибку тоже
    if (error.message.includes('Link limit exceeded')) {
      return NextResponse.json({
        error: 'Link limit exceeded',
        message: error.message,
        needsUpgrade: true,
      }, { status: 403 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
```

```js
// app/api/workspaces/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 1. Получаем настройки пользователя
  const { data: settings } = await supabase
    .from('user_settings')
    .select('workspaces_count, workspaces_limit, plan')
    .eq('user_id', session.user.id)
    .single()
  
  // 2. Проверяем лимит
  if (settings && settings.workspaces_count >= settings.workspaces_limit) {
    return NextResponse.json({
      error: 'Workspace limit exceeded',
      message: `Your ${settings.plan} plan allows ${settings.workspaces_limit} workspaces. Please upgrade to add more.`,
      current: settings.workspaces_count,
      limit: settings.workspaces_limit,
      needsUpgrade: true,
    }, { status: 403 })
  }
  
  // 3. Добавляем воркспейс
  const body = await request.json()
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: session.user.id,
      ...body,
    })
    .select()
    .single()
  
  if (error) {
    if (error.message.includes('Workspace limit exceeded')) {
      return NextResponse.json({
        error: 'Workspace limit exceeded',
        message: error.message,
        needsUpgrade: true,
      }, { status: 403 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
```

```js
// hooks/use-plan-limits.ts
'use client'

import { useUser } from '@/contexts/user-context'

export function usePlanLimits() {
  const { settings } = useUser()
  
  const canAddLink = () => {
    if (!settings) return false
    return settings.links_count < settings.links_limit
  }
  
  const canAddWorkspace = () => {
    if (!settings) return false
    
    // Agency plan = unlimited workspaces
    if (settings.plan === 'agency') return true
    
    return settings.workspaces_count < settings.workspaces_limit
  }
  
  const getRemainingLinks = () => {
    if (!settings) return 0
    return settings.links_limit - settings.links_count
  }
  
  const getRemainingWorkspaces = () => {
    if (!settings) return 0
    
    if (settings.plan === 'agency') return Infinity
    
    return settings.workspaces_limit - settings.workspaces_count
  }
  
  const getLinksPercentage = () => {
    if (!settings) return 0
    return (settings.links_count / settings.links_limit) * 100
  }
  
  const getWorkspacesPercentage = () => {
    if (!settings || settings.plan === 'agency') return 0
    return (settings.workspaces_count / settings.workspaces_limit) * 100
  }
  
  return {
    canAddLink: canAddLink(),
    canAddWorkspace: canAddWorkspace(),
    remainingLinks: getRemainingLinks(),
    remainingWorkspaces: getRemainingWorkspaces(),
    linksPercentage: getLinksPercentage(),
    workspacesPercentage: getWorkspacesPercentage(),
    settings,
  }
}
```


```js
// app/api/subscription/webhook/route.ts
// Stripe webhook для обновления плана

export async function POST(request: Request) {
  // ... Stripe webhook verification ...
  
  const event = await request.json()
  
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object
    
    // Определяем лимиты по плану
    const planLimits = {
      free: { links: 25, workspaces: 2 },
      basic: { links: 250, workspaces: 5 },
      pro: { links: 1000, workspaces: 15 },
      agency: { links: 10000, workspaces: 999999 }, // "unlimited"
    }
    
    const plan = subscription.items.data[0].price.lookup_key // 'basic', 'pro', etc.
    const limits = planLimits[plan]
    
    // Обновляем user_settings
    await supabase
      .from('user_settings')
      .update({
        plan,
        plan_status: subscription.status,
        links_limit: limits.links,
        workspaces_limit: limits.workspaces,
        current_period_end: new Date(subscription.current_period_end * 1000),
      })
      .eq('stripe_customer_id', subscription.customer)
  }
  
  return new Response('OK')
}
```


```js
// components/upgrade-modal.tsx
'use client'

import Link from 'next/link'

interface UpgradeModalProps {
  onClose: () => void
  message: string
  currentPlan?: string
}

export function UpgradeModal({ onClose, message, currentPlan }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Upgrade Required</h2>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="space-y-3">
          {currentPlan === 'free' && (
            <>
              <div className="border rounded p-3">
                <div className="font-semibold">Basic - $12/mo</div>
                <div className="text-sm text-gray-600">
                  250 links, 5 workspaces
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="font-semibold">Pro - $24/mo</div>
                <div className="text-sm text-gray-600">
                  1,000 links, 15 workspaces
                </div>
              </div>
            </>
          )}
          
          {currentPlan === 'basic' && (
            <div className="border rounded p-3">
              <div className="font-semibold">Pro - $24/mo</div>
              <div className="text-sm text-gray-600">
                1,000 links, 15 workspaces
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <Link 
            href="/dashboard/billing"
            className="flex-1 btn-primary text-center"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  )
}
```