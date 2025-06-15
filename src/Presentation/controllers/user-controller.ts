import { Inject, Service } from "typedi";
import { IUserController } from "../../Domain/interfaces/IUserController";
import catchErrors from "../../Shared/utils/catchErrors";
import { invoiceSchema, updateInvoiceSchema } from "./validators/inVoiceSchema";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { CREATED, OK } from "../../Shared/constants/http";
import { SUCCESS_MESSAGES } from "../../Shared/constants/messages";
import { Request, Response } from "express";
import { AdminUseCase } from "../../Application/useCases/AdminUseCase";


@Service()
export class UserController implements IUserController {
    constructor(@Inject() private __userUseCase: AdminUseCase) { }


    createInVoiceHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId, role } = req as AuthenticatedRequest;
        const invoice = invoiceSchema.parse({
            ...req.body
        })

        const response = await this.__userUseCase.createInvoiceService(invoice, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_CREATED,
            response
        })
    })

    getAllInvoicesHandler = catchErrors(async (req: Request, res: Response) => {
        const { user, role } = req as AuthenticatedRequest;
        const response = await this.__userUseCase.getUserHierarchyInvoices(user, req.query);
        res.status(OK).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_FETCHED,
            response
        })
    })

    updateInvoiceHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId, role } = req as AuthenticatedRequest;
        const invoice = updateInvoiceSchema.parse({
            ...req.body
        })
        const response = await this.__userUseCase.updateInvoiceService(invoice, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_UPDATED,
            response
        })
    })

    deleteInvoiceHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId, role } = req as AuthenticatedRequest;
        const { invoiceId } = req.body;
        const response = await this.__userUseCase.deleteInvoiceService(invoiceId, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_DELETED,
            response
        })
    })


}