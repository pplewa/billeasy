'use client';

import { useRef } from 'react';
import { Check, Eraser, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { useSignatureContext } from '@/contexts/SignatureContext';
import { SignatureTabs } from '@/types';

interface UploadSignatureProps {
  handleSaveSignature: () => void;
}

export function UploadSignature({ handleSaveSignature }: UploadSignatureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedSignature, setUploadedSignature, clearUploadedSignature } = useSignatureContext();
  const t = useTranslations('form.signature');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setUploadedSignature(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <TabsContent value={SignatureTabs.UPLOAD}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4 p-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {uploadedSignature ? (
            <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border">
              <img
                src={uploadedSignature}
                alt={t('uploadedSignatureAlt', { defaultValue: 'Uploaded signature' })}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <Button variant="outline" className="h-32 w-full" onClick={handleUploadClick}>
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>{t('uploadButtonText', { defaultValue: 'Click to upload signature' })}</span>
                <span className="text-xs text-muted-foreground">
                  {t('supportedFormats', { defaultValue: 'Supports PNG, JPG or GIF' })}
                </span>
              </div>
            </Button>
          )}
        </CardContent>
        <div className="flex justify-end gap-2 pt-2">
          {uploadedSignature && (
            <Button variant="outline" onClick={clearUploadedSignature}>
              {t('clearButton', { defaultValue: 'Clear' })}
              <Eraser className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button disabled={!uploadedSignature} onClick={handleSaveSignature}>
            {t('doneButton', { defaultValue: 'Done' })}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </TabsContent>
  );
}
