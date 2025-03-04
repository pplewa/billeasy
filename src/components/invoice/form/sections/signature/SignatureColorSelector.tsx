"use client";

import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <Button
          key={color.name}
          variant="outline"
          className="h-8 w-8 rounded-full p-0"
          style={{ backgroundColor: color.value }}
          onClick={() => handleColorButtonClick(color)}
          aria-label={`Select ${color.name} color`}
          data-selected={selectedColor.name === color.name}
        />
      ))}
    </div>
  );
} 