'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslations } from 'next-intl';

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const t = useTranslations('common');

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      onChange?.(date || null);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{t('datePicker.placeholder')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={value || undefined}
          onSelect={handleSelect}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
