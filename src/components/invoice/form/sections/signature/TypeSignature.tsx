'use client';

import { Check, Eraser } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useSignatureContext } from '@/contexts/SignatureContext';
import { SignatureTabs } from '@/types';

interface TypeSignatureProps {
  handleSaveSignature: () => void;
}

export function TypeSignature({ handleSaveSignature }: TypeSignatureProps) {
  const {
    typedSignature,
    setTypedSignature,
    typedSignatureRef,
    typedSignatureFonts,
    selectedFont,
    setSelectedFont,
    clearTypedSignature,
  } = useSignatureContext();

  return (
    <TabsContent value={SignatureTabs.TYPE}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4 p-0">
          <Input
            ref={typedSignatureRef}
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            placeholder="Type your signature"
            style={{ fontFamily: selectedFont.variable }}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Font Style</label>
            <Select
              value={selectedFont.name}
              onValueChange={(value) => {
                const font = typedSignatureFonts.find((f) => f.name === value);
                if (font) {
                  setSelectedFont(font);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font style" />
              </SelectTrigger>
              <SelectContent>
                {typedSignatureFonts.map((font) => (
                  <SelectItem
                    key={font.name}
                    value={font.name}
                    style={{ fontFamily: font.variable }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <div className="flex justify-end gap-2 pt-2">
          {typedSignature && (
            <Button variant="outline" onClick={clearTypedSignature}>
              Clear
              <Eraser className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button disabled={!typedSignature} onClick={handleSaveSignature}>
            Done
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </TabsContent>
  );
}
