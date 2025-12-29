import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Retention periods by plan (in days)
const RETENTION_PERIODS = {
  free: 30,
  basic: 90,
  pro: 365,
  agency: null, // unlimited
};

const MIN_CHECKS_TO_KEEP = 10; // Always keep at least last 10 checks

/**
 * Verify the request is from Vercel Cron
 */
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request in development');
    return process.env.NODE_ENV === 'development';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/cleanup-old-checks
 * Weekly cleanup job for old link_checks records
 * Steps 73-77: Delete old checks based on user plan retention
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  if (!verifyCronSecret(request)) {
    console.error('Unauthorized cleanup cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[CLEANUP] Starting old checks cleanup job');

    const supabase = await createClient();

    // Get all links with user plan info
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select(`
        id,
        user_id,
        user_settings!inner(plan)
      `);

    if (linksError) {
      console.error('[CLEANUP] Failed to fetch links:', linksError);
      return NextResponse.json(
        { error: 'Failed to fetch links', details: linksError.message },
        { status: 500 }
      );
    }

    if (!links || links.length === 0) {
      console.log('[CLEANUP] No links found');
      return NextResponse.json({
        message: 'No links to cleanup',
        stats: { totalProcessed: 0, totalDeleted: 0, duration: Date.now() - startTime },
      });
    }

    let totalProcessed = 0;
    let totalDeleted = 0;

    // Process each link based on user's plan
    for (const link of links) {
      const plan = (link.user_settings as any)?.plan || 'free';
      const retentionDays = RETENTION_PERIODS[plan as keyof typeof RETENTION_PERIODS];

      // Skip if plan has unlimited retention
      if (retentionDays === null) {
        continue;
      }

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Count total checks for this link
      const { count: totalChecks } = await supabase
        .from('link_checks')
        .select('*', { count: 'exact', head: true })
        .eq('link_id', link.id);

      // Only delete if we have more than MIN_CHECKS_TO_KEEP
      if ((totalChecks || 0) <= MIN_CHECKS_TO_KEEP) {
        continue;
      }

      // Get IDs of checks to keep (last N checks)
      const { data: checksToKeep } = await supabase
        .from('link_checks')
        .select('id')
        .eq('link_id', link.id)
        .order('checked_at', { ascending: false })
        .limit(MIN_CHECKS_TO_KEEP);

      const keepIds = checksToKeep?.map(c => c.id) || [];

      // Delete old checks (older than retention period AND not in keep list)
      const { error: deleteError, count } = await supabase
        .from('link_checks')
        .delete({ count: 'exact' })
        .eq('link_id', link.id)
        .lt('checked_at', cutoffDate.toISOString())
        .not('id', 'in', `(${keepIds.join(',')})`);

      if (deleteError) {
        console.error(`[CLEANUP] Error deleting checks for link ${link.id}:`, deleteError);
        continue;
      }

      if (count && count > 0) {
        console.log(`[CLEANUP] Deleted ${count} old checks for link ${link.id} (plan: ${plan})`);
        totalDeleted += count;
      }

      totalProcessed++;
    }

    const duration = Date.now() - startTime;

    console.log(`[CLEANUP] Completed cleanup job in ${duration}ms`);
    console.log(`[CLEANUP] Stats: ${totalProcessed} links processed, ${totalDeleted} checks deleted`);

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      stats: {
        totalLinks: links.length,
        totalProcessed,
        totalDeleted,
        duration,
      },
    });
  } catch (error) {
    console.error('[CLEANUP] Unexpected error in cleanup cron:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
