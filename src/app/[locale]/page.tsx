'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';
import { parseInvoiceText, parseInvoiceFile } from '@/services/invoice/client/invoiceParserClient';
import useInvoiceParserStore from '@/store/invoice-parser-store';
import { useToast } from '@/components/ui/use-toast';
import { ParsedInvoiceType, CustomInput } from '@/lib/types/invoice';
import { useTranslations } from 'next-intl';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('');
  const [text, setText] = useState('');
  const [isTextFocused, setIsTextFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setParsedInvoice, setParserLoading, setParserError, isParserLoading } =
    useInvoiceParserStore();
  const router = useRouter();
  const { toast } = useToast();

  // Get translations
  const t = useTranslations('home');

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
          title: 'File too large',
          description: 'Please select a file smaller than 1MB',
          variant: 'destructive',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Only PDF and image files (JPEG, PNG, WebP) are allowed',
          variant: 'destructive',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
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
        throw new Error('Could not extract any invoice data from the text');
      }

      // Create proper interface for our invoice structure
      interface InvoiceItem {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }

      interface InvoiceDetails {
        items: InvoiceItem[];
        [key: string]: unknown;
      }

      interface ParsedInvoice {
        details?: Partial<InvoiceDetails>;
        items?: InvoiceItem[];
        [key: string]: unknown;
      }

      // Restructure invoice to ensure it's properly formatted
      const restructuredInvoice: ParsedInvoiceType = {
        sender: {
          ...((invoice as ParsedInvoice).sender || {}),
          customInputs: Array.isArray(invoice?.sender?.customInputs)
            ? (invoice?.sender?.customInputs as CustomInput[])
            : [],
        },
        receiver: {
          ...((invoice as ParsedInvoice).receiver || {}),
          customInputs: Array.isArray(invoice?.receiver?.customInputs)
            ? (invoice?.receiver?.customInputs as CustomInput[])
            : [],
        },
        details: {
          ...((invoice as ParsedInvoice).details || {}),
          items: Array.isArray(invoice?.details?.items) ? invoice?.details?.items : [],
        },
      };

      // Ensure the invoice has sender and receiver sections
      restructuredInvoice.sender = restructuredInvoice.sender || {};
      restructuredInvoice.receiver = restructuredInvoice.receiver || {};

      console.log('Storing restructured invoice:', JSON.stringify(restructuredInvoice, null, 2));
      setParsedInvoice(restructuredInvoice);

      // Redirect to invoice creation page
      router.push(`/${locale}/invoice/create`);
    } catch (error) {
      console.error('Error parsing invoice text:', error);
      setParserError(error instanceof Error ? error.message : 'Failed to parse invoice text');
      toast({
        title: 'Parsing failed',
        description: error instanceof Error ? error.message : 'Failed to parse invoice text',
        variant: 'destructive',
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
        throw new Error('Could not extract any invoice data from the file');
      }

      // Ensure proper typing for ParsedInvoiceType
      const typedInvoice: ParsedInvoiceType = {
        sender: {
          ...((invoice as Record<string, unknown>).sender || {}),
          customInputs: Array.isArray(invoice?.sender?.customInputs)
            ? (invoice?.sender?.customInputs as CustomInput[])
            : [],
        },
        receiver: {
          ...(invoice.receiver || {}),
          customInputs: Array.isArray(invoice?.receiver?.customInputs)
            ? (invoice?.receiver?.customInputs as CustomInput[])
            : [],
        },
        details: {
          ...((invoice as Record<string, unknown>).details || {}),
          items: Array.isArray(invoice?.details?.items) ? invoice?.details?.items : [],
        },
      };

      setParsedInvoice(typedInvoice);

      // Redirect to invoice creation page
      router.push(`/${locale}/invoice/create`);
    } catch (error) {
      console.error('Error parsing invoice file:', error);
      setParserError(error instanceof Error ? error.message : 'Failed to parse invoice file');
      toast({
        title: 'Parsing failed',
        description: error instanceof Error ? error.message : 'Failed to parse invoice file',
        variant: 'destructive',
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
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            {t('hero.subtitle')}
          </p>

          {/* Quick Invoice Generator */}
          <Card className="w-full max-w-3xl mx-auto shadow-lg border-muted/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div
                className={`relative transition-all duration-200 ${isTextFocused ? 'ring-2 ring-primary/50 rounded-lg' : ''}`}
              >
                <Textarea
                  placeholder={t('hero.textareaPlaceholder')}
                  className={`transition-all duration-200 text-lg resize-none pb-20 ${isTextFocused ? 'border-primary' : ''}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={() => setIsTextFocused(true)}
                  onBlur={() => setIsTextFocused(false)}
                  autoExpand={true}
                />

                <div className="flex flex-col sm:flex-row gap-3 justify-end -mt-14">
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
                      <span>{t('hero.uploadButton')}</span>
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
                          <span>{t('hero.processingButton')}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-5 w-5" />
                          <span>
                            {text.trim() ? t('hero.parseButton') : t('hero.createButton')}
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
              <h3 className="text-lg font-semibold mb-2">{t('benefits.lightningFast.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('benefits.lightningFast.description')}
              </p>
            </div>

            <div className="flex flex-col items-center bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-muted/30">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('benefits.aiPowered.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('benefits.aiPowered.description')}
              </p>
            </div>

            <div className="flex flex-col items-center bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-muted/30">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('benefits.noSignup.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('benefits.noSignup.description')}
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 border-t border-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('howItWorks.title')}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white mb-6 z-10">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('howItWorks.steps.create.title')}</h3>
                <p className="text-muted-foreground">{t('howItWorks.steps.create.description')}</p>
              </div>

              <div className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white mb-6 z-10">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t('howItWorks.steps.customize.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.steps.customize.description')}
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white mb-6 z-10">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t('howItWorks.steps.download.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.steps.download.description')}
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/invoice/create`)}
                className="px-8 gap-2"
              >
                {t('howItWorks.createFirstInvoice')}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30 -mx-4 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('features.title')}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
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
                      {t('features.aiExtraction.title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('features.aiExtraction.description')}
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
                    <h3 className="text-xl font-semibold mb-2">{t('features.noAccount.title')}</h3>
                    <p className="text-muted-foreground">{t('features.noAccount.description')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{t('features.templates.title')}</h3>
                    <p className="text-muted-foreground">{t('features.templates.description')}</p>
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
                      {t('features.calculations.title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('features.calculations.description')}
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
                    <h3 className="text-xl font-semibold mb-2">{t('features.export.title')}</h3>
                    <p className="text-muted-foreground">{t('features.export.description')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-muted/20 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{t('features.branding.title')}</h3>
                    <p className="text-muted-foreground">{t('features.branding.description')}</p>
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
                {t('features.tryNow')}
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials or Social Proof (Can be added in a future update) */}

        {/* Call to Action */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t('cta.subtitle')}</p>
            <Button
              size="lg"
              onClick={() => router.push(`/${locale}/invoice/create`)}
              className="px-10 py-6 text-lg"
            >
              {t('cta.button')}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
