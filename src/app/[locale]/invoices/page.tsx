"use client";

import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceDocument } from "@/lib/db/models/Invoice";
import {
  deleteInvoice,
  fetchInvoices,
  FetchOptions,
  PaginatedInvoices,
} from "@/services/invoice/client/invoiceClient";
import { Loader2, PlusCircle, FilePlus, FileQuestion } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { InvoiceFilters } from "@/components/invoice/InvoiceFilters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  // State for invoice data
  const [invoicesData, setInvoicesData] = useState<PaginatedInvoices | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // State for delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load invoices with pagination and filters
  const loadInvoices = useCallback(async (options: FetchOptions = {}) => {
    try {
      setLoading(true);
      
      // Merge default options with provided options
      const fetchOptions = {
        page,
        limit: itemsPerPage,
        status: filters.status,
        search: filters.search,
        ...options,
      };
      
      // If filters change, reset to page 1
      if (
        (options.status !== undefined && options.status !== filters.status) ||
        (options.search !== undefined && options.search !== filters.search)
      ) {
        fetchOptions.page = 1;
        setPage(1);
      }
      
      const data = await fetchInvoices(fetchOptions);
      setInvoicesData(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, itemsPerPage, toast]);

  // Initial load
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Handle filter changes
  const handleFilterChange = (newFilters: { status: string; search: string }) => {
    setFilters(newFilters);
    loadInvoices({ 
      status: newFilters.status, 
      search: newFilters.search,
      page: 1
    });
  };

  // Navigation handlers
  const handleCreateInvoice = () => {
    router.push(`/${locale}/invoice/create`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadInvoices({ page: newPage });
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deletion handlers
  const handleDeleteInvoice = async (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        setIsDeleting(true);
        await deleteInvoice(deleteId);
        
        // Reload invoices after deletion
        await loadInvoices();
        
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting invoice:", error);
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setDeleteId(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  // Handle duplicating an invoice
  const handleDuplicateInvoice = async () => {
    // Reload invoices after duplication
    await loadInvoices();
  };

  // Handle status change
  const handleStatusChange = async (id: string, status: string) => {
    // Reload invoices only if status filter is active
    if (filters.status) {
      await loadInvoices();
    } else {
      // Update the invoice status in the local state
      if (invoicesData) {
        setInvoicesData({
          ...invoicesData,
          invoices: invoicesData.invoices.map((invoice) => {
            if (invoice && invoice._id && invoice._id.toString() === id) {
              return {
                ...invoice,
                details: {
                  ...(invoice.details || {}),
                  status,
                },
              };
            }
            return invoice;
          }) as InvoiceDocument[],
        });
      }
    }
  };

  // Generate page numbers for pagination
  const generatePagination = (currentPage: number, totalPages: number) => {
    // Always show first and last page
    // Show 2 pages before and after current page
    // Use ellipsis for gaps
    
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all page numbers
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Complex case with ellipsis
    const pages: (number | 'ellipsis')[] = [1]; // Always include first page
    
    if (currentPage <= 3) {
      // Near the start
      pages.push(2, 3, 4, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Middle case
      pages.push(
        'ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'ellipsis',
        totalPages
      );
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={handleCreateInvoice} size="lg">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <InvoiceFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Content area */}
      {loading && !invoicesData ? (
        // Show skeletons when loading initially
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <div key={index} className="rounded-lg border shadow">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : invoicesData?.invoices.length === 0 ? (
        // No invoices found
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center py-12 bg-muted rounded-lg border">
            <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No invoices found</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {filters.status || filters.search
                ? "No invoices match your filter criteria. Try different filters or clear them."
                : "Create your first invoice to get started."}
            </p>
            {filters.status || filters.search ? (
              <Button variant="outline" onClick={() => handleFilterChange({ status: "", search: "" })}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleCreateInvoice}>
                <FilePlus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Display invoices
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoicesData?.invoices.map((invoice, index) => 
              invoice ? (
                <InvoiceCard
                  key={invoice._id ? invoice._id.toString() : `invoice-${index}`}
                  invoice={invoice as InvoiceDocument}
                  locale={locale}
                  onDelete={handleDeleteInvoice}
                  onDuplicate={handleDuplicateInvoice}
                  onStatusChange={handleStatusChange}
                />
              ) : null
            )}
          </div>
          
          {/* Pagination */}
          {invoicesData && invoicesData.totalPages > 1 && (
            <Pagination className="my-6">
              <PaginationContent>
                {/* Previous Page Button */}
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page - 1);
                      }}
                    />
                  </PaginationItem>
                )}
                
                {/* Page Numbers */}
                {generatePagination(page, invoicesData.totalPages).map((pageNumber, i) => (
                  <PaginationItem key={i}>
                    {pageNumber === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNumber as number);
                        }}
                        isActive={pageNumber === page}
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                {/* Next Page Button */}
                {page < invoicesData.totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}

          {/* Summary Information */}
          <div className="text-sm text-muted-foreground text-center">
            Showing {invoicesData?.invoices.length} of {invoicesData?.totalCount} invoices
            {(filters.status || filters.search) && (
              <span> (filtered)</span>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
