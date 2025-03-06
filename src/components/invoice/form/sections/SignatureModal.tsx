"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SignatureProvider, useSignatureContext } from "@/contexts/SignatureContext";
import { SignatureTabs } from "@/types";
import { DrawSignature } from "./signature/DrawSignature";
import { TypeSignature } from "./signature/TypeSignature";
import { UploadSignature } from "./signature/UploadSignature";

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (signature: string, fontFamily?: string) => void;
}

function SignatureModalContent({ onSave, onOpenChange }: Omit<SignatureModalProps, "open">) {
  const [activeTab, setActiveTab] = useState<SignatureTabs>(SignatureTabs.DRAW);
  const {
    signatureRef,
    typedSignature,
    selectedFont,
    uploadedSignature,
  } = useSignatureContext();

  const handleSaveSignature = () => {
    let signatureData = "";
    let fontFamily: string | undefined;

    if (activeTab === SignatureTabs.DRAW) {
      signatureData = signatureRef.current?.toDataURL("image/png") ?? "";
    } else if (activeTab === SignatureTabs.TYPE) {
      // For typed signatures, just use the text directly
      signatureData = typedSignature;
      fontFamily = selectedFont.variable;
    } else if (activeTab === SignatureTabs.UPLOAD) {
      signatureData = uploadedSignature;
    }

    onSave(signatureData, fontFamily);
    onOpenChange(false);
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SignatureTabs)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value={SignatureTabs.DRAW}>Draw</TabsTrigger>
        <TabsTrigger value={SignatureTabs.TYPE}>Type</TabsTrigger>
        <TabsTrigger value={SignatureTabs.UPLOAD}>Upload</TabsTrigger>
      </TabsList>
      <DrawSignature handleSaveSignature={handleSaveSignature} />
      <TypeSignature handleSaveSignature={handleSaveSignature} />
      <UploadSignature handleSaveSignature={handleSaveSignature} />
    </Tabs>
  );
}

export function SignatureModal({ open, onOpenChange, onSave }: SignatureModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Signature</DialogTitle>
        </DialogHeader>
        <SignatureProvider>
          <SignatureModalContent onSave={onSave} onOpenChange={onOpenChange} />
        </SignatureProvider>
      </DialogContent>
    </Dialog>
  );
} 