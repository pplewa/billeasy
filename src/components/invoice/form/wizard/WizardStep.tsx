"use client";

import React, { ReactNode } from "react";

// React Wizard
import { useWizard } from "react-use-wizard";

// Components
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardStepProps {
    children: ReactNode;
    title: string;
    description: string;
    showNext?: boolean;
    showPrevious?: boolean;
}

export function WizardStep({
    children,
    title,
    description,
    showNext = true,
    showPrevious = true,
}: WizardStepProps) {
    const { previousStep, nextStep, isFirstStep, isLastStep } = useWizard();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="space-y-6">{children}</div>
            <div className="flex justify-between">
                {showPrevious && !isFirstStep && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                )}
                {showNext && !isLastStep && (
                    <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
} 