'use client';

import { Check, Eraser } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SignatureCanvas from 'react-signature-canvas';

import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { useSignatureContext } from '@/contexts/SignatureContext';
import { SignatureTabs } from '@/types';
import { SignatureColorSelector } from '@/components/invoice/form/sections/signature/SignatureColorSelector';

interface DrawSignatureProps {
  handleSaveSignature: () => void;
}

export function DrawSignature({ handleSaveSignature }: DrawSignatureProps) {
  const { signatureRef, signatureColors, selectedColor, setSelectedColor, clearDrawnSignature } =
    useSignatureContext();
  const t = useTranslations('form.signature');

  return (
    <TabsContent value={SignatureTabs.DRAW}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4 p-0">
          <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border">
            <SignatureCanvas
              // @ts-expect-error - SignatureCanvas has incomplete type definitions
              ref={signatureRef}
              penColor={selectedColor.value}
              canvasProps={{
                className: 'w-full h-full',
                'aria-label': t('drawCanvasAriaLabel', { defaultValue: 'Signature drawing canvas' })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <SignatureColorSelector
              colors={signatureColors}
              selectedColor={selectedColor}
              handleColorButtonClick={setSelectedColor}
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearDrawnSignature}>
                {t('clearButton', { defaultValue: 'Clear' })}
                <Eraser className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleSaveSignature}>
                {t('doneButton', { defaultValue: 'Done' })}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
