'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils/ui';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => selected || new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDate = (day: Date) => {
    onSelect?.(selected && isSameDay(day, selected) ? undefined : day);
  };

  return (
    <div className={cn('p-3', className)}>
      <div className="flex items-center justify-center relative">
        <button
          onClick={handlePreviousMonth}
          className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</div>
        <button
          onClick={handleNextMonth}
          className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-muted-foreground font-medium text-xs text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7">
        {days.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isOutsideMonth = !isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={() => handleSelectDate(day)}
              className={cn(
                'h-9 w-9 p-0 font-normal',
                'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                isSelected &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
                isOutsideMonth && 'text-muted-foreground/30'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
