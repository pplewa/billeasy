'use client';

// React Wizard
import { useWizard } from 'react-use-wizard';

// Components
import { Button } from '@/components/ui/button';

// Icons
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Translations
import { useTranslations } from 'next-intl';

export function WizardNavigation() {
  const { activeStep, stepCount, previousStep, nextStep } = useWizard();
  const t = useTranslations('form.navigation');

  return (
    <div className="flex justify-between">
      <Button type="button" variant="outline" onClick={previousStep} disabled={activeStep === 0}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      <Button type="button" onClick={nextStep} disabled={activeStep === stepCount - 1}>
        {t('next')}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
