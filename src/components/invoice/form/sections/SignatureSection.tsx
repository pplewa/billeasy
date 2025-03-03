"use client";

import { useState } from "react";
import { FileSignature } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";

import { SignatureModal } from "./SignatureModal";
import { InvoiceType } from "@/types";

export function SignatureSection() {
  const { setValue, watch } = useFormContext<InvoiceType>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const signatureData = watch("details.signature.data");
  const signatureFontFamily = watch("details.signature.fontFamily");

  const handleSaveSignature = (signature: string, fontFamily?: string) => {
    setValue("details.signature.data", signature, {
      shouldDirty: true,
    });

    if (fontFamily) {
      setValue("details.signature.fontFamily", fontFamily, {
        shouldDirty: true,
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label>Signature</Label>
      <div
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer"
      >
        {signatureData ? (
          <div className="relative aspect-[3/1] w-[300px] overflow-hidden rounded-lg border">
            <img
              src={signatureData}
              alt="Signature"
              className="h-full w-full object-contain"
              style={signatureFontFamily ? { fontFamily: signatureFontFamily } : undefined}
            />
          </div>
        ) : (
          <div
            style={{
              width: "300px",
            }}
            className="flex flex-col justify-center items-center h-[155px] rounded-md bg-gray-100 dark:bg-slate-800 border border-black dark:border-white hover:border-blue-500"
          >
            <FileSignature />
            <Label>Click to add signature</Label>
          </div>
        )}
      </div>
      <SignatureModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveSignature}
      />
    </div>
  );
} 