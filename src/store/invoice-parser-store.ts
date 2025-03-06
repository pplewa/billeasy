import { create } from 'zustand';
import { InvoiceType } from '@/types';
import { persist } from 'zustand/middleware';

// Interface for draft invoices that includes an ID
interface DraftInvoice extends Partial<InvoiceType> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceParserState {
  // State
  parsedInvoice: Partial<InvoiceType> | null;
  isParserLoading: boolean;
  parserError: string | null;
  draftInvoices: DraftInvoice[];
  
  // Actions
  setParsedInvoice: (invoice: Partial<InvoiceType> | null) => void;
  setParserLoading: (isLoading: boolean) => void;
  setParserError: (error: string | null) => void;
  resetParserState: () => void;
  saveDraftInvoice: (invoice: Partial<InvoiceType>) => string;
  removeDraftInvoice: (invoiceId: string) => void;
  clearDraftInvoices: () => void;
}

/**
 * Store for managing invoice parser state with persistence
 */
const useInvoiceParserStore = create<InvoiceParserState>()(
  persist(
    (set, get) => ({
      // Initial state
      parsedInvoice: null,
      isParserLoading: false,
      parserError: null,
      draftInvoices: [],
      
      // Actions
      setParsedInvoice: (invoice) => set({ parsedInvoice: invoice }),
      setParserLoading: (isLoading) => set({ isParserLoading: isLoading }),
      setParserError: (error) => set({ parserError: error }),
      resetParserState: () => set({ 
        parsedInvoice: null, 
        isParserLoading: false, 
        parserError: null 
      }),
      saveDraftInvoice: (invoice) => {
        const now = new Date().toISOString();
        const draftId = (invoice as any).id || `draft-${Date.now()}`;
        
        const draftInvoice: DraftInvoice = {
          ...invoice,
          id: draftId,
          createdAt: (invoice as any).createdAt || now,
          updatedAt: now
        };
        
        // Check if this draft already exists
        const existingDrafts = get().draftInvoices;
        const existingIndex = existingDrafts.findIndex(draft => draft.id === draftId);
        
        if (existingIndex >= 0) {
          // Update existing draft
          const updatedDrafts = [...existingDrafts];
          updatedDrafts[existingIndex] = draftInvoice;
          set({ draftInvoices: updatedDrafts });
        } else {
          // Add new draft
          set({ draftInvoices: [...existingDrafts, draftInvoice] });
        }
        
        return draftId;
      },
      removeDraftInvoice: (invoiceId) => {
        set({ 
          draftInvoices: get().draftInvoices.filter(draft => draft.id !== invoiceId)
        });
      },
      clearDraftInvoices: () => set({ draftInvoices: [] })
    }),
    {
      name: 'billeasy-invoice-storage',
      // Only include draftInvoices in persistent storage
      partialize: (state) => ({ 
        draftInvoices: state.draftInvoices
      }),
    }
  )
);

export default useInvoiceParserStore; 