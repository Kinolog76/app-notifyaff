import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { checkLinkWithRetry } from "@/lib/link-checker-retry";
import { storeLinkCheck } from "@/lib/link-check-storage";
import { setLinkChecking, updateLinkStatusFromCheck } from "@/lib/link-status-updater";

const BATCH_SIZE = 50;
const RATE_LIMIT_DELAY_MS = 100; // 100ms between requests to avoid overwhelming servers

interface PlanCheckFrequency {
  free: number;    // hours between checks
  basic: number;
  pro: number;
  agency: number;
}

// Step 38: Filter by user plan (daily for basic, 2x/day for pro)
const PLAN_CHECK_FREQUENCIES: PlanCheckFrequency = {
  free: 168,    // Weekly (7 days * 24 hours)
  basic: 24,    // Daily
  pro: 12,      // 2x per day
  agency: 6,    // 4x per day
};

/**
 * Verify the request is from Vercel Cron
 * Security check to prevent unauthorized access
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
 * Delay execution to rate limit requests
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check a single link and store results
 * Uses retry logic (Steps 43-45) for resilient checking
 */
async function checkSingleLink(linkId: string, url: string) {
  try {
    // Set status to checking
    await setLinkChecking(linkId);

    // Perform the check with retry logic (Steps 43-45)
    const checkResult = await checkLinkWithRetry(url);

    // Store the check result (Step 46: includes retry_count)
    await storeLinkCheck({ linkId, checkResult });

    // Update link status
    const statusResult = await updateLinkStatusFromCheck(linkId, checkResult);

    return {
      linkId,
      success: true,
      status: statusResult.status,
      statusCode: checkResult.statusCode,
      responseTime: checkResult.responseTime,
      retryCount: checkResult.retryCount,
      confidenceScore: checkResult.confidenceScore,
    };
  } catch (error) {
    console.error(`Failed to check link ${linkId}:`, error);
    return {
      linkId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process a batch of links with rate limiting
 * Step 39: Process links in batches (50 at a time)
 * Step 41: Add rate limiting to avoid overwhelming servers
 */
async function processBatch(links: Array<{ id: string; url: string }>) {
  const results = [];

  for (const link of links) {
    const result = await checkSingleLink(link.id, link.url);
    results.push(result);

    // Rate limiting delay between requests
    if (links.indexOf(link) < links.length - 1) {
      await delay(RATE_LIMIT_DELAY_MS);
    }
  }

  return results;
}

/**
 * GET /api/cron/check-links
 * Scheduled link checking cron job
 * Steps 35-42: Create cron route, fetch links, filter by plan, process in batches, log execution
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify this is a legitimate cron request
  if (!verifyCronSecret(request)) {
    console.error('Unauthorized cron request attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Step 42: Log cron job execution
    console.log('[CRON] Starting scheduled link check job');

    const supabase = await createClient();

    // Step 37 & 38: Fetch links that need checking based on last_checked_at and user plan
    const { data: linksToCheck, error: fetchError } = await supabase
      .from('links')
      .select(`
        id,
        url,
        last_checked_at,
        user_id,
        user_settings!inner(plan)
      `)
      .order('last_checked_at', { ascending: true, nullsFirst: true });

    if (fetchError) {
      console.error('[CRON] Failed to fetch links:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch links', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!linksToCheck || linksToCheck.length === 0) {
      console.log('[CRON] No links found to check');
      return NextResponse.json({
        message: 'No links to check',
        stats: {
          totalChecked: 0,
          duration: Date.now() - startTime,
        },
      });
    }

    // Filter links that need checking based on plan frequency
    const now = new Date();
    const linksNeedingCheck = linksToCheck.filter((link: any) => {
      const plan = link.user_settings?.plan || 'free';
      const checkFrequencyHours = PLAN_CHECK_FREQUENCIES[plan as keyof PlanCheckFrequency] || 24;

      if (!link.last_checked_at) {
        // Never checked - needs checking
        return true;
      }

      const lastChecked = new Date(link.last_checked_at);
      const hoursSinceCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);

      return hoursSinceCheck >= checkFrequencyHours;
    });

    console.log(`[CRON] Found ${linksNeedingCheck.length} links needing check (out of ${linksToCheck.length} total)`);

    if (linksNeedingCheck.length === 0) {
      return NextResponse.json({
        message: 'No links need checking at this time',
        stats: {
          totalLinks: linksToCheck.length,
          linksNeedingCheck: 0,
          duration: Date.now() - startTime,
        },
      });
    }

    // Step 39 & 40: Process links in batches with queue system
    const batches = [];
    for (let i = 0; i < linksNeedingCheck.length; i += BATCH_SIZE) {
      batches.push(linksNeedingCheck.slice(i, i + BATCH_SIZE));
    }

    console.log(`[CRON] Processing ${batches.length} batch(es) of up to ${BATCH_SIZE} links`);

    let totalChecked = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    const allResults = [];

    // Process batches sequentially to avoid overwhelming the system
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[CRON] Processing batch ${i + 1}/${batches.length} (${batch.length} links)`);

      const batchResults = await processBatch(
        batch.map((link: any) => ({ id: link.id, url: link.url }))
      );

      totalChecked += batchResults.length;
      totalSuccessful += batchResults.filter(r => r.success).length;
      totalFailed += batchResults.filter(r => !r.success).length;

      allResults.push(...batchResults);

      // Small delay between batches
      if (i < batches.length - 1) {
        await delay(500);
      }
    }

    const duration = Date.now() - startTime;

    // Step 42: Log cron job completion
    console.log(`[CRON] Completed link check job in ${duration}ms`);
    console.log(`[CRON] Stats: ${totalChecked} checked, ${totalSuccessful} successful, ${totalFailed} failed`);

    return NextResponse.json({
      message: 'Link check completed',
      stats: {
        totalLinks: linksToCheck.length,
        linksNeedingCheck: linksNeedingCheck.length,
        totalChecked,
        totalSuccessful,
        totalFailed,
        batchesProcessed: batches.length,
        duration,
      },
      results: allResults.slice(0, 100), // Return first 100 results to avoid huge response
    });
  } catch (error) {
    console.error('[CRON] Unexpected error in check-links cron:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
