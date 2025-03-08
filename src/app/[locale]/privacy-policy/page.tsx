'use client';

import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

function PrivacyPolicyContent() {
  const appT = useTranslations('app');
  const appName = appT('name');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to {appName}. We respect your privacy and are committed to protecting your
          personal data. This privacy policy will inform you about how we handle your data when using our
          invoice management system and what rights you have regarding your data.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. The Data We Collect</h2>
        <p>
          We collect and process only the data necessary to provide our invoice management service. This includes:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            <strong>Account Data:</strong> Email address and password for authentication.
          </li>
          <li>
            <strong>Business Information:</strong> Your business details used in invoices (company name, address, contact information).
          </li>
          <li>
            <strong>Client Data:</strong> Information about your clients necessary for invoice creation (company names, addresses, contact details).
          </li>
          <li>
            <strong>Invoice Data:</strong> Information contained in your invoices (items, prices, payment terms, notes).
          </li>
          <li>
            <strong>Usage Data:</strong> Basic information about how you use the application to improve our service.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Data</h2>
        <p>
          We use your data exclusively for:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Providing the invoice management service</li>
          <li>Generating and managing your invoices</li>
          <li>Storing your invoice history</li>
          <li>Improving the application's functionality</li>
          <li>Ensuring the security of your account</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
        <p>
          All data is stored securely in our database. We implement appropriate security measures to protect
          your data from unauthorized access, modification, or deletion. Your invoices and business
          information are only accessible through your authenticated account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Retention</h2>
        <p>
          We retain your data for as long as you maintain an active account. Invoice data is kept to
          maintain your invoice history and comply with legal requirements regarding business documentation.
          You can request the deletion of your account and associated data at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Access your stored data</li>
          <li>Correct any inaccurate information</li>
          <li>Export your invoice data</li>
          <li>Delete your account and associated data</li>
          <li>Request information about how your data is processed</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or how we handle your data, please
          contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> info@billeasy.online
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
