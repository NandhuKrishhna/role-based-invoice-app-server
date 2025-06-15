import { Token } from "typedi";
import mongoose, { Types } from "mongoose";
import { IInvoice } from "../../Infrastructure/Database/Models/invoice.model";
import { InvoiceQueryParams } from "../types/invoice.types";
import Role from "../../Shared/constants/roles";

export interface IInvoiceRepository {
    createInvoice(invoice: Partial<IInvoice>): Promise<IInvoice>;
    findByIdAndDelete(id: mongoose.Types.ObjectId): Promise<void>;
    findAllInvoicesForUsers(
        userIds: string[],
        queryParams: InvoiceQueryParams
    ): Promise<{
        data: IInvoice[];
        total: number;
        page: number;
        totalPages: number;
    }>
    updateInvoice(id: mongoose.Types.ObjectId, updates: Partial<IInvoice>): Promise<IInvoice | null>;
    findByInvoiceNumberAndFY(invoiceNumber: string, fy: string): Promise<IInvoice | null>;
    findInvoicesByFYSorted(fy: string): Promise<IInvoice[]>;
    findInvoiceById(id: mongoose.Types.ObjectId): Promise<IInvoice | null>;
    updateInvoice(id: Types.ObjectId, updates: Partial<IInvoice>): Promise<IInvoice | null>
    deleteInvoiceById(id: Types.ObjectId): Promise<IInvoice | null>


}

export const IInvoiceRepositoryToken = new Token<IInvoiceRepository>();
