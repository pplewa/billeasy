import {
  FormInvoiceType,
  ParsedInvoiceType,
  ParsedItemType,
  FormItemType,
  CustomInput,
  AddressInfo,
  isValidItemsArray,
} from '../types/invoice';

/**
 * Transformer class to handle conversion between parsed and form invoice data
 */
export class InvoiceTransformer {
  /**
   * Converts a parsed invoice item to a form invoice item
   */
  private static transformParsedItemToFormItem(item: ParsedItemType): FormItemType {
    return {
      ...item,
      id: item.id || crypto.randomUUID(),
      name: item.name || 'Item',
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
      tax: {
        amount: 0,
        amountType: 'percentage',
        taxId: undefined,
        taxName: undefined,
        ...item.tax
      },
      discount: {
        amount: 0,
        amountType: 'percentage',
        discountCode: undefined,
        discountName: undefined,
        ...item.discount
      },
    };
  }

  /**
   * Safely converts a date string or Date object to a Date object
   */
  private static safeParseDate(date: string | Date | null | undefined): Date | null {
    if (!date) return null;
    try {
      return new Date(date);
    } catch {
      return null;
    }
  }

  /**
   * Safely converts a string or number to a number
   */
  private static safeParseNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? null : num;
  }

  /**
   * Transforms custom inputs to the correct format
   */
  private static transformCustomInputs(inputs: unknown): CustomInput[] | null {
    if (!inputs) return null;
    if (Array.isArray(inputs)) {
      return inputs.map((input) => ({
        key: typeof input.key === 'string' ? input.key : null,
        value: typeof input.value === 'string' ? input.value : null,
      }));
    }
    if (typeof inputs === 'object' && inputs !== null) {
      return Object.entries(inputs).map(([key, value]) => ({
        key,
        value: value?.toString() || null,
      }));
    }
    return null;
  }

  /**
   * Transforms an address to the correct format
   */
  private static transformAddress(address: unknown): AddressInfo | null {
    if (!address || typeof address !== 'object') return null;
    const addr = address as Record<string, unknown>;
    return {
      name: typeof addr.name === 'string' ? addr.name : null,
      address: typeof addr.address === 'string' ? addr.address : null,
      city: typeof addr.city === 'string' ? addr.city : null,
      zipCode: typeof addr.zipCode === 'string' ? addr.zipCode : null,
      country: typeof addr.country === 'string' ? addr.country : null,
      email: typeof addr.email === 'string' ? addr.email : null,
      phone: typeof addr.phone === 'string' ? addr.phone : null,
      customInputs: this.transformCustomInputs(addr.customInputs),
    };
  }

  /**
   * Transforms a parsed invoice to a form invoice
   */
  public static transformParsedToForm(parsedInvoice: ParsedInvoiceType): FormInvoiceType {
    const formInvoice: FormInvoiceType = {
      sender: this.transformAddress(parsedInvoice.sender),
      receiver: this.transformAddress(parsedInvoice.receiver),
      details: null,
    };

    if (parsedInvoice.details) {
      formInvoice.details = {
        items: [],
        invoiceNumber: parsedInvoice.details.invoiceNumber || null,
        invoiceDate: this.safeParseDate(parsedInvoice.details.invoiceDate),
        dueDate: this.safeParseDate(parsedInvoice.details.dueDate),
        currency: parsedInvoice.details.currency || null,
        subTotal: this.safeParseNumber(parsedInvoice.details.subTotal),
        totalAmount: this.safeParseNumber(parsedInvoice.details.totalAmount),
        status: parsedInvoice.details.status,
        purchaseOrderNumber: parsedInvoice.details.purchaseOrderNumber,
        paymentInformation: parsedInvoice.details.paymentInformation,
        signature: parsedInvoice.details.signature,
        additionalNotes: parsedInvoice.details.additionalNotes,
        paymentTerms: parsedInvoice.details.paymentTerms,
        invoiceLogo: parsedInvoice.details.invoiceLogo,
      };

      // Transform items if they exist and are valid
      if (parsedInvoice.details.items && isValidItemsArray(parsedInvoice.details.items)) {
        formInvoice.details.items = parsedInvoice.details.items.map((item) =>
          this.transformParsedItemToFormItem(item)
        );
      }
    }

    return formInvoice;
  }

  /**
   * Validates if the transformed form data meets minimum requirements
   */
  public static isValidFormData(formData: FormInvoiceType): boolean {
    return (
      formData !== null &&
      typeof formData === 'object' &&
      (formData.sender !== null || formData.receiver !== null) &&
      (!formData.details ||
        (Array.isArray(formData.details.items) &&
          formData.details.items.every(
            (item) =>
              item &&
              typeof item === 'object' &&
              item.id &&
              item.name &&
              typeof item.quantity === 'number' &&
              typeof item.unitPrice === 'number' &&
              item.tax &&
              item.discount
          )))
    );
  }
}
