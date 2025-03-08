/**
 * Schemas index file that exports all schema components
 */

// Base utilities
export * from './base';

// Component schemas
export * from './components';

// Item schema and utilities
export * from './item';

// Main invoice schema and utilities
export * from './invoice';

// For backward compatibility with code that uses the old schemas
export { InvoiceSchema as InvoiceSchemaUnified } from './invoice';

export { ItemSchema as ItemSchemaUnified } from './item';

// Optional schemas (less strict) for backward compatibility
// These are aliased to the main schemas since we've made them permissive by default
export { InvoiceSchema as InvoiceSchemaOptional } from './invoice';

export { ItemSchema as ItemSchemaOptional } from './item';
