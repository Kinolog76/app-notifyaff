"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatResponseTime, formatUptime } from "@/lib/analytics/calculations";
import { OverviewStats as OverviewStatsType } from "@/lib/analytics/queries";
import { Activity, Clock, TrendingUp } from "lucide-react";

interface OverviewStatsProps {
  stats: OverviewStatsType;
  isLoading?: boolean;
}

export const OverviewStats = ({ stats, isLoading }: OverviewStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Total Checks",
      value: stats.totalChecks.toLocaleString(),
      icon: Activity,
      description: "Total link checks performed",
    },
    {
      title: "Avg Response Time",
      value: formatResponseTime(stats.avgResponseTime),
      icon: Clock,
      description: "Average response time across all checks",
    },
    {
      title: "Uptime Rate",
      value: formatUptime(stats.uptimeRate),
      icon: TrendingUp,
      description: "Percentage of successful checks",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
