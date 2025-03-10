'use client';

import { InvoiceCard } from '@/components/invoice/InvoiceCard';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InvoiceDocument } from '@/lib/db/models/Invoice';
import {
  deleteInvoice,
  fetchInvoices,
  duplicateInvoice,
} from '@/services/invoice/client/invoiceClient';
import {
  Loader2,
  PlusCircle,
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Copy,
  Trash,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { InvoiceStatusSelector } from '@/components/invoice/InvoiceStatusSelector';
import { InvoiceStatus as InvoiceStatusEnum } from '@/types';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
// Define available view modes
type ViewMode = 'card' | 'list';

// Define available invoice status filters (including the 'all' option)
type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'all';

// Define available sort options
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'status';

export default function InvoicesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  // Get translations
  const t = useTranslations();
  const invoiceT = useTranslations('invoice');

  // States for data management
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // States for UI preferences
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // States for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data.invoices as unknown as InvoiceDocument[]);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    // First, filter the invoices
    const filtered = invoices.filter((invoice) => {
      // Filter by status - ensure we're comparing the correct values
      if (statusFilter !== 'all') {
        // Special handling for draft: an invoice with missing status is considered draft
        if (statusFilter.toLowerCase() === 'draft') {
          // If the filter is draft, include invoices with null/undefined status or 'draft'
          const invoiceStatus = invoice.details?.status?.toLowerCase() || 'draft';
          return invoiceStatus === 'draft';
        } else {
          // For other statuses, use case-insensitive comparison
          const invoiceStatus = invoice.details?.status?.toLowerCase() || '';
          const filterStatus = statusFilter.toLowerCase();
          return invoiceStatus === filterStatus;
        }
      }

      // Filter by search query (case insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        // Search across multiple fields
        return (
          // Sender info
          String(invoice.sender?.name || '')
            .toLowerCase()
            .includes(query) ||
          String(invoice.sender?.email || '')
            .toLowerCase()
            .includes(query) ||
          // Receiver info
          String(invoice.receiver?.name || '')
            .toLowerCase()
            .includes(query) ||
          String(invoice.receiver?.email || '')
            .toLowerCase()
            .includes(query) ||
          // Invoice details
          String(invoice.details?.invoiceNumber || '')
            .toLowerCase()
            .includes(query) ||
          // Convert amounts to string for searching
          String(invoice.details?.totalAmount || '').includes(query) ||
          // Search in additionalNotes only (notes may not exist in the type)
          String(invoice.details?.additionalNotes || '')
            .toLowerCase()
            .includes(query)
        );
      }

      return true;
    });

    // Then sort the filtered invoices
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return (
            new Date(b.details?.invoiceDate || 0).getTime() -
            new Date(a.details?.invoiceDate || 0).getTime()
          );
        case 'date_asc':
          return (
            new Date(a.details?.invoiceDate || 0).getTime() -
            new Date(b.details?.invoiceDate || 0).getTime()
          );
        case 'amount_desc':
          return (b.details?.totalAmount || 0) - (a.details?.totalAmount || 0);
        case 'amount_asc':
          return (a.details?.totalAmount || 0) - (b.details?.totalAmount || 0);
        case 'status':
          // A simple status priority order
          const statusOrder = {
            overdue: 0,
            pending: 1,
            draft: 2,
            paid: 3,
            cancelled: 4,
          };
          const statusA = (a.details?.status as keyof typeof statusOrder) || 'draft';
          const statusB = (b.details?.status as keyof typeof statusOrder) || 'draft';
          return statusOrder[statusA] - statusOrder[statusB];
        default:
          return 0;
      }
    });
  }, [invoices, searchQuery, statusFilter, sortBy]);

  // Paginate the filtered and sorted invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedInvoices, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);

  const handleCreateInvoice = () => {
    router.push(`/${locale}/invoice/create`);
  };

  const handleDeleteInvoice = (id: string) => {
    // Remove the invoice from the list
    setInvoices((prev) => prev.filter((invoice) => invoice._id.toString() !== id));
  };

  const handleDuplicateInvoice = (invoice: InvoiceDocument) => {
    // Add the duplicated invoice to the list
    setInvoices((prev) => [invoice, ...prev]);
  };

  const handleStatusChange = (id: string, status: string) => {
    // Update the invoice status in the local state
    setInvoices(
      (prev) =>
        prev.map((invoice) => {
          if (invoice._id.toString() === id) {
            const updatedInvoice = { ...invoice };
            if (!updatedInvoice.details) {
              updatedInvoice.details = {};
            }
            updatedInvoice.details.status = status;
            return updatedInvoice as InvoiceDocument;
          }
          return invoice;
        }) as InvoiceDocument[]
    );
  };

  // Handle duplicate invoice action
  const handleDuplicate = async (id: string) => {
    try {
      setIsDuplicating(true);
      const duplicatedInvoice = await duplicateInvoice(id);
      handleDuplicateInvoice(duplicatedInvoice);
      toast({
        title: 'Success',
        description: 'Invoice duplicated successfully',
      });
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate invoice',
        variant: 'destructive',
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  // Render list view for invoices
  const renderListView = () => {
    return (
      <Card className="col-span-full shadow-sm">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead>{t('invoice.table.number')}</TableHead>
                <TableHead>{t('invoice.table.date')}</TableHead>
                <TableHead>{t('invoice.dueDate')}</TableHead>
                <TableHead>{t('invoice.table.client')}</TableHead>
                <TableHead>{t('invoice.table.amount')}</TableHead>
                <TableHead className="text-center">{t('invoice.table.status')}</TableHead>
                <TableHead className="text-right">{t('invoice.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => {
                const invoiceId = invoice._id.toString();
                const status = invoice.details?.status || InvoiceStatusEnum.DRAFT;

                return (
                  <TableRow
                    key={invoiceId}
                    className="group border-b hover:bg-secondary/10 transition-colors"
                  >
                    <TableCell
                      className="font-medium cursor-pointer"
                      onClick={() => router.push(`/${locale}/invoice/view/${invoiceId}`)}
                    >
                      {invoice.details?.invoiceNumber || 'N/A'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => router.push(`/${locale}/invoice/view/${invoiceId}`)}
                    >
                      {invoice.details?.invoiceDate
                        ? formatDate(invoice.details.invoiceDate)
                        : 'N/A'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => router.push(`/${locale}/invoice/view/${invoiceId}`)}
                    >
                      {invoice.details?.dueDate ? formatDate(invoice.details.dueDate) : 'N/A'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => router.push(`/${locale}/invoice/view/${invoiceId}`)}
                    >
                      {invoice.receiver?.name || 'No Client'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => router.push(`/${locale}/invoice/view/${invoiceId}`)}
                    >
                      {invoice.details?.totalAmount
                        ? formatCurrency(
                            invoice.details.totalAmount,
                            invoice.details.currency || 'USD'
                          )
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <InvoiceStatusSelector
                        invoiceId={invoiceId}
                        currentStatus={status}
                        onStatusChange={handleStatusChange}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/${locale}/invoice/edit/${invoiceId}`);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">{t('invoice.actions.edit')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(invoiceId);
                          }}
                          disabled={isDuplicating}
                        >
                          {isDuplicating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">
                            {isDuplicating
                              ? t('invoice.actions.duplicating')
                              : t('invoice.actions.duplicate')}
                          </span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(invoiceId);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">{t('invoice.actions.delete')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {loading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      'No invoices found. Adjust filters or create a new invoice.'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // Render card view for invoices (original view)
  const renderCardView = () => {
    return (
      <>
        {paginatedInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice._id.toString()}
            invoice={invoice}
            locale={locale}
            onDelete={handleDeleteInvoice}
            onDuplicate={handleDuplicateInvoice}
            onStatusChange={handleStatusChange}
          />
        ))}
      </>
    );
  };

  return (
    <div className="container mx-auto py-8 p-4 space-y-6">
      {/* Page Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{t('invoice.pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('invoice.totalInvoices', { count: filteredAndSortedInvoices.length })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateInvoice} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('invoice.createInvoice')}
          </Button>
        </div>
      </div>

      {/* Search, Filter, and View Controls */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('invoice.searchPlaceholder')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1.5 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as InvoiceStatus)}
              >
                <SelectTrigger className="h-10">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('invoice.status.all')}</SelectItem>
                  <SelectItem value="draft">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-secondary-foreground/70 mr-2"></div>
                      {t('invoice.status.draft')}
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                      {t('invoice.status.pending')}
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      {t('invoice.status.paid')}
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      {t('invoice.status.overdue')}
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                      {t('invoice.status.cancelled')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">{t('invoice.sort.newestFirst')}</SelectItem>
                  <SelectItem value="date_asc">{t('invoice.sort.oldestFirst')}</SelectItem>
                  <SelectItem value="amount_desc">{t('invoice.sort.highestAmount')}</SelectItem>
                  <SelectItem value="amount_asc">{t('invoice.sort.lowestAmount')}</SelectItem>
                  <SelectItem value="status">{t('invoice.sort.byStatus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle and Items Per Page */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('card')}
                className="flex-1 h-10"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="flex-1 h-10"
              >
                <List className="h-4 w-4" />
              </Button>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(parseInt(value))}
              >
                <SelectTrigger className="h-10 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">{t('invoice.itemsPerPage', { count: 6 })}</SelectItem>
                  <SelectItem value="12">{t('invoice.itemsPerPage', { count: 12 })}</SelectItem>
                  <SelectItem value="24">{t('invoice.itemsPerPage', { count: 24 })}</SelectItem>
                  <SelectItem value="48">{t('invoice.itemsPerPage', { count: 48 })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedInvoices.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{invoiceT('noInvoicesFound')}</h2>
            {searchQuery || statusFilter !== 'all' ? (
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {t('invoice.noMatchingInvoices')}
              </p>
            ) : (
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {t('invoice.noInvoicesYet')}
              </p>
            )}

            {searchQuery || statusFilter !== 'all' ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  {t('invoice.clearFilters')}
                </Button>
                <Button onClick={handleCreateInvoice}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('invoice.createInvoice')}
                </Button>
              </div>
            ) : (
              <Button onClick={handleCreateInvoice}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('invoice.createInvoice')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={`grid ${viewMode === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}
          >
            {viewMode === 'card' ? renderCardView() : renderListView()}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t pt-4">
              <div className="text-sm text-muted-foreground">
                {t('invoice.pagination.showing', {
                  start: (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length),
                  total: filteredAndSortedInvoices.length,
                })}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // For more than 5 pages, create a simplified pagination that always shows first and last
                  let pageNum: number;

                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If at the start, show 1,2,3,4,...,last
                    if (i < 4) {
                      pageNum = i + 1;
                    } else {
                      pageNum = totalPages;
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // If at the end, show 1,...,last-3,last-2,last-1,last
                    if (i === 0) {
                      pageNum = 1;
                    } else {
                      pageNum = totalPages - (4 - i);
                    }
                  } else {
                    // If in the middle, show 1,...,current-1,current,current+1,...,last
                    if (i === 0) {
                      pageNum = 1;
                    } else if (i === 4) {
                      pageNum = totalPages;
                    } else {
                      pageNum = currentPage + (i - 2);
                    }
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9 h-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoice.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('invoice.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('invoice.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  try {
                    setIsDeleting(true);
                    await deleteInvoice(deleteId);
                    setInvoices((prev) =>
                      prev.filter((invoice) => invoice._id.toString() !== deleteId)
                    );
                    toast({
                      title: t('invoice.deleteDialog.successTitle'),
                      description: t('invoice.deleteDialog.successDescription'),
                    });
                  } catch (error) {
                    console.error('Error deleting invoice:', error);
                    toast({
                      title: t('invoice.deleteDialog.errorTitle'),
                      description: t('invoice.deleteDialog.errorDescription'),
                      variant: 'destructive',
                    });
                  } finally {
                    setIsDeleting(false);
                    setDeleteId(null);
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('invoice.deleteDialog.deleting')}
                </>
              ) : (
                t('invoice.deleteDialog.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
