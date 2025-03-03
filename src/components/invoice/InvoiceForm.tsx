"use client";

import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Wizard } from "react-use-wizard";

import { WizardStep } from "@/components/invoice/form/wizard/WizardStep";
import { BillFromSection } from "@/components/invoice/form/sections/BillFromSection";
import { BillToSection } from "@/components/invoice/form/sections/BillToSection";
import { InvoiceDetailsSection } from "@/components/invoice/form/sections/InvoiceDetailsSection";
import { Items } from "@/components/invoice/form/sections/Items";
import { PaymentInformationSection } from "@/components/invoice/form/sections/PaymentInformationSection";
import { TaxDetailsSection } from "@/components/invoice/form/sections/TaxDetailsSection";
import { DiscountDetailsSection } from "@/components/invoice/form/sections/DiscountDetailsSection";
import { ShippingDetailsSection } from "@/components/invoice/form/sections/ShippingDetailsSection";
import { SignatureSection } from "@/components/invoice/form/sections/SignatureSection";
import { AdditionalNotesSection } from "@/components/invoice/form/sections/AdditionalNotesSection";

import { useInvoiceContext } from "@/contexts/InvoiceContext";

function Step1() {
  return (
    <WizardStep>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BillFromSection />
        <BillToSection />
      </div>
    </WizardStep>
  );
}

function Step2() {
  return (
    <WizardStep>
      <InvoiceDetailsSection />
    </WizardStep>
  );
}

function Step3() {
  return (
    <WizardStep>
      <Items />
    </WizardStep>
  );
}

function Step4() {
  return (
    <WizardStep>
      <div className="space-y-8">
        <PaymentInformationSection />
        <TaxDetailsSection />
        <DiscountDetailsSection />
        <ShippingDetailsSection />
      </div>
    </WizardStep>
  );
}

function Step5() {
  return (
    <WizardStep>
      <div className="space-y-8">
        <SignatureSection />
        <AdditionalNotesSection />
      </div>
    </WizardStep>
  );
}

export function InvoiceForm() {
  const { form, isLoading, isSubmitting, onSubmit } = useInvoiceContext();

  // Handle form submission
  const handleSubmit = form.handleSubmit(onSubmit);

  // Reset form when loading state changes
  useEffect(() => {
    if (!isLoading) {
      form.reset(form.getValues());
    }
  }, [isLoading, form]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Wizard>
          <Step1 />
          <Step2 />
          <Step3 />
          <Step4 />
          <Step5 />
        </Wizard>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Invoice"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 