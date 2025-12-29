"use client";

import { useEffect, useState } from "react";
import { getLinkCheckHistory, type LinkCheck } from "@/lib/supabase/link-checks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface LinkCheckHistoryProps {
  linkId: string;
  limit?: number;
}

export function LinkCheckHistory({ linkId, limit = 100 }: LinkCheckHistoryProps) {
  const [checks, setChecks] = useState<LinkCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState<LinkCheck | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const history = await getLinkCheckHistory(linkId, limit);
      setChecks(history);
      setLoading(false);
    }

    fetchHistory();
  }, [linkId, limit]);

  const getStatusColor = (statusCode: number | null) => {
    if (!statusCode) return "destructive";
    if (statusCode >= 200 && statusCode < 300) return "default";
    if (statusCode >= 300 && statusCode < 400) return "secondary";
    if (statusCode >= 400) return "destructive";
    return "outline";
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const openDetails = (check: LinkCheck) => {
    setSelectedCheck(check);
    setShowDetails(true);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading check history...</div>;
  }

  if (checks.length === 0) {
    return <div className="text-sm text-muted-foreground">No check history available</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response Time</TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((check) => (
              <TableRow key={check.id}>
                <TableCell className="font-medium">
                  {formatDistanceToNow(new Date(check.checked_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(check.status_code)}>
                    {check.status_code || "Error"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatResponseTime(check.response_time_ms)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {check.error_message ? (
                    <span className="text-destructive text-sm">{check.error_message}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDetails(check)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Details</DialogTitle>
            <DialogDescription>
              Full details for this link check
            </DialogDescription>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Checked At</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCheck.checked_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Status Code</h4>
                <Badge variant={getStatusColor(selectedCheck.status_code)}>
                  {selectedCheck.status_code || "No status"}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Response Time</h4>
                <p className="text-sm text-muted-foreground">
                  {formatResponseTime(selectedCheck.response_time_ms)}
                </p>
              </div>
              {selectedCheck.error_message && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Error Message</h4>
                  <p className="text-sm text-destructive">{selectedCheck.error_message}</p>
                </div>
              )}
              {selectedCheck.redirect_chain && selectedCheck.redirect_chain.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Redirect Chain</h4>
                  <div className="space-y-1">
                    {selectedCheck.redirect_chain.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-muted-foreground truncate">{url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
