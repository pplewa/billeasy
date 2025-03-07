import { z } from "zod";
import { InvoiceSchema, ItemSchema } from "@/lib/schemas-optional";

// Form types with relaxed validation
export type InvoiceType = z.infer<typeof InvoiceSchema>;
export type ItemType = z.infer<typeof ItemSchema>; 