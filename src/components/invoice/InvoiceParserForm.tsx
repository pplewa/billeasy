"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { parseInvoiceText, parseInvoiceFile } from "@/services/invoice/client/invoiceParserClient";
import useInvoiceParserStore from "@/store/invoice-parser-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Invoice Parser Form Component
 * Provides a form for parsing invoice information from natural language or file uploads
 */
export function InvoiceParserForm({ locale }: { locale: string }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { setParsedInvoice, setParserLoading, setParserError, isParserLoading, parserError } = useInvoiceParserStore();
  const router = useRouter();
  const { toast } = useToast();

  // Handler for text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 1MB",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF and image files (JPEG, PNG, WebP) are allowed",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedFile(file);
    }
  };

  // Handler for parsing text
  const handleParseText = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter invoice details in the text area",
        variant: "destructive",
      });
      return;
    }

    try {
      setParserLoading(true);
      setParserError(null);
      
      const { invoice } = await parseInvoiceText(text);
      
      if (Object.keys(invoice).length === 0) {
        throw new Error("Could not extract any invoice data from the text");
      }
      
      setParsedInvoice(invoice);
      
      // Redirect to invoice creation page
      router.push(`/${locale}/invoice/create`);
    } catch (error) {
      console.error("Error parsing invoice text:", error);
      setParserError(error instanceof Error ? error.message : "Failed to parse invoice text");
      toast({
        title: "Parsing failed",
        description: error instanceof Error ? error.message : "Failed to parse invoice text",
        variant: "destructive",
      });
    } finally {
      setParserLoading(false);
    }
  };

  // Handler for parsing file
  const handleParseFile = async () => {
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setParserLoading(true);
      setParserError(null);
      
      const { invoice } = await parseInvoiceFile(selectedFile);
      
      if (Object.keys(invoice).length === 0) {
        throw new Error("Could not extract any invoice data from the file");
      }
      
      setParsedInvoice(invoice);
      
      // Redirect to invoice creation page
      router.push(`/${locale}/invoice/create`);
    } catch (error) {
      console.error("Error parsing invoice file:", error);
      setParserError(error instanceof Error ? error.message : "Failed to parse invoice file");
      toast({
        title: "Parsing failed",
        description: error instanceof Error ? error.message : "Failed to parse invoice file",
        variant: "destructive",
      });
    } finally {
      setParserLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quick Invoice Generator</CardTitle>
        <CardDescription>
          Describe your invoice in natural language or upload an existing one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {parserError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{parserError}</AlertDescription>
          </Alert>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2">Describe Your Invoice</h3>
          <Textarea
            placeholder="Example: ACME INC located in New York wants to invoice FOO LTD located in Chicago for 3hr of mowing charged at $50 per hour"
            className="h-32"
            value={text}
            onChange={handleTextChange}
            disabled={isParserLoading}
          />
          <div className="mt-2">
            <Button 
              onClick={handleParseText} 
              disabled={isParserLoading || !text.trim()}
              className="mt-2"
            >
              {isParserLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Invoice
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Upload Existing Invoice</h3>
          <div className="grid w-full items-center gap-1.5">
            <input
              type="file"
              id="invoice-file"
              className="hidden"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isParserLoading}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParserLoading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
              {selectedFile && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPEG, PNG, WebP (max 1MB)
            </p>
          </div>
          <div className="mt-2">
            <Button 
              onClick={handleParseFile} 
              disabled={isParserLoading || !selectedFile}
              className="mt-2"
            >
              {isParserLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Parse File
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          Our AI will extract as much information as possible. You&apos;ll be able to review and edit before saving.
        </p>
      </CardFooter>
    </Card>
  );
} 