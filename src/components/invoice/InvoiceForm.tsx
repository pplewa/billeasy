"use client";

import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Wizard } from "react-use-wizard";

import { WizardStep } from "@/components/invoice/form/wizard/WizardStep";
import { BillFromSection } from "@/components/invoice/form/sections/BillFromSection";
import { BillToSection } from "@/components/invoice/form/sections/BillToSection";
import { InvoiceDetailsSection } from "@/components/invoice/form/sections/InvoiceDetailsSection";
import { Items } from "@/components/invoice/form/sections/Items";
import { PaymentInformationSection } from "@/components/invoice/form/sections/PaymentInformationSection";
import { SignatureSection } from "@/components/invoice/form/sections/SignatureSection";
import { AdditionalNotesSection } from "@/components/invoice/form/sections/AdditionalNotesSection";
import { AddressSwapButton } from "@/components/invoice/form/AddressSwapButton";

import { useInvoiceContext } from "@/contexts/InvoiceContext";

function Step1() {
  return (
    <WizardStep>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative">
        <BillFromSection />
        
        {/* Centered swap button between the sections */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <AddressSwapButton />
        </div>
        
        {/* Mobile swap button */}
        <div className="flex md:hidden justify-center my-2">
          <AddressSwapButton />
        </div>
        
        <BillToSection />
      </div>
    </WizardStep>
  );
}

function Step2() {
  return (
    <WizardStep>
      <div className="space-y-8">
        <InvoiceDetailsSection />
        <PaymentInformationSection />
      </div>
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
        <SignatureSection />
        <AdditionalNotesSection />
      </div>
    </WizardStep>
  );
}

export function InvoiceForm() {
  const { form, isLoading, onSubmit } = useInvoiceContext();

  // Handle form submission without validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
        </Wizard>
      </form>
    </Form>
  );
} 