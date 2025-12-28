'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface PlanSettings {
  plan: 'free' | 'basic' | 'pro' | 'agency'
  plan_status: string | null
  links_count: number
  links_limit: number
  workspaces_count: number
  workspaces_limit: number
}

export function usePlanLimits() {
  const [settings, setSettings] = useState<PlanSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user_settings')
        .select('plan, plan_status, links_count, links_limit, workspaces_count, workspaces_limit')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings(data as PlanSettings)
      }
      setLoading(false)
    }

    fetchSettings()

    // Subscribe to realtime changes
    const supabase = createClient()
    const channel = supabase
      .channel('user_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
        },
        (payload) => {
          setSettings(payload.new as PlanSettings)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
    return Math.max(0, settings.links_limit - settings.links_count)
  }

  const getRemainingWorkspaces = () => {
    if (!settings) return 0

    if (settings.plan === 'agency') return Infinity

    return Math.max(0, settings.workspaces_limit - settings.workspaces_count)
  }

  const getLinksPercentage = () => {
    if (!settings) return 0
    return Math.min(100, (settings.links_count / settings.links_limit) * 100)
  }

  const getWorkspacesPercentage = () => {
    if (!settings || settings.plan === 'agency') return 0
    return Math.min(100, (settings.workspaces_count / settings.workspaces_limit) * 100)
  }

  return {
    settings,
    loading,
    canAddLink: canAddLink(),
    canAddWorkspace: canAddWorkspace(),
    remainingLinks: getRemainingLinks(),
    remainingWorkspaces: getRemainingWorkspaces(),
    linksPercentage: getLinksPercentage(),
    workspacesPercentage: getWorkspacesPercentage(),
  }
}
