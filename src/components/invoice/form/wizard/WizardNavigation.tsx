'use client';

// React Wizard
import { useWizard } from 'react-use-wizard';

// Components
import { Button } from '@/components/ui/button';

// Icons
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function WizardNavigation() {
  const { activeStep, stepCount, previousStep, nextStep } = useWizard();

  return (
    <div className="flex justify-between">
      <Button type="button" variant="outline" onClick={previousStep} disabled={activeStep === 0}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <Button type="button" onClick={nextStep} disabled={activeStep === stepCount - 1}>
        Next
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
