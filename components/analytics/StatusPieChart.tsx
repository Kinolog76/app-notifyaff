"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDistribution } from "@/lib/analytics/queries";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getStatusColor } from "@/lib/analytics/calculations";

interface StatusPieChartProps {
  data: StatusDistribution[];
  isLoading?: boolean;
}

export const StatusPieChart = ({ data, isLoading }: StatusPieChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const COLORS = data.map((entry) => getStatusColor(entry.status));

  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  const chartData = data.map((entry) => ({
    ...entry,
    percentage: total > 0 ? ((entry.count / total) * 100).toFixed(1) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value} links (${props.payload.percentage}%)`,
                props.payload.status,
              ]}
            />
            <Legend
              formatter={(value: string, entry: any) => {
                const item = chartData.find((d) => d.status === entry.payload.status);
                return `${item?.status || value} (${item?.count || 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
