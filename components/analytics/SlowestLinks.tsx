"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlowestLink } from "@/lib/analytics/queries";
import { truncateUrl, formatResponseTime, getResponseTimeColor } from "@/lib/analytics/calculations";
import { Clock } from "lucide-react";

interface SlowestLinksProps {
  data: SlowestLink[];
  isLoading?: boolean;
}

export const SlowestLinks = ({ data, isLoading }: SlowestLinksProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slowest Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slowest Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No slow links detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slowest Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((link, index) => (
            <div key={link.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={link.url}>
                      {truncateUrl(link.url, 50)}
                    </p>
                    {link.category && (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {link.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-2 flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      link.avg_response > 2000
                        ? "bg-red-500"
                        : link.avg_response > 1000
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min((link.avg_response / 3000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold ${getResponseTimeColor(link.avg_response)}`}>
                  {formatResponseTime(link.avg_response)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
