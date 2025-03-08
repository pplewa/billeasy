'use client';

import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

function TermsOfServiceContent() {
  const appT = useTranslations('app');
  const appName = appT('name');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to {appName}. These terms and conditions govern your use of our invoice management
          system. By using {appName}, you agree to these terms in full. Please read them carefully
          before using the service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Service Description</h2>
        <p>
          {appName} provides an online invoice management system that allows you to:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Create and manage professional invoices</li>
          <li>Store and organize client information</li>
          <li>Track invoice status and payment history</li>
          <li>Generate invoice PDFs</li>
          <li>Manage multiple invoice templates</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Obligations</h2>
        <p>When using {appName}, you agree to:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Provide accurate information in your invoices</li>
          <li>Keep your account credentials secure</li>
          <li>Not use the service for any illegal purposes</li>
          <li>Not attempt to disrupt or compromise the service</li>
          <li>Comply with relevant tax and business regulations in your jurisdiction</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data and Content</h2>
        <p>
          You retain all rights to the content you create using {appName}, including your invoices,
          client information, and business data. We do not claim ownership of your content.
        </p>
        <p>
          You are responsible for:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>The accuracy of information in your invoices</li>
          <li>Maintaining appropriate records for tax purposes</li>
          <li>Obtaining necessary permissions to use client information</li>
          <li>Backing up your important data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Service Availability</h2>
        <p>
          While we strive to maintain high availability, we do not guarantee uninterrupted access to
          the service. We may occasionally need to suspend access to deploy updates or perform
          maintenance.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
        <p>
          {appName} is provided &quot;as is&quot; without any warranties. We are not responsible for:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>The accuracy of generated invoices</li>
          <li>Any financial losses related to using our service</li>
          <li>Compliance with local tax or business regulations</li>
          <li>Data loss in case of service disruption</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to Service</h2>
        <p>
          We reserve the right to modify or discontinue any part of the service at any time. We will
          provide notice of significant changes through the application or via email.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
        <p>
          You may stop using the service at any time. We may terminate or suspend your access if you
          violate these terms or use the service inappropriately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
        <p>
          If you have any questions about these terms, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> info@billeasy.online
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
