import mongoose from "mongoose";
import Role from "../../Shared/constants/roles";

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

export interface Invoice {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    type: InvoiceType;
    financialYear: string;
    createdByRole: Role
    description?: string;
    createdBy: string;
}

export type InvoiceInput = {
    invoiceNumber: string;
    invoiceDate: string | Date;
    invoiceAmount: number;
    type?: InvoiceType
    description?: string;
};

export type UpdateInvoiceParams = {
    _id: string
    invoiceNumber: string;
    invoiceDate: string | Date;
    invoiceAmount: number;
    type?: InvoiceType
    description?: string;
};
export type InvoiceQueryParams = {
    page?: number;
    limit?: number;
    sortBy?: 'invoiceDate' | 'invoiceAmount';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    type?: InvoiceType;
    fromDate?: string;
    toDate?: string;
    createdByRole?: Role
};
