"use client";

import { useState } from "react";

// UI Components
import { Label } from "@/components/ui/label";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/**
 * Available invoice templates
 */
const TEMPLATES = [
    {
        id: 1,
        name: "Classic Business",
        description: "A clean, professional template with a blue accent color",
    },
    {
        id: 2,
        name: "Modern Minimalist",
        description: "A sleek, modern template with a dark accent color",
    },
    {
        id: 3,
        name: "Creative Professional",
        description: "A stylish template with a green accent color",
    },
    {
        id: 4,
        name: "Premium Corporate",
        description: "An elegant template with a purple accent color",
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
    onTemplateChange 
}: TemplateViewSelectorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<number>(initialTemplate);

    // Handle template selection change
    const handleTemplateChange = (value: string) => {
        const templateId = parseInt(value, 10);
        setSelectedTemplate(templateId);
        onTemplateChange(templateId);
    };

    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="template-select" className="whitespace-nowrap">Template:</Label>
            <Select
                value={selectedTemplate.toString()}
                onValueChange={handleTemplateChange}
            >
                <SelectTrigger id="template-select" className="w-[180px]">
                    <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                    {TEMPLATES.map((template) => (
                        <SelectItem 
                            key={template.id} 
                            value={template.id.toString()}
                        >
                            {template.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 