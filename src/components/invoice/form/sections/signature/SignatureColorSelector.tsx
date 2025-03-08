'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface SignatureColor {
  name: string;
  value: string;
}

interface SignatureColorSelectorProps {
  colors: SignatureColor[];
  selectedColor: SignatureColor;
  handleColorButtonClick: (color: SignatureColor) => void;
}

export function SignatureColorSelector({
  colors,
  selectedColor,
  handleColorButtonClick,
}: SignatureColorSelectorProps) {
  const t = useTranslations('form.signature');

  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <Button
          key={color.name}
          variant="outline"
          className="h-8 w-8 rounded-full p-0"
          style={{ backgroundColor: color.value }}
          onClick={() => handleColorButtonClick(color)}
          aria-label={t('colorSelectAriaLabel', { 
            defaultValue: `Select ${color.name} color`,
            colorName: color.name 
          })}
          data-selected={selectedColor.name === color.name}
        />
      ))}
    </div>
  );
}
