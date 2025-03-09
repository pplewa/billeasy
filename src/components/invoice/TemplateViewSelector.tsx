'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// UI Components
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Available invoice templates
 */
const TEMPLATES = [
  {
    id: 1,
    name: '1',
  },
  {
    id: 2,
    name: '2',
  },
  {
    id: 3,
    name: '3',
  },
  {
    id: 4,
    name: '4',
  },
];

interface TemplateViewSelectorProps {
  initialTemplate: number;
  onTemplateChange: (templateId: number) => void;
}

/**
 * Template selector component for the invoice view page
 * Allows users to select from available invoice templates when viewing an invoice
 */
export function TemplateViewSelector({
  initialTemplate = 1,
  onTemplateChange,
}: TemplateViewSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(initialTemplate);
  const t = useTranslations('invoiceTemplate');

  // Handle template selection change
  const handleTemplateChange = (value: string) => {
    const templateId = parseInt(value, 10);
    setSelectedTemplate(templateId);
    onTemplateChange(templateId);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="template-select" className="whitespace-nowrap">
        {t('title')}
      </Label>
      <Select value={selectedTemplate.toString()} onValueChange={handleTemplateChange}>
        <SelectTrigger id="template-select" className="w-[60px]">
          <SelectValue placeholder="Select template" />
        </SelectTrigger>
        <SelectContent>
          {TEMPLATES.map((template) => (
            <SelectItem key={template.id} value={template.id.toString()}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
