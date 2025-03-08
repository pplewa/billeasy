'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceStatus } from '@/types';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InvoiceFiltersProps {
  onFilterChange: (filters: { status: string; search: string }) => void;
  initialFilters?: { status: string; search: string };
}

/**
 * Component for filtering invoices by status and text search
 */
export function InvoiceFilters({
  onFilterChange,
  initialFilters = { status: '', search: '' },
}: InvoiceFiltersProps) {
  const [status, setStatus] = useState<string>(initialFilters.status);
  const [search, setSearch] = useState<string>(initialFilters.search);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialFilters.search);
  const t = useTranslations('invoice.filters');

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({ status: value === 'all' ? '' : value, search });
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setStatus('');
    setSearch('');
    onFilterChange({ status: '', search: '' });
  };

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timerId);
  }, [search]);

  // Apply debounced search filter
  useEffect(() => {
    // Skip initial render to avoid infinite loop
    const isInitialRender =
      status === initialFilters.status && debouncedSearch === initialFilters.search;
    if (!isInitialRender) {
      onFilterChange({ status, search: debouncedSearch });
    }
  }, [debouncedSearch, status, onFilterChange, initialFilters.status, initialFilters.search]);

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">{t('status.label')}</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder={t('status.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('status.options.all')}</SelectItem>
              <SelectItem value={InvoiceStatus.DRAFT}>{t('status.options.draft')}</SelectItem>
              <SelectItem value={InvoiceStatus.PENDING}>{t('status.options.pending')}</SelectItem>
              <SelectItem value={InvoiceStatus.PAID}>{t('status.options.paid')}</SelectItem>
              <SelectItem value={InvoiceStatus.OVERDUE}>{t('status.options.overdue')}</SelectItem>
              <SelectItem value={InvoiceStatus.CANCELLED}>
                {t('status.options.cancelled')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="search">{t('search.label')}</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('search.placeholder')}
              value={search}
              onChange={handleSearchChange}
              className="pl-8 pr-8"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1.5 h-7 w-7 p-0"
                onClick={() => {
                  setSearch('');
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('search.clear')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {(status || search) && (
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            {t('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
