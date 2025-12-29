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
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
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
  Filler,
  annotationPlugin
);

interface ResponseTimeChartProps {
  linkId: string;
  limit?: number;
}

export function ResponseTimeChart({ linkId, limit = 30 }: ResponseTimeChartProps) {
  const [loading, setLoading] = useState(true);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const checks = await getLinkCheckHistory(linkId, limit);

      if (checks.length === 0) {
        setLoading(false);
        return;
      }

      // Reverse to show oldest to newest
      const reversedChecks = [...checks].reverse();

      // Extract data for chart
      const labels = reversedChecks.map((check) =>
        format(new Date(check.checked_at), "MMM d, HH:mm")
      );
      const responseTimes = reversedChecks.map((check) => check.response_time_ms);

      // Calculate average
      const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      setAvgResponseTime(Math.round(avg));

      // Prepare Chart.js data
      const data = {
        labels,
        datasets: [
          {
            label: "Response Time (ms)",
            data: responseTimes,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: responseTimes.map((time) =>
              time > 2000 ? "#ef4444" : "#3b82f6"
            ),
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      };

      setChartData(data);
      setLoading(false);
    }

    fetchData();
  }, [linkId, limit]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            if (!value) return "";
            return value < 1000 ? `${value}ms` : `${(value / 1000).toFixed(2)}s`;
          },
        },
      },
      annotation: {
        annotations: {
          avgLine: {
            type: "line",
            yMin: avgResponseTime,
            yMax: avgResponseTime,
            borderColor: "#9ca3af",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Avg: ${avgResponseTime}ms`,
              position: "end",
              backgroundColor: "#9ca3af",
              color: "#ffffff",
              padding: 4,
            },
          },
          slowLine: {
            type: "line",
            yMin: 2000,
            yMax: 2000,
            borderColor: "#ef4444",
            borderWidth: 2,
            borderDash: [3, 3],
            label: {
              display: true,
              content: "Slow (2s)",
              position: "end",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              padding: 4,
            },
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          callback: function (value) {
            return value + "ms";
          },
        },
        title: {
          display: true,
          text: "Response Time (ms)",
          color: "#6b7280",
        },
      },
      x: {
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading response time data...</div>;
  }

  if (!chartData) {
    return <div className="text-sm text-muted-foreground">No response time data available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Response Time Trend</h4>
          <p className="text-xs text-muted-foreground">
            Last {chartData.labels.length} checks
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">Average</div>
          <div className="text-lg font-bold">
            {avgResponseTime < 1000
              ? `${avgResponseTime}ms`
              : `${(avgResponseTime / 1000).toFixed(2)}s`}
          </div>
        </div>
      </div>

      <div className="w-full h-[300px] bg-white dark:bg-gray-900 rounded-lg border p-4">
        <Line data={chartData} options={options} />
      </div>

      <div className="flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <span>Normal Response</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span>Slow Response (&gt;2s)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-400" style={{ opacity: 0.5 }} />
          <span>2s threshold</span>
        </div>
      </div>
    </div>
  );
}
