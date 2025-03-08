import { ReactNode } from 'react';

// Types
import { InvoiceType } from '@/lib/types';

type InvoiceLayoutProps = {
  data: InvoiceType;
  children: ReactNode;
};

/**
 * Layout component for invoice templates
 * Provides common structure and styling for all invoice templates
 */
export default function InvoiceLayout({ children }: Omit<InvoiceLayoutProps, 'data'>) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-8 max-w-5xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
