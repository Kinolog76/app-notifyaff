"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Clock, TrendingUp, Link as LinkIcon } from "lucide-react";

interface Link {
  id: string;
  status: "active" | "inactive" | "broken" | "warning";
  last_checked_at?: string;
  created_at: string;
}

interface StatsOverviewCardProps {
  links: Link[];
}

export const StatsOverviewCard = ({ links }: StatsOverviewCardProps) => {
  const stats = {
    total: links.length,
    active: links.filter((l) => l.status === "active").length,
    warning: links.filter((l) => l.status === "warning").length,
    broken: links.filter((l) => l.status === "broken").length,
    inactive: links.filter((l) => l.status === "inactive").length,
    neverChecked: links.filter((l) => !l.last_checked_at).length,
  };

  const healthPercentage = stats.total > 0
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  const recentLinks = links.filter((l) => {
    const createdAt = new Date(l.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return createdAt > dayAgo;
  }).length;

  const statCards = [
    {
      label: "Total Links",
      value: stats.total,
      icon: LinkIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Active",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Warning",
      value: stats.warning,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      label: "Broken",
      value: stats.broken,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950",
    },
    {
      label: "Added Today",
      value: recentLinks,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Link Statistics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your affiliate link health
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{healthPercentage}%</div>
          <p className="text-xs text-muted-foreground">Health Score</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className={`${stat.bgColor} p-3 rounded-full mb-2`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground text-center">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {stats.neverChecked > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            {stats.neverChecked} link{stats.neverChecked !== 1 ? "s" : ""} haven&apos;t been checked yet
          </p>
        </div>
      )}
    </Card>
  );
};
