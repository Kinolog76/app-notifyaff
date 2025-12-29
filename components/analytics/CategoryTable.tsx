"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryPerformance } from "@/lib/analytics/queries";
import { formatResponseTime } from "@/lib/analytics/calculations";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface CategoryTableProps {
  data: CategoryPerformance[];
  isLoading?: boolean;
}

export const CategoryTable = ({ data, isLoading }: CategoryTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CategoryPerformance;
    direction: "asc" | "desc";
  }>({ key: "total_links", direction: "desc" });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;

    return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
  });

  const handleSort = (key: keyof CategoryPerformance) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "desc" ? "asc" : "desc",
    });
  };

  const getHealthColor = (active: number, total: number) => {
    const percentage = total > 0 ? (active / total) * 100 : 0;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("total_links")}
              >
                <div className="flex items-center justify-end gap-1">
                  Total
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("active_links")}
              >
                <div className="flex items-center justify-end gap-1">
                  Active
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("broken_links")}
              >
                <div className="flex items-center justify-end gap-1">
                  Broken
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("avg_response")}
              >
                <div className="flex items-center justify-end gap-1">
                  Avg Response
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow key={row.category}>
                  <TableCell>
                    <div
                      className={`w-2 h-2 rounded-full ${getHealthColor(
                        row.active_links,
                        row.total_links
                      )}`}
                      title={`${
                        row.total_links > 0
                          ? ((row.active_links / row.total_links) * 100).toFixed(1)
                          : 0
                      }% uptime`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell className="text-right">{row.total_links}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {row.active_links}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {row.broken_links}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatResponseTime(row.avg_response)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
