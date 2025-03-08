import { create } from 'zustand';
import { FormInvoiceType, ParsedInvoiceType } from '@/lib/types/invoice';

interface InvoiceParserState {
  parsedInvoice: ParsedInvoiceType | null;
  isParserLoading: boolean;
  parserError: string | null;
  
  // Actions
  setParsedInvoice: (invoice: ParsedInvoiceType | null) => void;
  setParserLoading: (isLoading: boolean) => void;
  setParserError: (error: string | null) => void;
  resetParserState: () => void;
  saveDraftInvoice: (invoice: FormInvoiceType) => void;
}

const useInvoiceParserStore = create<InvoiceParserState>((set) => ({
  parsedInvoice: null,
  isParserLoading: false,
  parserError: null,
  
  setParsedInvoice: (invoice) => set({ parsedInvoice: invoice }),
  setParserLoading: (isLoading) => set({ isParserLoading: isLoading }),
  setParserError: (error) => set({ parserError: error }),
  resetParserState: () => set({ 
    parsedInvoice: null,
    isParserLoading: false,
    parserError: null
  }),
  saveDraftInvoice: (invoice) => {
    try {
      localStorage.setItem('draftInvoice', JSON.stringify(invoice));
    } catch (error) {
      console.error('Failed to save draft invoice:', error);
    }
  }
}));

export default useInvoiceParserStore; 