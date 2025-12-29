"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkHealthData } from "@/lib/analytics/queries";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface LinkHealthChartProps {
  data: LinkHealthData[];
  isLoading?: boolean;
}

export const LinkHealthChart = ({ data, isLoading }: LinkHealthChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Health Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), "MMM dd"),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Health Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="active_count"
              stroke="hsl(var(--chart-1))"
              name="Active"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="broken_count"
              stroke="hsl(var(--chart-2))"
              name="Broken"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="warning_count"
              stroke="hsl(var(--chart-3))"
              name="Warning"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
