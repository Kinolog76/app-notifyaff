"use client";

import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DateRangePicker, DateRange } from "@/components/analytics/DateRangePicker";
import { ExportButton } from "@/components/analytics/ExportButton";
import { OverviewStats } from "@/components/analytics/OverviewStats";
import { LinkHealthChart } from "@/components/analytics/LinkHealthChart";
import { ResponseTimeChart } from "@/components/analytics/ResponseTimeChart";
import { TopBrokenLinks } from "@/components/analytics/TopBrokenLinks";
import { SlowestLinks } from "@/components/analytics/SlowestLinks";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { CategoryTable } from "@/components/analytics/CategoryTable";
import {
  getOverviewStats,
  getLinkHealthData,
  getResponseTimeData,
  getTopBrokenLinks,
  getSlowestLinks,
  getStatusDistribution,
  getCategoryPerformance,
  OverviewStats as OverviewStatsType,
  LinkHealthData,
  ResponseTimeData,
  BrokenLink,
  SlowestLink,
  StatusDistribution,
  CategoryPerformance,
} from "@/lib/analytics/queries";
import { ExportData } from "@/lib/analytics/export";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStatsType>({
    totalChecks: 0,
    avgResponseTime: 0,
    uptimeRate: 0,
  });
  const [healthData, setHealthData] = useState<LinkHealthData[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>([]);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [slowestLinks, setSlowestLinks] = useState<SlowestLink[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          stats,
          health,
          responseTime,
          broken,
          slowest,
          status,
          categories,
        ] = await Promise.all([
          getOverviewStats(dateRange.from, dateRange.to),
          getLinkHealthData(dateRange.from, dateRange.to),
          getResponseTimeData(dateRange.from, dateRange.to),
          getTopBrokenLinks(dateRange.from, dateRange.to, 10),
          getSlowestLinks(dateRange.from, dateRange.to, 10),
          getStatusDistribution(),
          getCategoryPerformance(),
        ]);

        setOverviewStats(stats);
        setHealthData(health);
        setResponseTimeData(responseTime);
        setBrokenLinks(broken);
        setSlowestLinks(slowest);
        setStatusDistribution(status);
        setCategoryPerformance(categories);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const exportData: ExportData = {
    overview: overviewStats,
    brokenLinks,
    slowestLinks,
    categoryPerformance,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Insights into link health, performance trends, and system usage
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <ExportButton data={exportData} dateRange={dateRange} disabled={isLoading} />
          </div>
        </div>

        {/* Overview Stats */}
        <OverviewStats stats={overviewStats} isLoading={isLoading} />

        {/* Charts */}
        <div className="grid gap-6">
          <LinkHealthChart data={healthData} isLoading={isLoading} />
          <ResponseTimeChart data={responseTimeData} isLoading={isLoading} />
        </div>

        {/* Top Lists */}
        <div className="grid gap-6 md:grid-cols-2">
          <TopBrokenLinks data={brokenLinks} isLoading={isLoading} />
          <SlowestLinks data={slowestLinks} isLoading={isLoading} />
        </div>

        {/* Distribution and Performance */}
        <StatusPieChart data={statusDistribution} isLoading={isLoading} />
        <CategoryTable data={categoryPerformance} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
