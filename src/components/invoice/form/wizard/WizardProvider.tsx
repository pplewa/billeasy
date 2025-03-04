"use client";

import { Wizard } from "react-use-wizard";

interface WizardProviderProps {
  children: React.ReactNode;
}

export function WizardProvider({ children }: WizardProviderProps) {
  return (
    <Wizard>
      {children}
    </Wizard>
  );
} 