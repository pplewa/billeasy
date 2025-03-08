import { create } from 'zustand';
import { FormInvoiceType, ParsedInvoiceType } from '@/lib/types/invoice';

interface DraftInvoice extends FormInvoiceType {
  id: string;
  createdAt: string;
}

interface InvoiceParserState {
  parsedInvoice: ParsedInvoiceType | null;
  isParserLoading: boolean;
  parserError: string | null;
  draftInvoices: DraftInvoice[];

  // Actions
  setParsedInvoice: (invoice: ParsedInvoiceType | null) => void;
  setParserLoading: (isLoading: boolean) => void;
  setParserError: (error: string | null) => void;
  resetParserState: () => void;
  saveDraftInvoice: (invoice: FormInvoiceType) => void;
  removeDraftInvoice: (id: string) => void;
}

const useInvoiceParserStore = create<InvoiceParserState>((set, get) => ({
  parsedInvoice: null,
  isParserLoading: false,
  parserError: null,
  draftInvoices: [],

  setParsedInvoice: (invoice) => set({ parsedInvoice: invoice }),
  setParserLoading: (isLoading) => set({ isParserLoading: isLoading }),
  setParserError: (error) => set({ parserError: error }),
  resetParserState: () =>
    set({
      parsedInvoice: null,
      isParserLoading: false,
      parserError: null,
    }),
  saveDraftInvoice: (invoice) => {
    try {
      const id = crypto.randomUUID();
      const draftInvoice: DraftInvoice = {
        ...invoice,
        id,
        createdAt: new Date().toISOString(),
      };
      const draftInvoices = [...get().draftInvoices, draftInvoice];
      set({ draftInvoices });
      localStorage.setItem('draftInvoices', JSON.stringify(draftInvoices));
    } catch (error) {
      console.error('Failed to save draft invoice:', error);
    }
  },
  removeDraftInvoice: (id) => {
    try {
      const draftInvoices = get().draftInvoices.filter((draft) => draft.id !== id);
      set({ draftInvoices });
      localStorage.setItem('draftInvoices', JSON.stringify(draftInvoices));
    } catch (error) {
      console.error('Failed to remove draft invoice:', error);
    }
  },
}));

// Initialize draftInvoices from localStorage
if (typeof window !== 'undefined') {
  try {
    const storedDraftInvoices = localStorage.getItem('draftInvoices');
    if (storedDraftInvoices) {
      const draftInvoices = JSON.parse(storedDraftInvoices);
      useInvoiceParserStore.setState({ draftInvoices });
    }
  } catch (error) {
    console.error('Failed to load draft invoices:', error);
  }
}

export default useInvoiceParserStore;
