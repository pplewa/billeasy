"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";

function TermsOfServiceContent() {
  const appT = useTranslations("app");
  const appName = appT("name");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to {appName}. These terms and conditions outline the rules and regulations for the use of our website and services.
        </p>
        <p>
          By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use {appName} if you do not accept all of the terms and conditions stated on this page.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. License to Use</h2>
        <p>
          Unless otherwise stated, {appName} and/or its licensors own the intellectual property rights for all material on {appName}. All intellectual property rights are reserved.
        </p>
        <p>
          You may view and/or print pages from the website for your own personal use subject to restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Republish material from this website</li>
          <li>Sell, rent or sub-license material from this website</li>
          <li>Reproduce, duplicate or copy material from this website</li>
          <li>Redistribute content from {appName} (unless content is specifically made for redistribution)</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Account</h2>
        <p>
          When you create an account with us, you guarantee that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Services and Billing</h2>
        <p>
          {appName} offers various subscription plans for our invoicing services. By selecting a subscription plan, you agree to pay the specified fees. Billing will occur on a recurring basis, depending on the billing cycle you select when purchasing a subscription.
        </p>
        <p>
          You may cancel your subscription at any time. Upon cancellation, you will continue to have access to the service through the end of your billing period.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Free Trial</h2>
        <p>
          {appName} may, at its sole discretion, offer a subscription with a free trial for a limited period of time. You may be required to enter your billing information to sign up for the free trial.
        </p>
        <p>
          If you do not cancel your subscription before the end of the free trial period, you will be automatically charged the applicable subscription fee for the type of subscription you have selected.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
        <p>
          In no event shall {appName}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use or alteration of your transmissions or content</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
        <p>
          By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> terms@billeasy.com<br />
          <strong>Address:</strong> 123 Invoice Street, Suite 456, San Francisco, CA 94103
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