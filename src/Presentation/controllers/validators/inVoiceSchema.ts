import { z } from "zod";
export const invoiceTypes = [
    "STANDARD",
    "PROFORMA",
    "CREDIT",
    "DEBIT",
    "RECURRING",
    "TIMESHEET",
    "FINAL",
    "INTERIM",
    "COMMERCIAL",
] as const;
export const userRoles = ["ADMIN", "UNIT_MANAGER", "USER"] as const;
export const invoiceSchema = z.object({
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    invoiceDate: z.coerce.date({ invalid_type_error: "Invalid date format" }),
    invoiceAmount: z
        .number({ invalid_type_error: "Invoice amount must be a number" })
        .min(0, "Invoice amount must be greater than or equal to zero"),
    type: z.enum(invoiceTypes).default("STANDARD"),
    description: z.string().max(255).optional(),
});


export const updateInvoiceSchema = invoiceSchema.partial().extend({
    _id: z.string().min(1, " Invoice id is required"),
});