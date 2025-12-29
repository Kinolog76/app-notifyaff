import { createClient } from "@/lib/supabase/client";

export interface OverviewStats {
  totalChecks: number;
  avgResponseTime: number;
  uptimeRate: number;
}

export interface LinkHealthData {
  date: string;
  active_count: number;
  broken_count: number;
  warning_count: number;
}

export interface ResponseTimeData {
  date: string;
  avg_response: number;
  min_response: number;
  max_response: number;
}

export interface BrokenLink {
  id: string;
  url: string;
  category: string | null;
  broken_count: number;
  last_broken: string;
}

export interface SlowestLink {
  id: string;
  url: string;
  category: string | null;
  avg_response: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface CategoryPerformance {
  category: string;
  total_links: number;
  active_links: number;
  broken_links: number;
  avg_response: number;
}

export const getOverviewStats = async (
  from: Date,
  to: Date
): Promise<OverviewStats> => {
  const supabase = createClient();

  // Get current user's links
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  // Get user's link IDs
  const { data: userLinks } = await supabase
    .from("links")
    .select("id")
    .eq("user_id", userData.user.id);

  const linkIds = userLinks?.map((link) => link.id) || [];

  if (linkIds.length === 0) {
    return {
      totalChecks: 0,
      avgResponseTime: 0,
      uptimeRate: 0,
    };
  }

  // Total Checks
  const { count: totalChecks } = await supabase
    .from("link_checks")
    .select("*", { count: "exact", head: true })
    .gte("checked_at", from.toISOString())
    .lte("checked_at", to.toISOString())
    .in("link_id", linkIds);

  // Average Response Time
  const { data: avgData } = await supabase
    .from("link_checks")
    .select("response_time_ms")
    .gte("checked_at", from.toISOString())
    .lte("checked_at", to.toISOString())
    .eq("status_code", 200)
    .in("link_id", linkIds);

  const avgResponseTime = avgData && avgData.length > 0
    ? avgData.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / avgData.length
    : 0;

  // Uptime Rate
  const { data: uptimeData } = await supabase
    .from("link_checks")
    .select("status_code")
    .gte("checked_at", from.toISOString())
    .lte("checked_at", to.toISOString())
    .in("link_id", linkIds);

  const uptimeRate = uptimeData && uptimeData.length > 0
    ? (uptimeData.filter((item) => item.status_code === 200).length / uptimeData.length) * 100
    : 0;

  return {
    totalChecks: totalChecks || 0,
    avgResponseTime: Math.round(avgResponseTime),
    uptimeRate: Math.round(uptimeRate * 100) / 100,
  };
};

export const getLinkHealthData = async (
  from: Date,
  to: Date
): Promise<LinkHealthData[]> => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data } = await supabase.rpc("get_link_health_over_time", {
    p_user_id: userData.user.id,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });

  return data || [];
};

export const getResponseTimeData = async (
  from: Date,
  to: Date
): Promise<ResponseTimeData[]> => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data } = await supabase.rpc("get_response_time_trends", {
    p_user_id: userData.user.id,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });

  return data || [];
};

export const getTopBrokenLinks = async (
  from: Date,
  to: Date,
  limit: number = 10
): Promise<BrokenLink[]> => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data } = await supabase.rpc("get_top_broken_links", {
    p_user_id: userData.user.id,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
    p_limit: limit,
  });

  return data || [];
};

export const getSlowestLinks = async (
  from: Date,
  to: Date,
  limit: number = 10
): Promise<SlowestLink[]> => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data } = await supabase.rpc("get_slowest_links", {
    p_user_id: userData.user.id,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
    p_limit: limit,
  });

  return data || [];
};

export const getStatusDistribution = async (): Promise<StatusDistribution[]> => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("links")
    .select("status")
    .eq("user_id", userData.user.id);

  if (!data) return [];

  const distribution: { [key: string]: number } = {};
  data.forEach((item) => {
    const status = item.status || "unknown";
    distribution[status] = (distribution[status] || 0) + 1;
  });

  return Object.entries(distribution).map(([status, count]) => ({
    status,
    count,
  }));
};

export const getCategoryPerformance = async (): Promise<CategoryPerformance[]> => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data } = await supabase.rpc("get_category_performance", {
    p_user_id: userData.user.id,
  });

  return data || [];
};
