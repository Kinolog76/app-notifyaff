import { checkLink, LinkCheckResult } from './link-checker';

const MAX_RETRIES = 3;
const BACKOFF_DELAYS_MS = [1000, 2000, 4000]; // Step 44: Exponential backoff (1s, 2s, 4s)

export interface RetryCheckResult extends LinkCheckResult {
  retryCount: number;
  confidenceScore: number;
  retryHistory?: Array<{
    attempt: number;
    error?: string;
    statusCode?: number | null;
    timestamp: Date;
  }>;
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if an error/result warrants a retry
 * Only retry on transient errors (network issues, timeouts, 5xx errors)
 */
function shouldRetry(result: LinkCheckResult, attemptNumber: number): boolean {
  // Don't retry if we've exhausted attempts
  if (attemptNumber >= MAX_RETRIES) {
    return false;
  }

  // Don't retry successful checks
  if (result.success && result.statusCode && result.statusCode >= 200 && result.statusCode < 300) {
    return false;
  }

  // Retry on network errors (no status code)
  if (result.statusCode === null) {
    return true;
  }

  // Retry on 5xx server errors (temporary issues)
  if (result.statusCode >= 500 && result.statusCode < 600) {
    return true;
  }

  // Retry on 429 (rate limiting)
  if (result.statusCode === 429) {
    return true;
  }

  // Retry on 408 (request timeout)
  if (result.statusCode === 408) {
    return true;
  }

  // Don't retry on 4xx client errors (permanent failures)
  // These indicate bad URLs, not found, forbidden, etc.
  return false;
}

/**
 * Calculate confidence score based on retry attempts
 * Step 47: Add confidence score (100% after 3 fails)
 */
function calculateConfidenceScore(
  finalResult: LinkCheckResult,
  attemptNumber: number
): number {
  // If successful, confidence is high
  if (finalResult.success) {
    return 100;
  }

  // Failed after all retries - 100% confident it's broken
  if (attemptNumber >= MAX_RETRIES) {
    return 100;
  }

  // Failed on client errors (4xx) without retries - highly confident
  if (finalResult.statusCode && finalResult.statusCode >= 400 && finalResult.statusCode < 500) {
    return 95;
  }

  // Failed quickly without exhausting retries - less confident
  const confidencePerAttempt = 100 / MAX_RETRIES;
  return Math.round(attemptNumber * confidencePerAttempt);
}

/**
 * Check a link with retry logic
 * Steps 43-47: Implement retry function with exponential backoff
 */
export async function checkLinkWithRetry(url: string): Promise<RetryCheckResult> {
  let attemptNumber = 0;
  let lastResult: LinkCheckResult | null = null;
  const retryHistory: Array<{
    attempt: number;
    error?: string;
    statusCode?: number | null;
    timestamp: Date;
  }> = [];

  // Step 43: Implement retry function (3 attempts)
  while (attemptNumber < MAX_RETRIES) {
    attemptNumber++;

    try {
      const result = await checkLink(url);
      lastResult = result;

      // Record this attempt
      retryHistory.push({
        attempt: attemptNumber,
        statusCode: result.statusCode,
        error: result.error,
        timestamp: new Date(),
      });

      // Check if we should retry
      if (!shouldRetry(result, attemptNumber)) {
        // Success or permanent failure - no need to retry
        const confidenceScore = calculateConfidenceScore(result, attemptNumber);

        return {
          ...result,
          retryCount: attemptNumber - 1, // Number of retries (not total attempts)
          confidenceScore,
          retryHistory,
        };
      }

      // Need to retry - apply backoff delay
      if (attemptNumber < MAX_RETRIES) {
        const delayMs = BACKOFF_DELAYS_MS[attemptNumber - 1] || BACKOFF_DELAYS_MS[BACKOFF_DELAYS_MS.length - 1];
        console.log(`[Retry] Attempt ${attemptNumber} failed for ${url}. Retrying in ${delayMs}ms...`);
        await delay(delayMs);
      }
    } catch (error) {
      // Unexpected error during check
      retryHistory.push({
        attempt: attemptNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });

      // If this was the last attempt, return error result
      if (attemptNumber >= MAX_RETRIES) {
        const errorResult: LinkCheckResult = {
          success: false,
          finalUrl: url,
          statusCode: null,
          responseTime: 0,
          redirectChain: [url],
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        };

        return {
          ...errorResult,
          retryCount: MAX_RETRIES - 1,
          confidenceScore: 100,
          retryHistory,
        };
      }

      // Retry after backoff
      const delayMs = BACKOFF_DELAYS_MS[attemptNumber - 1] || BACKOFF_DELAYS_MS[BACKOFF_DELAYS_MS.length - 1];
      await delay(delayMs);
    }
  }

  // Step 45: Only mark as broken after all retries fail
  // All retries exhausted, return the last result
  if (lastResult) {
    const confidenceScore = calculateConfidenceScore(lastResult, attemptNumber);

    return {
      ...lastResult,
      retryCount: MAX_RETRIES - 1,
      confidenceScore,
      retryHistory,
    };
  }

  // Fallback (should never reach here)
  const fallbackResult: LinkCheckResult = {
    success: false,
    finalUrl: url,
    statusCode: null,
    responseTime: 0,
    redirectChain: [url],
    error: 'All retry attempts failed',
    timestamp: new Date(),
  };

  return {
    ...fallbackResult,
    retryCount: MAX_RETRIES - 1,
    confidenceScore: 100,
    retryHistory,
  };
}

/**
 * Configuration for retry behavior
 */
export const RetryConfig = {
  maxRetries: MAX_RETRIES,
  backoffDelays: BACKOFF_DELAYS_MS,

  /**
   * Get the delay for a specific retry attempt (0-indexed)
   */
  getBackoffDelay(attemptIndex: number): number {
    return BACKOFF_DELAYS_MS[attemptIndex] || BACKOFF_DELAYS_MS[BACKOFF_DELAYS_MS.length - 1];
  },
};
