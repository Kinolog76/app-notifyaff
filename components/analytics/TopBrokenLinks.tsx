"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrokenLink } from "@/lib/analytics/queries";
import { truncateUrl } from "@/lib/analytics/calculations";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface TopBrokenLinksProps {
  data: BrokenLink[];
  isLoading?: boolean;
}

export const TopBrokenLinks = ({ data, isLoading }: TopBrokenLinksProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Broken Links</CardTitle>
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
          <CardTitle>Top Broken Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No broken links found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Broken Links</CardTitle>
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
                    <div className="flex items-center gap-2 mt-1">
                      {link.category && (
                        <span className="text-xs text-muted-foreground">
                          {link.category}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Last broken: {format(new Date(link.last_broken), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="destructive" className="ml-2">
                {link.broken_count} fails
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
