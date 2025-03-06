"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas";
import { createInvoice } from "@/services/invoice/client/invoiceClient";
import { InvoiceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useInvoiceParserStore from "@/store/invoice-parser-store";
import useAuthStore from "@/store/auth-store";
import { deepMerge } from "@/lib/utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Save, Download, ArrowRight } from "lucide-react";
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
  const initialValues = parsedInvoice 
    ? deepMerge(defaultInvoice, parsedInvoice as InvoiceType) 
    : defaultInvoice;
  
  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

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

  // Handle creating a draft without authentication
  const handleSaveDraft = () => {
    const formData = form.getValues();
    saveDraftInvoice(formData);
    toast({
      title: "Draft saved",
      description: "Your invoice has been saved as a draft locally.",
    });
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // Handle exporting without authentication
  const handleExport = () => {
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
  };

  // Handle authenticated actions
  const handleAuthenticatedAction = (type: 'save' | 'export') => {
    setActionType(type);
    
    if (!user && !authLoading) {
      if (type === 'export') {
        // Allow exporting without authentication
        handleExport();
        return;
      }
      
      // For saving to account, show dialog
      setIsAuthDialogOpen(true);
      return;
    }
    
    // User is authenticated, proceed with action
    if (type === 'save') {
      form.handleSubmit(handleSubmit)();
    } else if (type === 'export') {
      handleExport();
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
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {parsedInvoice ? "Review Generated Invoice" : "Create Invoice"}
          </h1>
          {draftSaved && (
            <p className="text-sm text-muted-foreground mt-1">
              Draft automatically saved
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            <Link href={{ pathname: "/drafts" }} className="text-primary hover:underline">
              View all drafts
            </Link>
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAuthenticatedAction('export')}
            disabled={isSubmitting}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button
            onClick={() => handleAuthenticatedAction('save')}
            disabled={isSubmitting}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {user ? "Save & Continue" : "Continue"}
          </Button>
        </div>
      </div>
      
      {parsedInvoice && (
        <div className="bg-muted p-4 rounded-md mb-6 text-sm">
          <p>
            Our AI has populated this form based on your input. Please review and edit any information before saving.
          </p>
        </div>
      )}
      
      <InvoiceContextProvider
        form={form}
        invoice={null}
        isLoading={false}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>
      
      {/* Authentication Dialog */}
      <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'save' 
                ? "You need to sign in to save this invoice to your account." 
                : "You need to sign in to export this invoice with full features."}
              <br /><br />
              Your invoice draft will be saved locally and available when you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleNavigateToSignIn}>
              Sign in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 