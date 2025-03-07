"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpRight,
  FileText,
  Upload,
  Sparkles,
  Shield,
  Loader2,
  ChevronRight,
  Star,
  CreditCard,
  Zap,
  BarChart,
} from "lucide-react";
import {
  parseInvoiceText,
  parseInvoiceFile,
} from "@/services/invoice/client/invoiceParserClient";
import useInvoiceParserStore from "@/store/invoice-parser-store";
import { useToast } from "@/components/ui/use-toast";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState<string>("");
  const [text, setText] = useState("");
  const [isTextFocused, setIsTextFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    setParsedInvoice,
    setParserLoading,
    setParserError,
    isParserLoading,
  } = useInvoiceParserStore();
  const router = useRouter();
  const { toast } = useToast();

  // Get locale from params
  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const handleCreateInvoice = () => {
    if (text.trim()) {
      // If there's text, parse it
      handleParseText();
    } else {
      // Otherwise, just navigate to create page
      router.push(`/${locale}/invoice/create`);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  // Handler for file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];
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

      // Automatically parse the file
      await handleParseFile(file);
    }
  };

  // Handler for parsing text
  const handleParseText = async () => {
    if (!text.trim()) {
      router.push(`/${locale}/invoice/create`);
      return;
    }

    try {
      setParserLoading(true);
      setParserError(null);

      const { invoice } = await parseInvoiceText(text);

      if (Object.keys(invoice).length === 0) {
        throw new Error("Could not extract any invoice data from the text");
      }

      // Restructure invoice to ensure it's properly formatted
      const restructuredInvoice: any = { ...invoice };
      
      // If items exist at the top level, move them to details.items
      if ((invoice as any).items && Array.isArray((invoice as any).items)) {
        restructuredInvoice.details = restructuredInvoice.details || {};
        restructuredInvoice.details.items = (invoice as any).items;
        delete restructuredInvoice.items; // Remove from top level
      }
      
      // Make sure we have a details section with an items array
      restructuredInvoice.details = restructuredInvoice.details || {};
      restructuredInvoice.details.items = restructuredInvoice.details.items || [];
      
      // Ensure each item is properly structured with all required fields
      if (restructuredInvoice.details.items.length > 0) {
        restructuredInvoice.details.items = restructuredInvoice.details.items.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          name: item.name || item.description || 'Item',
          description: item.description || '',
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
          total: typeof item.total === 'number' ? item.total : 0
        }));
      }
      
      // Ensure the invoice has sender and receiver sections
      restructuredInvoice.sender = restructuredInvoice.sender || {};
      restructuredInvoice.receiver = restructuredInvoice.receiver || {};

      console.log('Storing restructured invoice:', JSON.stringify(restructuredInvoice, null, 2));
      setParsedInvoice(restructuredInvoice);

      // Redirect to invoice creation page
      router.push(`/${locale}/invoice/create`);
    } catch (error) {
      console.error("Error parsing invoice text:", error);
      setParserError(
        error instanceof Error ? error.message : "Failed to parse invoice text"
      );
      toast({
        title: "Parsing failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to parse invoice text",
        variant: "destructive",
      });

      // Still navigate to create page even on error
      setParsedInvoice(null);
      router.push(`/${locale}/invoice/create`);
    } finally {
      setParserLoading(false);
    }
  };

  // Handler for parsing file
  const handleParseFile = async (file: File) => {
    if (!file) {
      return;
    }

    try {
      setParserLoading(true);
      setParserError(null);

      const { invoice } = await parseInvoiceFile(file);

      if (Object.keys(invoice).length === 0) {
        throw new Error("Could not extract any invoice data from the file");
      }

      setParsedInvoice(invoice);

      // Redirect to invoice creation page
      router.push(`/${locale}/invoice/create`);
    } catch (error) {
      console.error("Error parsing invoice file:", error);
      setParserError(
        error instanceof Error ? error.message : "Failed to parse invoice file"
      );
      toast({
        title: "Parsing failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to parse invoice file",
        variant: "destructive",
      });

      // Still navigate to create page even on error
      setParsedInvoice(null);
      router.push(`/${locale}/invoice/create`);
    } finally {
      setParserLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Hero Section */}
        <section className="py-16 md:py-24 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Professional Invoices in Seconds
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Create, customize, and send invoices instantly
          </p>

          {/* Quick Invoice Generator */}
          <Card className="w-full max-w-3xl mx-auto shadow-lg border-muted/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div
                className={`relative transition-all duration-200 ${isTextFocused ? "ring-2 ring-primary/50 rounded-lg" : ""}`}
              >
                <Textarea
                  placeholder="Describe your invoice details or upload an existing one (PDF, JPEG, PNG, WebP)"
                  className={`transition-all duration-200 text-lg resize-none pb-20 ${isTextFocused ? "border-primary" : ""}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={() => setIsTextFocused(true)}
                  onBlur={() => setIsTextFocused(false)}
                  autoExpand={true}
                />

                <div className="flex flex-col  sm:flex-row gap-3 justify-end -mt-14">
                  <input
                    type="file"
                    id="invoice-file"
                    className="hidden"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />

                  <div className="flex gap-3 w-full w-full pl-4 pr-4 justify-between">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 sm:flex-none gap-2"
                      onClick={handleUpload}
                      disabled={isParserLoading}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Invoice</span>
                    </Button>

                    <Button
                      size="lg"
                      className="flex-1 sm:flex-none gap-2"
                      onClick={handleCreateInvoice}
                      disabled={isParserLoading}
                    >
                      {isParserLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-5 w-5" />
                          <span>
                            {text.trim()
                              ? "Parse & Create"
                              : "Create New Invoice"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits section */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-muted/30">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground text-center">
                Create professional invoices in seconds, not minutes
              </p>
            </div>

            <div className="flex flex-col items-center bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-muted/30">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground text-center">
                Auto-extract details from text or documents
              </p>
            </div>

            <div className="flex flex-col items-center bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-muted/30">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Sign-up</h3>
              <p className="text-muted-foreground text-center">
                Start immediately, sign in only when you need to save
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 border-t border-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create professional invoices in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white mb-6 z-10">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Create</h3>
                <p className="text-muted-foreground">
                  Type a description or upload an existing invoice. Our AI will
                  extract all relevant details automatically.
                </p>
              </div>

              <div className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white mb-6 z-10">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Customize</h3>
                <p className="text-muted-foreground">
                  Review and edit your invoice details in our user-friendly
                  editor. Add your branding, adjust line items, and more.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white mb-6 z-10">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Download or Save</h3>
                <p className="text-muted-foreground">
                  Export your invoice as a professional PDF, or sign in to save
                  it to your account for future reference and tracking.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/invoice/create`)}
                className="px-8 gap-2"
              >
                Create Your First Invoice
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30 -mx-4 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create professional invoices quickly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      AI-Powered Extraction
                    </h3>
                    <p className="text-muted-foreground">
                      Our advanced AI analyzes text and documents to
                      automatically fill in invoice details, saving you time and
                      reducing errors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Account Required
                    </h3>
                    <p className="text-muted-foreground">
                      Create and download invoices without signing up. Sign in
                      only when you want to save invoices for later or track
                      payments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Professional Templates
                    </h3>
                    <p className="text-muted-foreground">
                      Choose from a variety of professionally designed invoice
                      templates to make your business look its best.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Automatic Calculations
                    </h3>
                    <p className="text-muted-foreground">
                      Let our system handle all calculations including
                      subtotals, taxes, discounts, and totals with perfect
                      accuracy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Multi-format Export
                    </h3>
                    <p className="text-muted-foreground">
                      Download your invoices in multiple formats including PDF,
                      ready to send to clients or for your records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Custom Branding
                    </h3>
                    <p className="text-muted-foreground">
                      Add your logo, custom colors, and personalize every aspect
                      of your invoice to match your brand identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push(`/${locale}/invoice/create`)}
                className="px-8"
              >
                Try Bill Easy Now — Free
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials or Social Proof (Can be added in a future update) */}

        {/* Call to Action */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to create professional invoices?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start creating beautifully designed, legally compliant invoices in
              just seconds.
            </p>
            <Button
              size="lg"
              onClick={() => router.push(`/${locale}/invoice/create`)}
              className="px-10 py-6 text-lg"
            >
              Get Started Now
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
