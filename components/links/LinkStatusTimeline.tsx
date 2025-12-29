"use client";

import { useEffect, useState } from "react";
import { getLinkCheckHistory } from "@/lib/supabase/link-checks";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface LinkStatusTimelineProps {
  linkId: string;
  limit?: number;
}

interface TimelineItem {
  id: string;
  timestamp: string;
  status: "active" | "broken" | "warning" | "pending";
  statusCode: number | null;
  responseTime: number;
  error: string | null;
  isStatusChange: boolean;
}

export function LinkStatusTimeline({ linkId, limit = 30 }: LinkStatusTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const checks = await getLinkCheckHistory(linkId, limit);

      if (checks.length === 0) {
        setLoading(false);
        return;
      }

      // Convert checks to timeline items
      const items: TimelineItem[] = [];
      let previousStatus: string | null = null;

      checks.forEach((check) => {
        const status = determineStatus(check.status_code);
        const isStatusChange = previousStatus !== null && previousStatus !== status;

        items.push({
          id: check.id,
          timestamp: check.checked_at,
          status,
          statusCode: check.status_code,
          responseTime: check.response_time_ms,
          error: check.error_message || null,
          isStatusChange,
        });

        previousStatus = status;
      });

      setTimeline(items);
      setLoading(false);
    }

    fetchData();
  }, [linkId, limit]);

  const determineStatus = (statusCode: number | null): "active" | "broken" | "warning" | "pending" => {
    if (!statusCode) return "broken";
    if (statusCode >= 200 && statusCode < 300) return "active";
    if (statusCode >= 300 && statusCode < 400) return "warning";
    if (statusCode >= 400) return "broken";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "broken":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "broken":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "broken":
        return "Broken";
      case "warning":
        return "Warning";
      default:
        return "Pending";
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading status timeline...</div>;
  }

  if (timeline.length === 0) {
    return <div className="text-sm text-muted-foreground">No check history available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Status Timeline</h4>
          <p className="text-xs text-muted-foreground">
            Last {timeline.length} checks
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-6">
        {/* Vertical line */}
        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {timeline.map((item, index) => (
          <div key={item.id} className="relative">
            {/* Dot on timeline */}
            <div className="absolute -left-8 flex items-center justify-center">
              <div className={`w-5 h-5 rounded-full ${getStatusColor(item.status)} border-4 border-white dark:border-gray-900`} />
            </div>

            {/* Content */}
            <div
              className={`rounded-lg border p-4 ${
                item.isStatusChange
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-gray-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="font-semibold text-sm">
                    {getStatusLabel(item.status)}
                  </span>
                  {item.isStatusChange && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                      Status Changed
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {format(new Date(item.timestamp), "MMM d, yyyy HH:mm")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Status Code:</span>
                  <span className="ml-2 font-mono">
                    {item.statusCode || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Response Time:</span>
                  <span className="ml-2 font-mono">
                    {item.responseTime < 1000
                      ? `${item.responseTime}ms`
                      : `${(item.responseTime / 1000).toFixed(2)}s`}
                  </span>
                </div>
              </div>

              {item.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  <span className="font-medium">Error:</span> {item.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-600 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Broken</span>
        </div>
      </div>
    </div>
  );
}
