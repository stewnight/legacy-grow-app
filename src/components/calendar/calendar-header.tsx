'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type CalendarViewMode } from './calendar-view';

interface CalendarHeaderProps {
  mode: CalendarViewMode;
  onModeChange: (mode: CalendarViewMode) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarHeader({
  mode,
  onModeChange,
  currentDate,
  onDateChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between space-x-4 py-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDate = new Date(currentDate);
            if (mode === 'month') {
              newDate.setMonth(currentDate.getMonth() - 1);
            } else if (mode === 'week') {
              newDate.setDate(currentDate.getDate() - 7);
            } else {
              newDate.setDate(currentDate.getDate() - 1);
            }
            onDateChange(newDate);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDate = new Date(currentDate);
            if (mode === 'month') {
              newDate.setMonth(currentDate.getMonth() + 1);
            } else if (mode === 'week') {
              newDate.setDate(currentDate.getDate() + 7);
            } else {
              newDate.setDate(currentDate.getDate() + 1);
            }
            onDateChange(newDate);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">
          {format(currentDate, mode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Select value={mode} onValueChange={(value) => onModeChange(value as CalendarViewMode)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => onDateChange(new Date())}>
          Today
        </Button>
      </div>
    </div>
  );
}
