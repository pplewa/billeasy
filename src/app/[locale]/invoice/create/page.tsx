"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas-optional";
import { createInvoice } from "@/services/invoice/client/invoiceClient";
import { InvoiceType } from "@/types-optional";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFormContext } from "react-hook-form";
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
import { Save, Download, ArrowRight, AlertCircle, Zap } from "lucide-react";
import { Link } from "@/i18n/routing";

// Define ParsedInvoice type at the top of the file
type ParsedInvoiceItem = {
  id?: string;
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

// Using a more flexible type that matches the actual structure from the parser store
type ParsedInvoice = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sender?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receiver?: Record<string, any>;
  details?: {
    items?: ParsedInvoiceItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} | null;

// Component to force update items when user clicks a button
function ForceUpdateButton({ 
  parsedInvoice
}: { 
  parsedInvoice?: ParsedInvoice
}) {
  const { toast } = useToast();
  const formMethods = useFormContext<InvoiceType>();
  
  const handleForceUpdate = () => {
    // Check for null form methods or missing invoice data
    if (!formMethods) {
      toast({
        title: "Form Not Ready",
        description: "Please wait for the form to initialize.",
        variant: "destructive"
      });
      return;
    }
    
    if (!parsedInvoice?.details?.items || parsedInvoice.details.items.length === 0) {
      toast({
        title: "No items found",
        description: "There are no items to add to the invoice.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[DEBUG] ForceUpdateButton: Starting update with full invoice:", parsedInvoice);
    
    try {
      // STEP 1: Update items
      const formattedItems = parsedInvoice.details.items.map((item: ParsedInvoiceItem) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || "Item", 
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: (item.quantity || 1) * (item.unitPrice || 0),
        taxRate: 0,  // Default tax rate
        discount: 0  // Default discount
      }));
      
      console.log("[DEBUG] ForceUpdateButton: Formatted items:", formattedItems);
      
      // STEP 2: Update details
      // Handle invoice details
      if (parsedInvoice.details) {
        // Update invoice number
        if (parsedInvoice.details.invoiceNumber) {
          formMethods.setValue("details.invoiceNumber", parsedInvoice.details.invoiceNumber);
        }
        
        // Update dates
        if (parsedInvoice.details.invoiceDate) {
          formMethods.setValue("details.invoiceDate", new Date(parsedInvoice.details.invoiceDate));
        }
        
        if (parsedInvoice.details.dueDate) {
          formMethods.setValue("details.dueDate", new Date(parsedInvoice.details.dueDate));
        }
        
        // Update currency
        if (parsedInvoice.details.currency) {
          formMethods.setValue("details.currency", parsedInvoice.details.currency);
        }
        
        // Update language
        if (parsedInvoice.details.language) {
          formMethods.setValue("details.language", parsedInvoice.details.language);
        }
        
        // Update totals
        if (parsedInvoice.details.subTotal) {
          formMethods.setValue("details.subTotal", parsedInvoice.details.subTotal);
        }
        
        if (parsedInvoice.details.totalAmount) {
          formMethods.setValue("details.totalAmount", parsedInvoice.details.totalAmount);
        }
      }
      
      // Finally, update items
      formMethods.setValue("details.items", formattedItems, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      
      // Verify items were added
      const updatedItems = formMethods.getValues("details.items");
      console.log("[DEBUG] ForceUpdateButton: Items after update:", updatedItems);
      
      if (updatedItems && updatedItems.length > 0) {
        toast({
          title: "Invoice Data Updated",
          description: `Updated invoice details and ${formattedItems.length} items. Please check all sections.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to add items. Please try again or add items manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[DEBUG] ForceUpdateButton: Error updating invoice data:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={handleForceUpdate} 
      size="lg" 
      className="w-full md:w-auto font-bold"
      variant="destructive"
    >
      <Zap className="w-4 h-4 mr-2" />
      Force Update Invoice
    </Button>
  );
}

// Component to automatically update items when form is mounted
function ItemsUpdater({ 
  parsedInvoice
}: { 
  parsedInvoice?: ParsedInvoice
}) {
  const { toast } = useToast();
  const formMethods = useFormContext<InvoiceType>();
  
  useEffect(() => {
    // Guard against null/undefined values
    if (!parsedInvoice?.details?.items || !formMethods || parsedInvoice.details.items.length === 0) {
      return;
    }
    
    try {
      console.log("[DEBUG] ItemsUpdater: Starting update with full parsed invoice:", parsedInvoice);
      
      // STEP 1: Update items
      const formattedItems = parsedInvoice.details.items.map((item: ParsedInvoiceItem) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || "Item", 
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: (item.quantity || 1) * (item.unitPrice || 0),
        taxRate: 0,  // Default tax rate
        discount: 0  // Default discount
      }));
      
      console.log("[DEBUG] ItemsUpdater: Formatted items:", formattedItems);
      
      // STEP 2: Update details
      // Handle invoice details
      if (parsedInvoice.details) {
        // Update invoice number
        if (parsedInvoice.details.invoiceNumber) {
          formMethods.setValue("details.invoiceNumber", parsedInvoice.details.invoiceNumber);
        }
        
        // Update dates
        if (parsedInvoice.details.invoiceDate) {
          formMethods.setValue("details.invoiceDate", new Date(parsedInvoice.details.invoiceDate));
        }
        
        if (parsedInvoice.details.dueDate) {
          formMethods.setValue("details.dueDate", new Date(parsedInvoice.details.dueDate));
        }
        
        // Update currency
        if (parsedInvoice.details.currency) {
          formMethods.setValue("details.currency", parsedInvoice.details.currency);
        }
        
        // Update language
        if (parsedInvoice.details.language) {
          formMethods.setValue("details.language", parsedInvoice.details.language);
        }
        
        // Update totals
        if (parsedInvoice.details.subTotal) {
          formMethods.setValue("details.subTotal", parsedInvoice.details.subTotal);
        }
        
        if (parsedInvoice.details.totalAmount) {
          formMethods.setValue("details.totalAmount", parsedInvoice.details.totalAmount);
        }
      }
      
      // Finally, update items
      formMethods.setValue("details.items", formattedItems);
      
      // Verify items were added
      const updatedItems = formMethods.getValues("details.items");
      console.log("[DEBUG] ItemsUpdater: Items after update:", updatedItems);
      
      // Show toast if items were successfully added
      if (updatedItems && updatedItems.length > 0) {
        toast({
          title: "Invoice Data Added",
          description: `Added invoice details and ${formattedItems.length} items. Please check all sections.`,
        });
      }
    } catch (error) {
      console.error("[DEBUG] ItemsUpdater: Error updating invoice data:", error);
    }
  }, [parsedInvoice, formMethods, toast]);
  
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

  // Get locale from params
  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  // Create form with minimal initial values
  const initialValues = useMemo(() => {
    // Start with a very minimal structure
    const baseInvoice: Partial<InvoiceType> = {
      details: {
        items: []
      }
    };

    // If we have parsed data, merge it with the base structure
    if (parsedInvoice) {
      console.log('[DEBUG] Parsed invoice data:', parsedInvoice);

      // Add sender if available
      if (parsedInvoice.sender) {
        baseInvoice.sender = parsedInvoice.sender;
      }

      // Add receiver if available
      if (parsedInvoice.receiver) {
        baseInvoice.receiver = parsedInvoice.receiver;
      }

      // Add details if available
      if (parsedInvoice.details) {
        // Start with an empty details object if it doesn't exist
        if (!baseInvoice.details) {
          baseInvoice.details = {};
        }
        
        // Add invoice number if available
        if (parsedInvoice.details.invoiceNumber) {
          baseInvoice.details.invoiceNumber = parsedInvoice.details.invoiceNumber;
        }
        
        // Add dates if available
        if (parsedInvoice.details.invoiceDate) {
          baseInvoice.details.invoiceDate = new Date(parsedInvoice.details.invoiceDate);
        }
        
        if (parsedInvoice.details.dueDate) {
          baseInvoice.details.dueDate = new Date(parsedInvoice.details.dueDate);
        }
        
        // Add currency if available
        if (parsedInvoice.details.currency) {
          baseInvoice.details.currency = parsedInvoice.details.currency;
        }
        
        // Add language if available
        if (parsedInvoice.details.language) {
          baseInvoice.details.language = parsedInvoice.details.language;
        }
        
        // Add totals if available
        if (parsedInvoice.details.subTotal) {
          baseInvoice.details.subTotal = parsedInvoice.details.subTotal;
        }
        
        if (parsedInvoice.details.totalAmount) {
          baseInvoice.details.totalAmount = parsedInvoice.details.totalAmount;
        }

        // Add items if available
        if (parsedInvoice.details.items?.length) {
          const formattedItems = parsedInvoice.details.items.map((item: ParsedInvoiceItem) => ({
            id: item.id || crypto.randomUUID(),
            name: item.name || "Item",
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: (item.quantity || 1) * (item.unitPrice || 0),
            taxRate: 0,  // Default tax rate
            discount: 0  // Default discount
          }));

          // Set items in the base invoice
          baseInvoice.details.items = formattedItems;

          console.log('[DEBUG] Formatted items:', formattedItems);
        }
      }

      console.log('[DEBUG] Final form structure:', baseInvoice);
    }

    return baseInvoice;
  }, [parsedInvoice]);

  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    criteriaMode: "all",
    shouldFocusError: false,
    shouldUseNativeValidation: false,
    delayError: 500,
  });

  // Log the form values after initialization
  useEffect(() => {
    if (parsedInvoice?.details?.items?.length) {
      // Wait for form to fully initialize
      const timer = setTimeout(() => {
        const values = form.getValues();
        console.log('[DEBUG] Form values after initialization:', values);
        console.log('[DEBUG] Form items after initialization:', values.details?.items);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [form, parsedInvoice]);

  // Remove all the complex update effects
  // Only keep the cleanup effect
  useEffect(() => {
    return () => {
      resetParserState();
    };
  }, [resetParserState]);

  // Keep the autosave functionality
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      const formData = form.getValues();
      if (formData && (formData.sender?.name || formData.receiver?.name)) {
        saveDraftInvoice(formData);
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [form, saveDraftInvoice]);

  // Handle form submission with minimal validation
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Get raw values from the form - bypass validation
      const formData = form.getValues();
      
      // Submit the raw form data
      await createInvoice(formData);
      
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
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
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

      {/* Only show the force update button */}
      {parsedInvoice?.details?.items && parsedInvoice.details.items.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Items Detected</h3>
              <p>{parsedInvoice.details.items.length} items have been loaded from your invoice.</p>
              <p className="text-sm text-muted-foreground">If you don&apos;t see the items in Step 3, click the button below.</p>
              <div className="mt-2">
                <ForceUpdateButton parsedInvoice={parsedInvoice} />
              </div>
            </div>
          </div>
        </div>
      )}

      <ItemsUpdater parsedInvoice={parsedInvoice} />

      <InvoiceContextProvider
        form={form}
        invoice={null}
        isLoading={authLoading}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>

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