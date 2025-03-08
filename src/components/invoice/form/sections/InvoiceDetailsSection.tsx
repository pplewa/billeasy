'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils/ui';

import { InvoiceType } from '@/types';

// Remove unused Currency type

type CurrencyDetails = {
  currency: string;
  decimals: number;
  beforeDecimal: string;
  afterDecimal: string | null;
};

type CurrencyOption = {
  value: string;
  label: string;
};

export function InvoiceDetailsSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceType>();
  const t = useTranslations('form.invoiceDetails');

  const invoiceDate = watch('details.invoiceDate');
  const dueDate = watch('details.dueDate');
  const selectedCurrency = watch('details.currency');

  const [open, setOpen] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);

  // Load currencies from JSON file
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        // Fix path to load from the correct public location
        const response = await fetch('/assets/data/currencies.json');
        if (!response.ok) {
          // If the fetch fails, try the alternative path
          const altResponse = await fetch('/public/assets/data/currencies.json');
          if (!altResponse.ok) {
            throw new Error(`Failed to fetch currencies: ${response.status}`);
          }
          return altResponse.json();
        }
        return response.json();
      } catch (error) {
        console.error('Failed to load currencies:', error);
        // Return null to trigger the fallback
        return null;
      }
    };

    loadCurrencies().then((data) => {
      if (data) {
        // Transform the data into the format needed for the Combobox
        const formattedOptions = Object.entries(data)
          .map(([code, details]) => ({
            value: code,
            label: `${code} - ${(details as CurrencyDetails).currency}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCurrencies(formattedOptions);
      } else {
        // Fallback to default currencies if loading fails
        setCurrencies([
          { value: 'USD', label: 'USD - United States Dollar' },
          { value: 'EUR', label: 'EUR - Euro' },
          { value: 'GBP', label: 'GBP - British Pound' },
          { value: 'JPY', label: 'JPY - Japanese Yen' },
          { value: 'CAD', label: 'CAD - Canadian Dollar' },
          { value: 'AUD', label: 'AUD - Australian Dollar' },
          { value: 'INR', label: 'INR - Indian Rupee' },
        ]);
      }
    });
  }, []);

  // Remove unused handleSelectCurrency function

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label={t('invoiceNumber')}
          {...register('details.invoiceNumber')}
          error={errors.details?.invoiceNumber?.message}
          placeholder={t('invoiceNumberPlaceholder')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Invoice Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('invoiceDate')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !invoiceDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate
                    ? format(new Date(invoiceDate), 'PPP')
                    : t('selectDate', { defaultValue: 'Select date' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[280px] p-0">
                <Calendar
                  selected={invoiceDate ? new Date(invoiceDate) : undefined}
                  onSelect={(date) => setValue('details.invoiceDate', date as Date)}
                />
              </PopoverContent>
            </Popover>
            {errors.details?.invoiceDate?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.invoiceDate.message}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dueDate')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate
                    ? format(new Date(dueDate), 'PPP')
                    : t('selectDate', { defaultValue: 'Select date' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[280px] p-0">
                <Calendar
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => setValue('details.dueDate', date as Date)}
                />
              </PopoverContent>
            </Popover>
            {errors.details?.dueDate?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.dueDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Searchable Currency Combobox */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('currency')}</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                <span className="truncate text-left">
                  {selectedCurrency
                    ? currencies.find((currency) => currency.value === selectedCurrency)?.label
                    : t('selectCurrency', { defaultValue: 'Select currency...' })}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput
                  placeholder={t('searchCurrency', { defaultValue: 'Search currency...' })}
                />
                <CommandList>
                  <CommandEmpty>
                    {t('noCurrencyFound', { defaultValue: 'No currency found.' })}
                  </CommandEmpty>
                  <CommandGroup>
                    {currencies.map((currency) => (
                      <CommandItem
                        key={currency.value}
                        value={currency.value}
                        onSelect={(value) => {
                          setValue('details.currency', value === selectedCurrency ? '' : value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCurrency === currency.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {currency.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.details?.currency?.message && (
            <p className="text-sm font-medium text-destructive">
              {errors.details.currency.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
