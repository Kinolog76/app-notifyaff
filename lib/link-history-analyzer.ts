import { LinkCheckRecord } from './link-check-storage';

export interface StatusChange {
  from: 'active' | 'broken' | 'warning';
  to: 'active' | 'broken' | 'warning';
  timestamp: Date;
  checkId: string;
}

export interface HistoryAnalysis {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  uptimePercentage: number;
  statusChanges: StatusChange[];
  lastBreakTimestamp?: Date;
  totalRetries: number;
  averageConfidence: number;
}

/**
 * Determine status from a check record
 */
export function getStatusFromCheck(check: LinkCheckRecord): 'active' | 'broken' | 'warning' {
  if (!check.status_code) return 'warning';
  if (check.status_code >= 200 && check.status_code < 300) return 'active';
  if (check.status_code === 404 || check.status_code === 410) return 'broken';
  if (check.status_code >= 400) return 'broken';
  if (check.status_code >= 500) return 'warning';
  return 'warning';
}

/**
 * Analyze check history to extract insights
 * Step 48-49: Create check history query function and fetch last checks
 * Step 51: Show status changes over time
 * Step 53: Highlight when link broke
 */
export function analyzeCheckHistory(checks: LinkCheckRecord[]): HistoryAnalysis {
  if (checks.length === 0) {
    return {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      uptimePercentage: 0,
      statusChanges: [],
      totalRetries: 0,
      averageConfidence: 0,
    };
  }

  // Sort by timestamp (newest first)
  const sortedChecks = [...checks].sort(
    (a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
  );

  // Calculate basic metrics
  const totalChecks = sortedChecks.length;
  const successfulChecks = sortedChecks.filter(
    (check) => check.status_code !== null && check.status_code >= 200 && check.status_code < 400
  ).length;
  const failedChecks = totalChecks - successfulChecks;

  // Calculate average response time
  const totalResponseTime = sortedChecks.reduce(
    (sum, check) => sum + (check.response_time_ms || 0),
    0
  );
  const averageResponseTime = Math.round(totalResponseTime / totalChecks);

  // Calculate uptime percentage
  const uptimePercentage = (successfulChecks / totalChecks) * 100;

  // Detect status changes (Step 51)
  const statusChanges: StatusChange[] = [];
  for (let i = 0; i < sortedChecks.length - 1; i++) {
    const currentCheck = sortedChecks[i];
    const previousCheck = sortedChecks[i + 1];

    const currentStatus = getStatusFromCheck(currentCheck);
    const previousStatus = getStatusFromCheck(previousCheck);

    if (currentStatus !== previousStatus) {
      statusChanges.push({
        from: previousStatus,
        to: currentStatus,
        timestamp: new Date(currentCheck.checked_at),
        checkId: currentCheck.id!,
      });
    }
  }

  // Find when link last broke (Step 53)
  let lastBreakTimestamp: Date | undefined;
  for (const change of statusChanges) {
    if (change.from === 'active' && (change.to === 'broken' || change.to === 'warning')) {
      lastBreakTimestamp = change.timestamp;
      break; // We have the most recent break
    }
  }

  // Calculate retry statistics
  const totalRetries = sortedChecks.reduce(
    (sum, check) => sum + (check.retry_count || 0),
    0
  );

  // Calculate average confidence
  const checksWithConfidence = sortedChecks.filter(check => check.confidence_score !== undefined);
  const totalConfidence = checksWithConfidence.reduce(
    (sum, check) => sum + (check.confidence_score || 0),
    0
  );
  const averageConfidence = checksWithConfidence.length > 0
    ? Math.round(totalConfidence / checksWithConfidence.length)
    : 0;

  return {
    totalChecks,
    successfulChecks,
    failedChecks,
    averageResponseTime,
    uptimePercentage,
    statusChanges,
    lastBreakTimestamp,
    totalRetries,
    averageConfidence,
  };
}

/**
 * Get response time trend data for charting
 * Step 52: Add chart for response time trends
 */
export function getResponseTimeTrend(
  checks: LinkCheckRecord[]
): Array<{ timestamp: Date; responseTime: number }> {
  return checks
    .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
    .map((check) => ({
      timestamp: new Date(check.checked_at),
      responseTime: check.response_time_ms || 0,
    }));
}

/**
 * Get uptime trend data for charting
 */
export function getUptimeTrend(
  checks: LinkCheckRecord[],
  windowSize: number = 10
): Array<{ timestamp: Date; uptimePercentage: number }> {
  const sortedChecks = [...checks].sort(
    (a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
  );

  const trend: Array<{ timestamp: Date; uptimePercentage: number }> = [];

  for (let i = windowSize - 1; i < sortedChecks.length; i++) {
    const window = sortedChecks.slice(i - windowSize + 1, i + 1);
    const successful = window.filter(
      (check) => check.status_code !== null && check.status_code >= 200 && check.status_code < 400
    ).length;
    const uptimePercentage = (successful / window.length) * 100;

    trend.push({
      timestamp: new Date(sortedChecks[i].checked_at),
      uptimePercentage,
    });
  }

  return trend;
}

/**
 * Format status change for display
 */
export function formatStatusChange(change: StatusChange): string {
  const statusLabels = {
    active: 'Active',
    broken: 'Broken',
    warning: 'Warning',
  };

  return `${statusLabels[change.from]} → ${statusLabels[change.to]}`;
}

/**
 * Get time since last break
 */
export function getTimeSinceLastBreak(lastBreakTimestamp?: Date): string {
  if (!lastBreakTimestamp) {
    return 'Never broken';
  }

  const now = new Date();
  const diffMs = now.getTime() - lastBreakTimestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  return 'Just now';
}
