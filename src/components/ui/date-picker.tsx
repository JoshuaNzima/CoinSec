import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";

interface DatePickerWithRangeProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export function DatePickerWithRange({
  className,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          placeholder="Start date"
          value={startDate || ''}
          onChange={(e) => onStartDateChange?.(e.target.value)}
          className="flex-1"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          placeholder="End date"
          value={endDate || ''}
          onChange={(e) => onEndDateChange?.(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}