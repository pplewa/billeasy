"use client";

import React from "react";

// React Wizard
import { useWizard } from "react-use-wizard";

// Components
import { WizardNavigation } from "./WizardNavigation";
import { WizardProgress } from "./WizardProgress";

interface WizardStepProps {
    children: React.ReactNode;
}

export function WizardStep({ children }: WizardStepProps) {
    const wizard = useWizard();

    return (
        <div className="min-h-[25rem] space-y-8">
            <WizardProgress wizard={wizard} />
            <div className="space-y-4">
                {children}
            </div>
            <WizardNavigation />
        </div>
    );
} 