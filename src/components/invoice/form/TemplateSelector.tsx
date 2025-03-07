"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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

/**
 * Template selector component for the invoice form
 * Allows users to select from available invoice templates
 */
export function TemplateSelector() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { watch, setValue } = useFormContext<any>();
    const selectedTemplate = watch("details.pdfTemplate") || 1;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Handle template selection
    const handleTemplateChange = (templateId: number) => {
        setValue("details.pdfTemplate", templateId, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    // Generate preview URL for the selected template
    const handlePreview = () => {
        setPreviewUrl(`/template/${selectedTemplate}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Invoice Template</h3>
                {previewUrl && (
                    <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                    </Link>
                )}
                {!previewUrl && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={handlePreview}
                    >
                        <Eye className="h-4 w-4" />
                        Preview
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => (
                    <div key={template.id} className="relative">
                        <input
                            type="radio"
                            name="template"
                            id={`template-${template.id}`}
                            value={template.id}
                            checked={selectedTemplate === template.id}
                            onChange={() => handleTemplateChange(template.id)}
                            className="sr-only"
                        />
                        <Label
                            htmlFor={`template-${template.id}`}
                            className="cursor-pointer block"
                        >
                            <Card
                                className={`overflow-hidden transition-all ${
                                    selectedTemplate === template.id
                                        ? "ring-2 ring-primary"
                                        : "hover:border-gray-300"
                                }`}
                            >
                                <CardContent className="p-0">
                                    <div className="p-4">
                                        <h4 className="font-medium">{template.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {template.description}
                                        </p>
                                    </div>
                                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                                        <div className="text-sm text-gray-500">
                                            Template {template.id} Preview
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
} 