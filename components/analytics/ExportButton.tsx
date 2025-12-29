"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV, ExportData } from "@/lib/analytics/export";
import { DateRange } from "./DateRangePicker";

interface ExportButtonProps {
  data: ExportData;
  dateRange: DateRange;
  disabled?: boolean;
}

export const ExportButton = ({ data, dateRange, disabled }: ExportButtonProps) => {
  const handleExport = () => {
    exportToCSV(data, dateRange);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};
