"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas";
import { createInvoice } from "@/services/invoice/client/invoiceClient";
import { InvoiceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import useInvoiceParserStore from "@/store/invoice-parser-store";
import useAuthStore from "@/store/auth-store";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Save, Download, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/routing";

// Default invoice data
const defaultInvoice: InvoiceType = {
  sender: {
    name: "",
    address: "",
    zipCode: "",
    city: "",
    country: "",
    email: "",
    phone: "",
  },
  receiver: {
    name: "",
    address: "",
    zipCode: "",
    city: "",
    country: "",
    email: "",
    phone: "",
  },
  details: {
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    currency: "USD",
    language: "en",
    status: "draft", // Default status is draft
    subTotal: 0,
    totalAmount: 0,
    totalAmountInWords: "",
    additionalNotes: "",
    paymentTerms: "",
    signature: { data: "", fontFamily: "" },
    items: [
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
  },
};

// Component to force update items when the form mounts
function ItemsUpdater({ 
  form, 
  parsedItems
}: { 
  form: ReturnType<typeof useForm<InvoiceType>>,
  parsedItems?: { id?: string, name?: string, description?: string, quantity?: number, unitPrice?: number, total?: number }[]
}) {
  useEffect(() => {
    if (parsedItems && parsedItems.length > 0) {
      console.log('FormUpdater: Force updating items', parsedItems);
      
      // Format the items properly
      const formattedItems = parsedItems.map(item => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || item.description || 'Item',
        description: item.description || '',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
        total: typeof item.total === 'number' ? item.total : 0
      }));
      
      // Add a small delay to ensure form is ready
      setTimeout(() => {
        // Get current form values
        const currentValues = form.getValues();
        
        // Update with formatted items
        if (!currentValues.details) {
          currentValues.details = { items: formattedItems };
        } else {
          currentValues.details.items = formattedItems;
        }
        
        // Reset form with updated values
        form.reset(currentValues);
        console.log('FormUpdater: Reset form with items', formattedItems);
      }, 300);
    }
  }, [form, parsedItems]);
  
  return null; // This component doesn't render anything
}

export default function CreateInvoicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locale, setLocale] = useState<string>("");
  const { parsedInvoice, resetParserState, saveDraftInvoice } = useInvoiceParserStore();
  const { user, isLoading: authLoading } = useAuthStore();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'save' | 'export' | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Get locale from params
  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  // Create form methods with merged data from parser if available
  const initialValues = useMemo(() => {
    if (parsedInvoice) {
      console.log('Raw parsed invoice:', JSON.stringify(parsedInvoice, null, 2));
      
      // Start with default invoice
      const merged = { ...defaultInvoice };
      
      // Merge sender and receiver separately
      if (parsedInvoice.sender) {
        merged.sender = { 
          ...merged.sender, 
          ...parsedInvoice.sender,
          // Ensure required fields have fallback values
          name: parsedInvoice.sender.name || "Company Name",
          address: parsedInvoice.sender.address || "Address Line",
          city: parsedInvoice.sender.city || "City",
          zipCode: parsedInvoice.sender.zipCode || "00000",
          country: parsedInvoice.sender.country || "Country"
        };
      }
      
      if (parsedInvoice.receiver) {
        merged.receiver = { 
          ...merged.receiver, 
          ...parsedInvoice.receiver,
          // Ensure required fields have fallback values
          name: parsedInvoice.receiver.name || "Client Name",
          address: parsedInvoice.receiver.address || "Address Line",
          city: parsedInvoice.receiver.city || "City",
          zipCode: parsedInvoice.receiver.zipCode || "00000",
          country: parsedInvoice.receiver.country || "Country"
        };
      }
      
      // Handle details separately
      if (parsedInvoice.details) {
        merged.details = { ...merged.details, ...parsedInvoice.details };
        
        // Special handling for items
        if (parsedInvoice.details.items?.length) {
          // Create properly structured items with required fields
          merged.details.items = parsedInvoice.details.items.map(item => ({
            id: item.id || crypto.randomUUID(),
            name: item.name || item.description || 'Item',
            description: item.description || '',
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
            total: typeof item.total === 'number' ? item.total : 0
          }));
          
          console.log('Properly structured items:', JSON.stringify(merged.details.items, null, 2));
        }
      }
      
      console.log('Final merged values:', JSON.stringify(merged, null, 2));
      return merged;
    }
    return defaultInvoice;
  }, [parsedInvoice]);
  
  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Debug the parsed invoice and merged values
  useEffect(() => {
    if (parsedInvoice) {
      console.log('Form values after init:', form.getValues());
      
      // Force update items in the form
      if (parsedInvoice.details?.items?.length) {
        console.log('Setting items directly:', parsedInvoice.details.items);
        
        const formattedItems = parsedInvoice.details.items.map(item => ({
          id: item.id || crypto.randomUUID(),
          name: item.name || item.description || '',
          description: item.description || '',
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
          total: typeof item.total === 'number' ? item.total : 0
        }));
        
        // Use setTimeout to ensure the form is fully mounted
        setTimeout(() => {
          // HARD RESET: First empty the array and then set the values
          form.setValue('details.items', [], { shouldValidate: false });
          
          // Then add each item individually
          formattedItems.forEach((item) => {
            const currentItems = form.getValues('details.items') || [];
            form.setValue('details.items', [...currentItems, item], { shouldValidate: true });
          });
          
          console.log('Form values after forcing items update:', form.getValues('details.items'));
        }, 500);
      }
    }
  }, [parsedInvoice, form]);

  // Force a rerender with another timeout
  useEffect(() => {
    if (parsedInvoice?.details?.items?.length) {
      const timer = setTimeout(() => {
        // This will force all form fields to rerender
        form.reset(form.getValues());
        console.log('Forced form reset at 1 second');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [parsedInvoice, form]);
  
  // Reset the parser state when unmounting to prevent reusing the same data
  useEffect(() => {
    return () => {
      resetParserState();
    };
  }, [resetParserState]);

  // Autosave draft every 30 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      const formData = form.getValues();
      if (formData && Object.keys(formData).length > 0) {
        // Only save if there is actual content beyond the defaults
        if (formData.sender?.name || formData.receiver?.name) {
          saveDraftInvoice(formData);
          setDraftSaved(true);
          
          // Reset the saved state after 3 seconds
          setTimeout(() => setDraftSaved(false), 3000);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autosaveInterval);
  }, [form, saveDraftInvoice]);
  
  // Handle form submission when authenticated
  const handleSubmit = async (data: InvoiceType) => {
    try {
      setIsSubmitting(true);
      await createInvoice(data);
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      router.push(`/${locale}/invoices`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle authenticated actions
  const handleAuthenticatedAction = (type: 'save' | 'export') => {
    if (!user && !authLoading) {
      setActionType(type);
      setIsAuthDialogOpen(true);
    } else {
      if (type === 'save') {
        form.handleSubmit(handleSubmit)();
      } else {
        // This would typically generate a PDF
        toast({
          title: "Export started",
          description: "Generating PDF for your invoice...",
        });
        // Mock PDF download after a brief delay
        setTimeout(() => {
          toast({
            title: "Export complete",
            description: "Your invoice PDF is ready.",
          });
          // In a real implementation, this would trigger a file download
        }, 1500);
      }
    }
  };
  
  // Handle navigation to sign in page
  const handleNavigateToSignIn = () => {
    // Save the current state before redirecting
    const formData = form.getValues();
    saveDraftInvoice(formData);
    
    // Redirect to sign in page
    router.push(`/${locale}/signin?redirect=/invoice/create`);
  };

  return (
    <main className="container py-6 space-y-8 p-4">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            <Link href="/drafts" className="text-primary hover:underline">
              View all drafts
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => handleAuthenticatedAction('save')}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
            {draftSaved && <span className="ml-2">✓</span>}
          </Button>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => handleAuthenticatedAction('export')}
            disabled={isSubmitting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Debug message if items were parsed */}
      {parsedInvoice?.details?.items && parsedInvoice.details.items.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Important</h3>
              <p>We detected {parsedInvoice.details.items.length} items in your parsed invoice.</p>
              <p className="text-sm text-muted-foreground">These items should appear in Step 3 (Items) of your form. If they don't appear, use the button below to force update.</p>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (parsedInvoice?.details?.items?.length) {
                      // Force update items by directly manipulating the form
                      const formattedItems = parsedInvoice.details.items.map(item => ({
                        id: item.id || crypto.randomUUID(),
                        name: item.name || item.description || 'Item',
                        description: item.description || '',
                        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
                        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
                        total: typeof item.total === 'number' ? item.total : 0
                      }));
                      
                      // Reset the form with the current values but with the new items
                      const currentValues = form.getValues();
                      if (currentValues.details) {
                        currentValues.details.items = formattedItems;
                      } else {
                        currentValues.details = { items: formattedItems };
                      }
                      
                      // Reset the form with the updated values
                      form.reset(currentValues);
                      
                      // Notify the user
                      toast({
                        title: "Items updated",
                        description: "The parsed invoice items have been added to the form."
                      });
                    }
                  }}
                >
                  Force Update Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set the form context for the InvoiceForm component */}
      <InvoiceContextProvider
        form={form}
        invoice={null}
        isLoading={authLoading}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>
      
      {/* Helper component to force update items on mount */}
      {parsedInvoice?.details?.items && (
        <ItemsUpdater form={form} parsedItems={parsedInvoice.details.items} />
      )}

      {/* Authentication Dialog */}
      <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be signed in to {actionType === 'save' ? 'save' : 'export'} an invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsAuthDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNavigateToSignIn}>Sign In</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
} 