'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  onClose: () => void
  message: string
  currentPlan?: 'free' | 'basic' | 'pro' | 'agency'
  type?: 'links' | 'workspaces'
}

const PLAN_DETAILS = {
  basic: {
    name: 'Basic',
    price: '$12/mo',
    links: '250 links',
    workspaces: '5 workspaces',
    features: ['Daily checks', 'Email alerts'],
  },
  pro: {
    name: 'Pro',
    price: '$24/mo',
    links: '1,000 links',
    workspaces: '15 workspaces',
    features: ['2x/day checks', 'Full analytics', 'Priority support'],
  },
  agency: {
    name: 'Agency',
    price: '$79/mo',
    links: '10,000 links',
    workspaces: 'Unlimited workspaces',
    features: ['4x/day checks', 'API access', 'White label', 'Dedicated support'],
  },
}

export function UpgradeModal({ onClose, message, currentPlan = 'free', type }: UpgradeModalProps) {
  const getRecommendedPlans = () => {
    if (currentPlan === 'free') {
      return ['basic', 'pro', 'agency'] as const
    } else if (currentPlan === 'basic') {
      return ['pro', 'agency'] as const
    } else if (currentPlan === 'pro') {
      return ['agency'] as const
    }
    return [] as const
  }

  const recommendedPlans = getRecommendedPlans()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upgrade Required</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          <div className="space-y-4">
            {recommendedPlans.map((planKey, index) => {
              const plan = PLAN_DETAILS[planKey]
              return (
                <div
                  key={planKey}
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {index === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {plan.price}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">✓</span>
                      <span>{plan.links}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">✓</span>
                      <span>{plan.workspaces}</span>
                    </div>
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/dashboard/billing">
                    <Button className="w-full" variant={index === 0 ? "default" : "outline"}>
                      Upgrade to {plan.name}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 text-center">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t p-6">
          <Button onClick={onClose} variant="outline" className="w-full">
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  )
}
