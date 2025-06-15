// models/Invoice.ts

import mongoose, { Document, Schema, model } from "mongoose";
import Role from "../../../Shared/constants/roles";

export type InvoiceType =
    | "STANDARD"
    | "PROFORMA"
    | "CREDIT"
    | "DEBIT"
    | "RECURRING"
    | "TIMESHEET"
    | "FINAL"
    | "INTERIM"
    | "COMMERCIAL";


export interface IInvoice extends Document {
    invoiceNumber: string;
    invoiceDate: Date;
    invoiceAmount: number;
    type: InvoiceType;
    financialYear: string;
    createdBy: string;
    createdByRole: Role;
    description?: string;
}

const invoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: {
            type: String,
            required: true,
        },

        invoiceDate: {
            type: Date,
            required: true,
        },

        invoiceAmount: {
            type: Number,
            required: true,
            min: [0, "Invoice amount must be greater than zero"],
        },

        type: {
            type: String,
            enum: [
                "STANDARD",
                "PROFORMA",
                "CREDIT",
                "DEBIT",
                "RECURRING",
                "TIMESHEET",
                "FINAL",
                "INTERIM",
                "COMMERCIAL",
            ],
            default: "STANDARD",
        },

        financialYear: {
            type: String,
            required: true,
        },

        createdBy: {
            type: String,
            required: true,
        },

        createdByRole: {
            type: String,
            enum: ["ADMIN", "UNIT_MANAGER", "USER"],
            required: true,
        },

        description: {
            type: String,
            maxlength: 255,
        },
    },
    {
        timestamps: true,
    }
);
invoiceSchema.index({ invoiceNumber: 1, financialYear: 1 }, { unique: true });

const Invoice = model<IInvoice>("Invoice", invoiceSchema);

export default Invoice;
