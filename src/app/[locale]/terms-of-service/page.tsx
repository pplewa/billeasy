'use client';

import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

function TermsOfServiceContent() {
  const appT = useTranslations('app');
  const t = useTranslations('termsOfService');
  const appName = appT('name');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. {t('introduction')}</h2>
        <p>{t('introText', { appName })}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. {t('serviceDescription')}</h2>
        <p>{t('serviceDescriptionText', { appName })}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Create and manage professional invoices</li>
          <li>Store and organize client information</li>
          <li>Track invoice status and payment history</li>
          <li>Generate invoice PDFs</li>
          <li>Manage multiple invoice templates</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. {t('userObligations')}</h2>
        <p>{t('userObligationsText', { appName })}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Provide accurate information in your invoices</li>
          <li>Keep your account credentials secure</li>
          <li>Not use the service for any illegal purposes</li>
          <li>Not attempt to disrupt or compromise the service</li>
          <li>Comply with relevant tax and business regulations in your jurisdiction</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. {t('dataAndContent')}</h2>
        <p>{t('dataAndContentText1', { appName })}</p>
        <p>{t('dataAndContentText2')}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>The accuracy of information in your invoices</li>
          <li>Maintaining appropriate records for tax purposes</li>
          <li>Obtaining necessary permissions to use client information</li>
          <li>Backing up your important data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. {t('serviceAvailability')}</h2>
        <p>{t('serviceAvailabilityText')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. {t('limitationOfLiability')}</h2>
        <p>{t('limitationOfLiabilityText', { appName })}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>The accuracy of generated invoices</li>
          <li>Any financial losses related to using our service</li>
          <li>Compliance with local tax or business regulations</li>
          <li>Data loss in case of service disruption</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. {t('changesToService')}</h2>
        <p>{t('changesToServiceText')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. {t('termination')}</h2>
        <p>{t('terminationText')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. {t('contact')}</h2>
        <p>{t('contactText')}</p>
        <p className="mt-2">
          <strong>{t('email')}:</strong> info@billeasy.online
        </p>
      </div>
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <TermsOfServiceContent />
    </Suspense>
  );
}
