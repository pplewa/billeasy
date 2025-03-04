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
      // Create a canvas to render the typed signature with the selected font
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set canvas dimensions based on text size
        const fontSize = 48;
        ctx.font = `${fontSize}px ${selectedFont.variable}`;
        const textMetrics = ctx.measureText(typedSignature);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        canvas.width = textWidth + 40; // Add padding
        canvas.height = textHeight + 40; // Add padding

        // Clear canvas and set font
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px ${selectedFont.variable}`;
        ctx.fillStyle = "#000000";
        ctx.textBaseline = "middle";

        // Draw text centered
        ctx.fillText(
          typedSignature,
          20, // Left padding
          canvas.height / 2 // Vertical center
        );

        signatureData = canvas.toDataURL("image/png");
        fontFamily = selectedFont.variable;
      }
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