"use client";

import { useEffect, useState } from "react";
import { getLinkCheckHistory } from "@/lib/supabase/link-checks";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { format } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LinkStatusGraphProps {
  linkId: string;
  limit?: number;
}

interface CheckData {
  id: string;
  timestamp: string;
  status: "active" | "broken" | "warning" | "pending";
  statusCode: number | null;
  responseTime: number;
  error: string | null;
}

export function LinkStatusGraph({ linkId, limit = 30 }: LinkStatusGraphProps) {
  const [checks, setChecks] = useState<CheckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getLinkCheckHistory(linkId, limit);

      if (data.length === 0) {
        setLoading(false);
        return;
      }

      // Reverse to show oldest to newest (left to right)
      const reversed = [...data].reverse();

      // Convert to CheckData format
      const checkData: CheckData[] = reversed.map((check) => ({
        id: check.id,
        timestamp: check.checked_at,
        status: determineStatus(check.status_code),
        statusCode: check.status_code,
        responseTime: check.response_time_ms,
        error: check.error_message || null,
      }));

      setChecks(checkData);
      setLoading(false);
    }

    fetchData();
  }, [linkId, limit]);

  const determineStatus = (
    statusCode: number | null
  ): "active" | "broken" | "warning" | "pending" => {
    if (!statusCode) return "broken";
    if (statusCode >= 200 && statusCode < 300) return "active";
    if (statusCode >= 300 && statusCode < 400) return "warning";
    if (statusCode >= 400) return "broken";
    return "pending";
  };

  const getPointColor = (status: string): string => {
    switch (status) {
      case "active":
        return "#10b981"; // green-500
      case "warning":
        return "#f59e0b"; // yellow-500
      case "broken":
        return "#ef4444"; // red-500
      default:
        return "#9ca3af"; // gray-400
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading status graph...
      </div>
    );
  }

  if (checks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No check history available
      </div>
    );
  }

  // Prepare chart data
  const labels = checks.map((check) =>
    format(new Date(check.timestamp), "MMM d, HH:mm")
  );

  // Convert status to numeric value for Y-axis
  // active = 3, warning = 2, broken = 1, pending = 0
  const statusValues = checks.map((check) => {
    switch (check.status) {
      case "active":
        return 3;
      case "warning":
        return 2;
      case "broken":
        return 1;
      default:
        return 0;
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Link Status",
        data: statusValues,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: checks.map((check) =>
          getPointColor(check.status)
        ),
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 16,
        displayColors: false,
        cornerRadius: 8,
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
        callbacks: {
          title: function (tooltipItems: TooltipItem<"line">[]) {
            const index = tooltipItems[0].dataIndex;
            const check = checks[index];
            return format(new Date(check.timestamp), "MMM d, yyyy HH:mm:ss");
          },
          label: function (context: TooltipItem<"line">) {
            return ""; // Remove default label
          },
          afterLabel: function (context: TooltipItem<"line">) {
            const index = context.dataIndex;
            const check = checks[index];

            const lines: string[] = [];

            // Status
            const statusLabel =
              check.status.charAt(0).toUpperCase() + check.status.slice(1);
            lines.push(`Status: ${statusLabel}`);

            // Status Code
            lines.push(
              `Status Code: ${check.statusCode !== null ? check.statusCode : "N/A"}`
            );

            // Response Time
            const responseTime =
              check.responseTime < 1000
                ? `${check.responseTime}ms`
                : `${(check.responseTime / 1000).toFixed(2)}s`;
            lines.push(`Response Time: ${responseTime}`);

            // Error Message
            if (check.error) {
              lines.push("");
              lines.push(`Error: ${check.error}`);
            }

            return lines;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 3.5,
        ticks: {
          stepSize: 1,
          color: "#6b7280",
          callback: function (value) {
            switch (value) {
              case 3:
                return "Active";
              case 2:
                return "Warning";
              case 1:
                return "Broken";
              case 0:
                return "Pending";
              default:
                return "";
            }
          },
        },
        grid: {
          color: "#f3f4f6",
          drawTicks: false,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          color: "#f3f4f6",
          drawTicks: false,
        },
        ticks: {
          color: "#6b7280",
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Status Timeline</h4>
          <p className="text-xs text-muted-foreground">
            Hover over points to see details • Last {checks.length} checks
          </p>
        </div>
      </div>

      <div className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-lg border p-4">
        <Line data={data} options={options} />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-600 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Active (200-299)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Warning (300-399)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Broken (400+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
