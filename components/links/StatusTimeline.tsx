"use client";

import { useEffect, useState } from "react";
import { getLinkCheckHistory, type LinkCheck } from "@/lib/supabase/link-checks";
import { determineStatus, type LinkStatus } from "@/lib/link-status";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface StatusTimelineProps {
  linkId: string;
}

interface StatusChange {
  status: LinkStatus;
  timestamp: string;
  duration?: string;
  isFirstBroken?: boolean;
}

export function StatusTimeline({ linkId }: StatusTimelineProps) {
  const [timeline, setTimeline] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      setLoading(true);
      const checks = await getLinkCheckHistory(linkId, 100);

      // Group by status changes only
      const statusChanges: StatusChange[] = [];
      let previousStatus: LinkStatus | null = null;
      let previousTimestamp: string | null = null;

      // Process checks in reverse order (oldest first)
      const reversedChecks = [...checks].reverse();

      reversedChecks.forEach((check, index) => {
        const currentStatus = determineStatus(check.status_code);

        if (currentStatus !== previousStatus) {
          // Status changed
          if (previousStatus && previousTimestamp) {
            // Calculate duration of previous status
            const duration = intervalToDuration({
              start: new Date(previousTimestamp),
              end: new Date(check.checked_at),
            });

            // Update previous status change with duration
            if (statusChanges.length > 0) {
              statusChanges[statusChanges.length - 1].duration = formatDuration(duration, {
                format: ['days', 'hours', 'minutes'],
              });
            }
          }

          // Check if this is the first time link broke
          const isFirstBroken = currentStatus === 'broken' && previousStatus === 'active';

          statusChanges.push({
            status: currentStatus,
            timestamp: check.checked_at,
            isFirstBroken,
          });

          previousStatus = currentStatus;
          previousTimestamp = check.checked_at;
        }
      });

      // Reverse to show most recent first
      setTimeline(statusChanges.reverse());
      setLoading(false);
    }

    fetchTimeline();
  }, [linkId]);

  const getStatusIcon = (status: LinkStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'broken':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: LinkStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'broken':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'pending':
        return 'outline';
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading status timeline...</div>;
  }

  if (timeline.length === 0) {
    return <div className="text-sm text-muted-foreground">No status changes recorded</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-4">
        {/* Timeline line */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />

        {timeline.map((change, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-6 mt-1.5">
              {getStatusIcon(change.status)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(change.status)}>
                  {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(change.timestamp).toLocaleString()}
              </div>

              {change.duration && (
                <div className="text-xs text-muted-foreground">
                  Duration: {change.duration}
                </div>
              )}

              {change.isFirstBroken && (
                <div className="text-xs text-destructive font-medium">
                  ⚠ Link first broke at this time
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
