"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas-optional";
import { createInvoice } from "@/services/invoice/client/invoiceClient";
import { FormInvoiceType } from "@/types-optional";
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
import { Download, AlertCircle, Zap, Mail, Printer } from "lucide-react";
import { InvoiceExportModal } from "@/components/invoice/InvoiceExportModal";
import { InvoiceEmailModal } from "@/components/invoice/InvoiceEmailModal";
import { AddressSwapButton } from "@/components/invoice/AddressSwapButton";

// TODO: Known TypeScript Issues
// 1. Complex form data types with mixed string/array values
// 2. Zod schema compatibility with react-hook-form
// 3. Type assertions needed for array operations
// These issues are common when dealing with complex form data and validation.
// Future improvements:
// - Create more specific type guards
// - Use branded types for validated data
// - Add runtime validation for parsed data

// Define ParsedInvoice type at the top of the file
type ParsedInvoiceItem = {
  id?: string;
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
};

interface AddressInfo {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  zipCode?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  customInputs?: unknown;
  [key: string]: unknown;
}

interface InvoiceDetails {
  status?: string | null;
  items?: Array<ParsedInvoiceItem> | null | string;
  invoiceNumber?: string | null;
  invoiceDate?: string | Date | null;
  dueDate?: string | Date | null;
  currency?: string | null;
  subTotal?: number | string | null;
  totalAmount?: number | string | null;
  signature?: unknown;
  [key: string]: unknown;
}

// Using a more flexible type that matches both form and parser data
type ParsedInvoice = {
  sender?: AddressInfo | null;
  receiver?: AddressInfo | null;
  details?: InvoiceDetails | null;
  [key: string]: unknown;
} | null;

// Type guard for ParsedInvoiceItem array
function isValidItemsArray(items: unknown): items is Array<ParsedInvoiceItem> {
  return Array.isArray(items) && items.length > 0 && items.every(item => 
    typeof item === 'object' && item !== null && 'id' in item
  );
}

// Component to force update items when user clicks a button
function ForceUpdateButton({
  parsedInvoice,
}: {
  parsedInvoice: ParsedInvoice;
}) {
  const { toast } = useToast();
  const formMethods = useFormContext<FormInvoiceType>();

  const handleForceUpdate = () => {
    // Check for null form methods or missing invoice data
    if (!formMethods || !parsedInvoice?.details?.items) {
      toast({
        title: "Form Not Ready",
        description: "Please wait for the form to initialize.",
        variant: "destructive",
      });
      return;
    }

    const items = parsedInvoice.details.items;
    if (!isValidItemsArray(items)) {
      toast({
        title: "No items found",
        description: "There are no items to add to the invoice.",
        variant: "destructive",
      });
      return;
    }

    try {
      // STEP 1: Update items
      // Type system limitation with complex form data
      const formattedItems = items.map((item: ParsedInvoiceItem) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || "Item",
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: (item.quantity || 1) * (item.unitPrice || 0),
        tax: {
          amount: 0,
          amountType: 'percentage'
        },
        discount: {
          amount: 0,
          amountType: 'percentage'
        }
      }));

      console.log(
        "[DEBUG] ForceUpdateButton: Formatted items:",
        formattedItems
      );

      // STEP 2: Update details
      // Handle invoice details
      if (parsedInvoice.details) {
        // Update invoice number
        if (parsedInvoice.details.invoiceNumber) {
          formMethods.setValue(
            "details.invoiceNumber",
            parsedInvoice.details.invoiceNumber
          );
        }

        // Update dates
        if (parsedInvoice.details.invoiceDate) {
          formMethods.setValue(
            "details.invoiceDate",
            new Date(parsedInvoice.details.invoiceDate)
          );
        }

        if (parsedInvoice.details.dueDate) {
          formMethods.setValue(
            "details.dueDate",
            new Date(parsedInvoice.details.dueDate)
          );
        }

        // Update currency
        if (parsedInvoice.details.currency) {
          formMethods.setValue(
            "details.currency",
            parsedInvoice.details.currency
          );
        }

        // Update totals
        if (parsedInvoice.details.subTotal) {
          formMethods.setValue(
            "details.subTotal",
            typeof parsedInvoice.details.subTotal === 'string'
              ? parseFloat(parsedInvoice.details.subTotal)
              : parsedInvoice.details.subTotal
          );
        }

        if (parsedInvoice.details.totalAmount) {
          formMethods.setValue(
            "details.totalAmount",
            typeof parsedInvoice.details.totalAmount === 'string'
              ? parseFloat(parsedInvoice.details.totalAmount)
              : parsedInvoice.details.totalAmount
          );
        }
      }

      // Finally, update items
      formMethods.setValue("details.items", formattedItems, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Verify items were added
      const updatedItems = formMethods.getValues("details.items");
      console.log(
        "[DEBUG] ForceUpdateButton: Items after update:",
        updatedItems
      );

      if (updatedItems && updatedItems.length > 0) {
        toast({
          title: "Invoice Data Updated",
          description: `Updated invoice details and ${formattedItems.length} items. Please check all sections.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description:
            "Failed to add items. Please try again or add items manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(
        "[DEBUG] ForceUpdateButton: Error updating invoice data:",
        error
      );
      toast({
        title: "Error",
        description: "Failed to update invoice data. Please try again.",
        variant: "destructive",
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
function ItemsUpdater({ parsedInvoice }: { parsedInvoice?: ParsedInvoice }) {
  const { toast } = useToast();
  const formMethods = useFormContext<FormInvoiceType>();

  useEffect(() => {
    // Guard against null/undefined values
    if (!parsedInvoice?.details?.items || !formMethods) {
      return;
    }

    const items = parsedInvoice.details.items;
    if (!isValidItemsArray(items)) {
      return;
    }

    try {
      console.log(
        "[DEBUG] ItemsUpdater: Starting update with full parsed invoice:",
        parsedInvoice
      );

      // STEP 1: Update items
      // Type system limitation with complex form data
      const formattedItems = items.map((item: ParsedInvoiceItem) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || "Item",
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: (item.quantity || 1) * (item.unitPrice || 0),
        tax: {
          amount: 0,
          amountType: 'percentage'
        },
        discount: {
          amount: 0,
          amountType: 'percentage'
        }
      }));

      console.log("[DEBUG] ItemsUpdater: Formatted items:", formattedItems);

      // STEP 2: Update details
      // Handle invoice details
      if (parsedInvoice.details) {
        // Update invoice number
        if (parsedInvoice.details.invoiceNumber) {
          formMethods.setValue(
            "details.invoiceNumber",
            parsedInvoice.details.invoiceNumber
          );
        }

        // Update dates
        if (parsedInvoice.details.invoiceDate) {
          formMethods.setValue(
            "details.invoiceDate",
            new Date(parsedInvoice.details.invoiceDate)
          );
        }

        if (parsedInvoice.details.dueDate) {
          formMethods.setValue(
            "details.dueDate",
            new Date(parsedInvoice.details.dueDate)
          );
        }

        // Update currency
        if (parsedInvoice.details.currency) {
          formMethods.setValue(
            "details.currency",
            parsedInvoice.details.currency
          );
        }

        // Update totals
        if (parsedInvoice.details.subTotal) {
          formMethods.setValue(
            "details.subTotal",
            typeof parsedInvoice.details.subTotal === 'string'
              ? parseFloat(parsedInvoice.details.subTotal)
              : parsedInvoice.details.subTotal
          );
        }

        if (parsedInvoice.details.totalAmount) {
          formMethods.setValue(
            "details.totalAmount",
            typeof parsedInvoice.details.totalAmount === 'string'
              ? parseFloat(parsedInvoice.details.totalAmount)
              : parsedInvoice.details.totalAmount
          );
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
      console.error(
        "[DEBUG] ItemsUpdater: Error updating invoice data:",
        error
      );
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
  const { parsedInvoice, resetParserState, saveDraftInvoice } =
    useInvoiceParserStore();
  const { user, isLoading: authLoading } = useAuthStore();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"save" | "export">("save");

  // Get locale from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getParams();
  }, [params]);

  // Create form with minimal initial values
  const initialValues = useMemo(() => {
    // Start with a very minimal structure
    const baseInvoice: Partial<FormInvoiceType> = {
      details: {
        items: [],
      },
    };

    // If we have parsed data, merge it with the base structure
    if (parsedInvoice) {
      // Add sender if available
      if (parsedInvoice.sender) {
        baseInvoice.sender = parsedInvoice.sender as any;
      }

      // Add receiver if available
      if (parsedInvoice.receiver) {
        baseInvoice.receiver = parsedInvoice.receiver as any;
      }

      // Add details if available
      if (parsedInvoice.details) {
        // Start with an empty details object if it doesn't exist
        if (!baseInvoice.details) {
          baseInvoice.details = {};
        }

        // Add invoice number if available
        if (parsedInvoice.details.invoiceNumber) {
          baseInvoice.details.invoiceNumber =
            parsedInvoice.details.invoiceNumber;
        }

        // Add dates if available
        if (parsedInvoice.details.invoiceDate) {
          baseInvoice.details.invoiceDate = new Date(
            parsedInvoice.details.invoiceDate
          );
        }

        if (parsedInvoice.details.dueDate) {
          baseInvoice.details.dueDate = new Date(parsedInvoice.details.dueDate);
        }

        // Add currency if available
        if (parsedInvoice.details.currency) {
          baseInvoice.details.currency = parsedInvoice.details.currency;
        }

        // Add totals if available
        if (parsedInvoice.details.subTotal) {
          baseInvoice.details.subTotal = typeof parsedInvoice.details.subTotal === 'string'
            ? parseFloat(parsedInvoice.details.subTotal)
            : parsedInvoice.details.subTotal;
        }

        if (parsedInvoice.details.totalAmount) {
          baseInvoice.details.totalAmount = typeof parsedInvoice.details.totalAmount === 'string'
            ? parseFloat(parsedInvoice.details.totalAmount)
            : parsedInvoice.details.totalAmount;
        }

        // Add items if available
        if (parsedInvoice.details.items?.length) {
          const formattedItems = parsedInvoice.details.items.map(
            (item: ParsedInvoiceItem) => ({
              id: item.id || crypto.randomUUID(),
              name: item.name || "Item",
              description: item.description || "",
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              total: (item.quantity || 1) * (item.unitPrice || 0),
              tax: {
                amount: 0,
                amountType: 'percentage'
              },
              discount: {
                amount: 0,
                amountType: 'percentage'
              }
            })
          );

          // Set items in the base invoice
          baseInvoice.details.items = formattedItems;

          console.log("[DEBUG] Formatted items:", formattedItems);
        }
      }

      console.log("[DEBUG] Final form structure:", baseInvoice);
    }

    return baseInvoice;
  }, [parsedInvoice]);

  // Create form with minimal initial values
  const form = useForm<FormInvoiceType>({
    // Use type assertion to resolve schema compatibility issues
    resolver: zodResolver(InvoiceSchema) as any,
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  // Log the form values after initialization
  useEffect(() => {
    if (parsedInvoice?.details?.items?.length) {
      // Wait for form to fully initialize
      const timer = setTimeout(() => {
        const values = form.getValues();
        console.log("[DEBUG] Form values after initialization:", values);
        console.log(
          "[DEBUG] Form items after initialization:",
          values.details?.items
        );
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
        saveDraftInvoice(formData as any);
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [form, saveDraftInvoice]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Get raw values from the form - bypass validation
      const formData = form.getValues();

      // Submit the raw form data
      const data = await createInvoice(formData as any);

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      router.push(`/${locale}/invoice/view/${data._id}`);
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

  // Handle authentication for saving
  const handleAuthenticatedSave = () => {
    if (!user && !authLoading) {
      setActionType("save");
      setIsAuthDialogOpen(true);
    } else {
      form.handleSubmit(handleSubmit)();
    }
  };

  // Handle navigation to sign in page
  const handleNavigateToSignIn = () => {
    // Save the current state before redirecting
    const formData = form.getValues();
    saveDraftInvoice(formData as any);

    // Redirect to sign in page
    router.push(`/${locale}/signin?redirect=/invoice/create`);
  };

  // Handle print functionality
  const handlePrint = () => {
    // Add a small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <main className="container py-6 space-y-8 p-4">
      {/* Add print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          
          .container {
            width: 100%;
            max-width: 100%;
            padding: 20px;
            margin: 0;
          }
          
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between print-hidden">
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={handlePrint}
            disabled={isSubmitting}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          
          {/* Email button - only show when user is logged in */}
          {user && (
            <InvoiceEmailModal form={form}>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </InvoiceEmailModal>
          )}
          
          <InvoiceExportModal form={form}>
            <Button
              variant="outline"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </InvoiceExportModal>
          
          <Button
            className="w-full md:w-auto"
            onClick={handleAuthenticatedSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? <>Saving...</> : <>Save Invoice</>}
          </Button>
        </div>
      </div>

      {/* Only show the force update button */}
      {parsedInvoice?.details?.items &&
        parsedInvoice.details.items.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Items Detected</h3>
                <p>
                  {parsedInvoice.details.items.length} items have been loaded
                  from your invoice.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you don&apos;t see the items in Step 3, click the button
                  below.
                </p>
                <div className="mt-2">
                  <ForceUpdateButton parsedInvoice={parsedInvoice} />
                </div>
              </div>
            </div>
          </div>
        )}

      <ItemsUpdater parsedInvoice={parsedInvoice} />

      {/* Position AddressSwapButton in create form properly */}
      <div className="flex justify-center my-4">
        {parsedInvoice && <AddressSwapButton mode="parser" />}
      </div>

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
              You need to be signed in to{" "}
              {actionType === "save" ? "save" : "export"} an invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAuthDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNavigateToSignIn}>Sign In</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
