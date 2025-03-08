'use client';

import { useTranslations, useMessages } from 'next-intl';
import { Suspense } from 'react';

function PrivacyPolicyContent() {
  const appT = useTranslations('app');
  const t = useTranslations('privacyPolicy');
  const appName = appT('name');
  const messages = useMessages();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6"></p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. {t('introduction')}</h2>
        <p>{t('introText', { appName })}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. {t('dataWeCollect')}</h2>
        <p>{t('dataWeCollectText')}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          {(
            (messages.privacyPolicy as unknown as { dataWeCollectItems: [] })
              .dataWeCollectItems as unknown as Array<{
              title: string;
              description: string;
            }>
          ).map((item) => (
            <li key={item.title}>
              <strong>{item.title}:</strong> {item.description}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. {t('howWeUseData')}</h2>
        <p>{t('howWeUseDataText')}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          {(
            (messages.privacyPolicy as unknown as { howWeUseDataItems: [] })
              .howWeUseDataItems as unknown as string[]
          ).map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. {t('dataStorage')}</h2>
        <p>{t('dataStorageText')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. {t('dataRetention')}</h2>
        <p>{t('dataRetentionText')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. {t('yourRights')}</h2>
        <p>{t('yourRightsText')}</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          {(
            (messages.privacyPolicy as unknown as { yourRightsItems: [] })
              .yourRightsItems as unknown as string[]
          ).map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. {t('contactUs')}</h2>
        <p>{t('contactUsText')}</p>
        <p className="mt-2">
          <strong>{t('email')}:</strong> info@billeasy.online
        </p>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PrivacyPolicyContent />
    </Suspense>
  );
}
