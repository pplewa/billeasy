"use client";

// RHF
import { useFormContext } from "react-hook-form";
import { ReceiptText, FileText, Receipt, Settings, UserSquare2 } from "lucide-react";

// React Wizard
import { useWizard } from "react-use-wizard";

// Utils
import { cn } from "@/lib/utils";

// Types
import { InvoiceType } from "@/types";

interface WizardProgressProps {
  wizard: {
    activeStep: number;
    stepCount: number;
  };
}

const steps = [
  {
    id: "sender-receiver",
    title: "Sender & Receiver",
    description: "Add sender and receiver details",
    icon: UserSquare2,
    fields: ["sender", "receiver"],
  },
  {
    id: "invoice-details",
    title: "Invoice Details",
    description: "Add invoice details",
    icon: ReceiptText,
    fields: ["details.invoiceNumber", "details.invoiceDate", "details.dueDate", "details.currency", "details.language"],
  },
  {
    id: "items",
    title: "Items",
    description: "Add invoice items",
    icon: Receipt,
    fields: ["details.items"],
  },
  {
    id: "additional-details",
    title: "Additional Details",
    description: "Add payment, tax, discount, and shipping details",
    icon: Settings,
    fields: ["details.paymentInformation", "details.taxDetails", "details.discountDetails", "details.shippingDetails"],
  },
  {
    id: "signature",
    title: "Signature & Notes",
    description: "Add signature and additional notes",
    icon: FileText,
    fields: ["details.signature", "details.additionalNotes"],
  },
];

export function WizardProgress({ wizard }: WizardProgressProps) {
  const { formState: { errors } } = useFormContext<InvoiceType>();
  const { goToStep } = useWizard();

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === wizard.activeStep;
          const isCompleted = index < wizard.activeStep;

          // Check if any fields in this step have errors
          const hasErrors = step.fields.some((field) => {
            const fieldParts = field.split(".");
            let currentErrors: Record<string, unknown> = errors;
            for (const part of fieldParts) {
              if (!currentErrors || !currentErrors[part]) {
                return false;
              }
              currentErrors = currentErrors[part] as Record<string, unknown>;
            }
            return true;
          });

          return (
            <li key={step.id} className="md:flex-1">
              <button
                type="button"
                onClick={() => goToStep(index)}
                className={cn(
                  "group text-left flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 transition-colors hover:border-primary/70",
                  isActive
                    ? "border-primary"
                    : isCompleted
                    ? "border-primary"
                    : "border-border",
                )}
              >
                <span className="text-sm font-medium">
                  <Icon
                    className={cn(
                      "mr-2 inline-block h-5 w-5",
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  {step.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {step.description}
                </span>
                {hasErrors && (
                  <span className="text-sm text-destructive">
                    Please fix the errors in this step
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 