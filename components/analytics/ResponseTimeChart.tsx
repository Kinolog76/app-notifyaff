"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponseTimeData } from "@/lib/analytics/queries";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface ResponseTimeChartProps {
  data: ResponseTimeData[];
  isLoading?: boolean;
}

export const ResponseTimeChart = ({ data, isLoading }: ResponseTimeChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trends</CardTitle>
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
        <CardTitle>Response Time Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: "ms", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="max_response"
              stroke="hsl(var(--chart-4))"
              fill="hsl(var(--chart-4))"
              fillOpacity={0.2}
              name="Max"
            />
            <Area
              type="monotone"
              dataKey="avg_response"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              name="Average"
            />
            <Area
              type="monotone"
              dataKey="min_response"
              stroke="hsl(var(--chart-5))"
              fill="hsl(var(--chart-5))"
              fillOpacity={0.2}
              name="Min"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
