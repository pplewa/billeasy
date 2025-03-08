'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Edit, MoreVertical, Trash, FileText, Plus } from 'lucide-react';
import useInvoiceParserStore from '@/store/invoice-parser-store';
import { DraftInvoice } from '@/lib/types/invoice';
import { useTranslations } from 'next-intl';

export default function DraftsPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [locale, setLocale] = useState<string>('');
  const { draftInvoices, removeDraftInvoice, setParsedInvoice } = useInvoiceParserStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  // Get translations
  const t = useTranslations();
  const invoiceT = useTranslations('invoice');

  // Get locale from params
  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  // Handle editing a draft
  const handleEditDraft = (draftId: string) => {
    const draft = draftInvoices.find((d) => d.id === draftId);
    if (draft) {
      setParsedInvoice(draft);
      router.push(`/${locale}/invoice/create`);
    }
  };

  // Handle deleting a draft
  const handleDeleteDraft = (draftId: string) => {
    setSelectedDraftId(draftId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDeleteDraft = () => {
    if (selectedDraftId) {
      removeDraftInvoice(selectedDraftId);
      toast({
        title: 'Draft deleted',
        description: 'The draft invoice has been deleted.',
      });
      setDeleteDialogOpen(false);
      setSelectedDraftId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Get draft name or fallback
  const getDraftName = (draft: DraftInvoice) => {
    const invoiceNumber = draft.details?.invoiceNumber || '';
    const senderName = draft.sender?.name || '';
    const receiverName = draft.receiver?.name || '';

    if (invoiceNumber) {
      return `Invoice #${invoiceNumber}`;
    }

    if (senderName && receiverName) {
      return `${senderName} → ${receiverName}`;
    }

    if (senderName) {
      return `From: ${senderName}`;
    }

    if (receiverName) {
      return `To: ${receiverName}`;
    }

    return `Draft from ${format(new Date(draft.createdAt), 'MMM d, yyyy')}`;
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Draft Invoices</h1>
          <p className="text-muted-foreground">Manage your locally saved invoice drafts</p>
        </div>
        <Button onClick={() => router.push(`/${locale}/invoice/create`)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Drafts</CardTitle>
          <CardDescription>
            {draftInvoices.length === 0
              ? "You don't have any draft invoices yet."
              : `You have ${draftInvoices.length} draft invoice${draftInvoices.length !== 1 ? 's' : ''}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">{invoiceT('noDraftsFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('invoice.startCreatingDraft')}
              </p>
              <Button onClick={() => router.push(`/${locale}/invoice/create`)}>
                {t('home.howItWorks.createFirstInvoice')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draft Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftInvoices.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">{getDraftName(draft)}</TableCell>
                    <TableCell>{formatDate(draft.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditDraft(draft.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDraft(draft.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the draft invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDraft}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
