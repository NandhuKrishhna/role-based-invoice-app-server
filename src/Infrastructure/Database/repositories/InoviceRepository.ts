import { Service } from "typedi";
import { IInvoiceRepository, IInvoiceRepositoryToken } from "../../../Domain/repositories/IInvoiceRepository";
import Invoice, { IInvoice } from "../Models/invoice.model";
import { Types } from "mongoose";
import { InvoiceQueryParams } from "../../../Domain/types/invoice.types";



@Service(IInvoiceRepositoryToken)
export class InvoiceRepository implements IInvoiceRepository {
    async createInvoice(invoice: Partial<IInvoice>): Promise<IInvoice> {
        const createdInvoice = await Invoice.create(invoice);
        return createdInvoice;
    }
    async findByIdAndDelete(id: Types.ObjectId): Promise<void> {
        await Invoice.findByIdAndDelete(id).exec();
    }

    async updateInvoice(id: Types.ObjectId, updates: Partial<IInvoice>): Promise<IInvoice | null> {
        return await Invoice.findByIdAndUpdate(
            id,
            {
                $set: {
                    invoiceNumber: updates.invoiceNumber,
                    invoiceDate: updates.invoiceDate,
                    invoiceAmount: updates.invoiceAmount,
                    type: updates.type,
                    description: updates.description,
                },
            },
            { new: true }
        ).lean().exec();
    }

    async findByInvoiceNumberAndFY(invoiceNumber: string, fy: string): Promise<IInvoice | null> {
        return await Invoice.findOne({ invoiceNumber, financialYear: fy }).exec();
    }
    async findInvoicesByFYSorted(financialYear: string): Promise<IInvoice[]> {
        const invoices = await Invoice.find({ financialYear }).lean().exec();

        return invoices.sort(
            (a, b) => parseInt(a.invoiceNumber, 10) - parseInt(b.invoiceNumber, 10)
        );
    }
    async findAllInvoicesForUsers(
        userIds: string[],
        queryParams: InvoiceQueryParams
    ): Promise<{
        data: IInvoice[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'invoiceDate',
            sortOrder = 'desc',
            search,
            type,
            fromDate,
            toDate,
            createdByRole,
        } = queryParams;

        const filter: any = {
            createdBy: { $in: userIds },
        };

        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (type) {
            filter.type = type;
        }

        if (createdByRole) {
            filter.createdByRole = createdByRole;
        }

        if (fromDate || toDate) {
            filter.invoiceDate = {};
            if (fromDate) filter.invoiceDate.$gte = new Date(fromDate);
            if (toDate) filter.invoiceDate.$lte = new Date(toDate);
        }

        const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const total = await Invoice.countDocuments(filter);

        const data = await Invoice.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findAllInvoicesForAdmins(): Promise<IInvoice[]> {
        return await Invoice.find({}).lean().exec();
    }
    async findAllInvoicesForUnitManager(): Promise<IInvoice[]> {
        return await Invoice.find({}).lean().exec();
    }
    async findInvoiceById(id: Types.ObjectId): Promise<IInvoice | null> {
        return await Invoice.findById(id).lean().exec();
    }
    async deleteInvoiceById(id: Types.ObjectId): Promise<IInvoice | null> {
        return await Invoice.findByIdAndDelete(id).exec();
    }



}
