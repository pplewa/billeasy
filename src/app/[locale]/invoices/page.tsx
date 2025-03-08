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
import { Badge } from '@/components/ui/badge';
import { InvoiceDocument } from '@/lib/db/models/Invoice';
import { deleteInvoice, fetchInvoices } from '@/services/invoice/client/invoiceClient';
import {
  Loader2,
  PlusCircle,
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

// Define available view modes
type ViewMode = 'card' | 'list';

// Define invoice status types
type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'all';

// Define available sort options
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'status';

// Utility functions for formatting
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function InvoicesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  // States for data management
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      // Filter by status
      if (statusFilter !== 'all' && invoice.details?.status !== statusFilter) {
        return false;
      }

      // Filter by search query (case insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        // Search across multiple fields
        return (
          // Sender info
          String(invoice.sender?.name || '').toLowerCase().includes(query) ||
          String(invoice.sender?.email || '').toLowerCase().includes(query) ||
          // Receiver info
          String(invoice.receiver?.name || '').toLowerCase().includes(query) ||
          String(invoice.receiver?.email || '').toLowerCase().includes(query) ||
          // Invoice details
          String(invoice.details?.invoiceNumber || '').toLowerCase().includes(query) ||
          // Convert amounts to string for searching
          String(invoice.details?.totalAmount || '').includes(query) ||
          // Search in additionalNotes only (notes may not exist in the type)
          String(invoice.details?.additionalNotes || '').toLowerCase().includes(query)
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

  const getStatusColor = (status?: string | null): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Render list view for invoices
  const renderListView = () => {
    return (
      <Card className="col-span-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow
                  key={invoice._id.toString()}
                  className="group cursor-pointer hover:bg-secondary/30"
                  onClick={() => router.push(`/${locale}/invoice/view/${invoice._id}`)}
                >
                  <TableCell className="font-medium">
                    {invoice.details?.invoiceNumber || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {invoice.details?.invoiceDate 
                      ? formatDate(new Date(
                          invoice.details.invoiceDate !== null && invoice.details.invoiceDate !== undefined
                            ? String(invoice.details.invoiceDate) 
                            : Date.now()))
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{invoice.receiver?.name || 'No Client'}</TableCell>
                  <TableCell>
                    {invoice.details?.totalAmount
                      ? formatCurrency(
                          invoice.details.totalAmount,
                          invoice.details.currency || 'USD'
                        )
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={getStatusColor(invoice.details?.status)}>
                      {invoice.details?.status || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="opacity-0 group-hover:opacity-100 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${locale}/invoice/${invoice._id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(invoice._id.toString());
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Invoices</h1>
          <p className="text-muted-foreground">
            {filteredAndSortedInvoices.length} total invoice
            {filteredAndSortedInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateInvoice}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Search, Filter, and View Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as InvoiceStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="amount_desc">Highest Amount</SelectItem>
                  <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle and Items Per Page */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('card')}
                className="flex-1"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                <List className="h-4 w-4" />
              </Button>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 / page</SelectItem>
                  <SelectItem value="24">24 / page</SelectItem>
                  <SelectItem value="48">48 / page</SelectItem>
                  <SelectItem value="96">96 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredAndSortedInvoices.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No invoices found</h2>
            {searchQuery || statusFilter !== 'all' ? (
              <p className="text-muted-foreground text-center max-w-md mb-4">
                No invoices match your current filters. Try adjusting your search or filter
                criteria.
              </p>
            ) : (
              <p className="text-muted-foreground text-center max-w-md mb-4">
                You haven&apos;t created any invoices yet. Create your first invoice to get started.
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
                  Clear Filters
                </Button>
                <Button onClick={handleCreateInvoice}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            ) : (
              <Button onClick={handleCreateInvoice}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Invoice
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)} of{' '}
                {filteredAndSortedInvoices.length}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
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
                  size="icon"
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                      title: 'Success',
                      description: 'Invoice deleted successfully',
                    });
                  } catch (error) {
                    console.error('Error deleting invoice:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to delete invoice',
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
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
