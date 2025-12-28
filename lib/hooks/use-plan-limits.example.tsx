/**
 * Example usage of usePlanLimits hook and UpgradeModal component
 *
 * This file demonstrates how to integrate plan restrictions into your UI components
 */

'use client'

import { useState } from 'react'
import { usePlanLimits } from '@/lib/hooks/use-plan-limits'
import { UpgradeModal } from '@/components/upgrade-modal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Example 1: Add Link Button with Plan Check
export function AddLinkButton() {
  const { canAddLink, remainingLinks, settings, loading } = usePlanLimits()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleAddLink = async () => {
    if (!canAddLink) {
      setShowUpgradeModal(true)
      return
    }

    // Proceed with adding link
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
        name: 'Example Link',
      }),
    })

    const result = await response.json()

    if (response.status === 403 && result.needsUpgrade) {
      setShowUpgradeModal(true)
      toast.error(result.message)
    } else if (response.ok) {
      toast.success('Link added successfully')
    } else {
      toast.error(result.error || 'Failed to add link')
    }
  }

  return (
    <>
      <Button
        onClick={handleAddLink}
        disabled={loading || !canAddLink}
      >
        Add Link {!loading && remainingLinks > 0 && `(${remainingLinks} remaining)`}
      </Button>

      {showUpgradeModal && settings && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          message={`You've reached your limit of ${settings.links_limit} links on the ${settings.plan} plan.`}
          currentPlan={settings.plan}
          type="links"
        />
      )}
    </>
  )
}

// Example 2: Create Workspace Button with Plan Check
export function CreateWorkspaceButton() {
  const { canAddWorkspace, remainingWorkspaces, settings, loading } = usePlanLimits()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleCreateWorkspace = async () => {
    if (!canAddWorkspace) {
      setShowUpgradeModal(true)
      return
    }

    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Workspace',
        color: '#3b82f6',
      }),
    })

    const result = await response.json()

    if (response.status === 403 && result.needsUpgrade) {
      setShowUpgradeModal(true)
      toast.error(result.message)
    } else if (response.ok) {
      toast.success('Workspace created successfully')
    } else {
      toast.error(result.error || 'Failed to create workspace')
    }
  }

  return (
    <>
      <Button
        onClick={handleCreateWorkspace}
        disabled={loading || !canAddWorkspace}
      >
        New Workspace
        {!loading && isFinite(remainingWorkspaces) && remainingWorkspaces > 0 &&
          ` (${remainingWorkspaces} remaining)`}
      </Button>

      {showUpgradeModal && settings && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          message={`You've reached your limit of ${settings.workspaces_limit} workspaces on the ${settings.plan} plan.`}
          currentPlan={settings.plan}
          type="workspaces"
        />
      )}
    </>
  )
}

// Example 3: Plan Usage Display
export function PlanUsageDisplay() {
  const {
    settings,
    linksPercentage,
    workspacesPercentage,
    remainingLinks,
    remainingWorkspaces,
    loading,
  } = usePlanLimits()

  if (loading || !settings) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Links Usage</span>
          <span className="text-gray-500">
            {settings.links_count} / {settings.links_limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              linksPercentage >= 90
                ? 'bg-red-500'
                : linksPercentage >= 70
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${linksPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {remainingLinks} links remaining
        </p>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Workspaces Usage</span>
          <span className="text-gray-500">
            {settings.workspaces_count} /{' '}
            {settings.plan === 'agency' ? '∞' : settings.workspaces_limit}
          </span>
        </div>
        {settings.plan !== 'agency' && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  workspacesPercentage >= 90
                    ? 'bg-red-500'
                    : workspacesPercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${workspacesPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {remainingWorkspaces} workspaces remaining
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// Example 4: Bulk Import with Plan Check
export function BulkImportButton() {
  const { settings, loading } = usePlanLimits()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleBulkImport = async (links: any[]) => {
    const response = await fetch('/api/links/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
    })

    const result = await response.json()

    if (response.status === 403 && result.needsUpgrade) {
      setShowUpgradeModal(true)
      toast.error(result.message)
    } else if (response.ok) {
      toast.success(result.message)
    } else {
      toast.error(result.error || 'Failed to import links')
    }
  }

  return (
    <>
      <Button onClick={() => handleBulkImport([])}>
        Import Links
      </Button>

      {showUpgradeModal && settings && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          message="You've reached your plan limit and cannot import more links."
          currentPlan={settings.plan}
          type="links"
        />
      )}
    </>
  )
}
