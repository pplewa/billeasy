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
          personal data. This privacy policy will inform you about how we look after your personal
          data when you visit our website and tell you about your privacy rights and how the law
          protects you.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. The Data We Collect About You</h2>
        <p>
          Personal data, or personal information, means any information about an individual from
          which that person can be identified. It does not include data where the identity has been
          removed (anonymous data).
        </p>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you which
          we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            <strong>Identity Data</strong> includes first name, last name, username or similar
            identifier.
          </li>
          <li>
            <strong>Contact Data</strong> includes billing address, delivery address, email address
            and telephone numbers.
          </li>
          <li>
            <strong>Financial Data</strong> includes payment card details.
          </li>
          <li>
            <strong>Transaction Data</strong> includes details about payments to and from you and
            other details of products and services you have purchased from us.
          </li>
          <li>
            <strong>Technical Data</strong> includes internet protocol (IP) address, your login
            data, browser type and version, time zone setting and location, browser plug-in types
            and versions, operating system and platform, and other technology on the devices you use
            to access this website.
          </li>
          <li>
            <strong>Profile Data</strong> includes your username and password, purchases or orders
            made by you, your interests, preferences, feedback and survey responses.
          </li>
          <li>
            <strong>Usage Data</strong> includes information about how you use our website, products
            and services.
          </li>
          <li>
            <strong>Marketing and Communications Data</strong> includes your preferences in
            receiving marketing from us and our third parties and your communication preferences.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Personal Data</h2>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use
          your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            Where we need to perform the contract we are about to enter into or have entered into
            with you.
          </li>
          <li>
            Where it is necessary for our legitimate interests (or those of a third party) and your
            interests and fundamental rights do not override those interests.
          </li>
          <li>Where we need to comply with a legal obligation.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from
          being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In
          addition, we limit access to your personal data to those employees, agents, contractors
          and other third parties who have a business need to know. They will only process your
          personal data on our instructions and they are subject to a duty of confidentiality.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as reasonably necessary to fulfill the
          purposes we collected it for, including for the purposes of satisfying any legal,
          regulatory, tax, accounting or reporting requirements. We may retain your personal data
          for a longer period in the event of a complaint or if we reasonably believe there is a
          prospect of litigation in respect to our relationship with you.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Legal Rights</h2>
        <p>
          Under certain circumstances, you have rights under data protection laws in relation to
          your personal data, including the right to:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Request access to your personal data.</li>
          <li>Request correction of your personal data.</li>
          <li>Request erasure of your personal data.</li>
          <li>Object to processing of your personal data.</li>
          <li>Request restriction of processing your personal data.</li>
          <li>Request transfer of your personal data.</li>
          <li>Right to withdraw consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please
          contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> privacy@billeasy.com
          <br />
          <strong>Address:</strong> 123 Invoice Street, Suite 456, San Francisco, CA 94103
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
