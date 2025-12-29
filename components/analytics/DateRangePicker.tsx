"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subDays } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangePicker = ({ dateRange, onDateRangeChange }: DateRangePickerProps) => {
  const [activePreset, setActivePreset] = useState<string>("30");

  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const handlePresetClick = (days: number) => {
    setActivePreset(days.toString());
    onDateRangeChange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  return (
    <div className="flex gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.days}
          variant={activePreset === preset.days.toString() ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.days)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
};
