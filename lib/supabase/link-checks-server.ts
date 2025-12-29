import { createClient } from '@/utils/supabase/server';

export interface LinkCheckInsert {
  link_id: string;
  status_code: number | null;
  response_time_ms: number;
  redirect_chain: string[] | null;
  error_message: string | null;
}

export interface LinkCheck {
  id: string;
  link_id: string;
  status_code: number | null;
  response_time_ms: number;
  redirect_chain: string[] | null;
  error_message: string | null;
  checked_at: string;
}

export interface CheckStats {
  avgResponseTime: number;
  successRate: number;
  totalChecks: number;
}

export async function insertLinkCheck(data: LinkCheckInsert): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('link_checks')
      .insert(data);

    if (error) {
      console.error('Failed to insert link check:', error);
      // Don't throw - log and continue (graceful degradation)
    }
  } catch (error) {
    console.error('Unexpected error inserting link check:', error);
    // Store failed inserts in fallback queue could be implemented here
  }
}

export async function getLinkCheckHistory(linkId: string, limit = 100): Promise<LinkCheck[]> {
  const supabase = await createClient();

  // Limit history queries to last 100 checks
  const effectiveLimit = Math.min(limit, 100);

  const { data, error } = await supabase
    .from('link_checks')
    .select('*')
    .eq('link_id', linkId)
    .order('checked_at', { ascending: false })
    .limit(effectiveLimit);

  if (error) {
    console.error('Failed to fetch link check history:', error);
    return [];
  }

  return data || [];
}

export async function getLatestLinkCheck(linkId: string): Promise<LinkCheck | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('link_checks')
    .select('*')
    .eq('link_id', linkId)
    .order('checked_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch latest link check:', error);
    return null;
  }

  return data;
}

export async function getCheckStats(linkId: string): Promise<CheckStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('link_checks')
    .select('status_code, response_time_ms')
    .eq('link_id', linkId)
    .limit(100); // Limit to last 100 checks for stats

  if (error || !data || data.length === 0) {
    return {
      avgResponseTime: 0,
      successRate: 0,
      totalChecks: 0,
    };
  }

  const totalChecks = data.length;
  const successfulChecks = data.filter(
    (check) => check.status_code && check.status_code >= 200 && check.status_code < 400
  ).length;
  const totalResponseTime = data.reduce(
    (sum, check) => sum + (check.response_time_ms || 0),
    0
  );

  return {
    avgResponseTime: Math.round(totalResponseTime / totalChecks),
    successRate: Math.round((successfulChecks / totalChecks) * 100),
    totalChecks,
  };
}
