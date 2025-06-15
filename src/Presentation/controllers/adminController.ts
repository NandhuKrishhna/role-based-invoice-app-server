import { Inject, Service } from "typedi";
import catchErrors from "../../Shared/utils/catchErrors";
import { Request, Response } from "express";
import { createAdminSchema, createUserManagerSchema } from "./validators/adminScheme";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../Shared/constants/messages";
import { CREATED, OK, UNAUTHORIZED } from "../../Shared/constants/http";
import appAssert from "../../Shared/utils/appAssert";
import { AdminUseCase } from "../../Application/useCases/AdminUseCase";
import { IAdminController } from "../../Domain/interfaces/IAdminController";
import Role from "../../Shared/constants/roles";
import { invoiceSchema, updateInvoiceSchema } from "./validators/inVoiceSchema";


@Service()
export class AdminController implements IAdminController {
    constructor(@Inject() private __adminUseCase: AdminUseCase) { }

    createAdminHandler = catchErrors(async (req: Request, res: Response) => {
        const request = createUserManagerSchema.parse({
            ...req.body,
        })
        const { userId } = req as AuthenticatedRequest;
        const { user } = await this.__adminUseCase.createAdminService(request, userId);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.UNIT_MANAGER_CREATED,
            response: user,
        })
    });

    updateUserRoleHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId } = req as AuthenticatedRequest;
        const { userId: targetUserId, role } = req.body;

        appAssert(targetUserId, UNAUTHORIZED, ERROR_MESSAGES.TARGET_ID_REQUIRED);
        appAssert(role, UNAUTHORIZED, "Role is required");

        const { updatedUser } = await this.__adminUseCase.updateUserRoleService({ targetUserId, role, userId });

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_ROLE_UPDATED,
            response: updatedUser
        });
    })

    deleteUserHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId: targetUserId } = req.body;
        const { userId: creatorId, role } = req as AuthenticatedRequest;
        appAssert(targetUserId, UNAUTHORIZED, ERROR_MESSAGES.TARGET_ID_REQUIRED);
        await this.__adminUseCase.deleteUserService(targetUserId, creatorId, role);

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_DELETED,
        });
    });


    getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {

        const { user } = req as AuthenticatedRequest
        console.log(user)
        const { users } = await this.__adminUseCase.getAllUsersService(user, req.query)
        res.status(OK).json({
            success: true,
            message: SUCCESS_MESSAGES.USERS_FETCHED,
            ...users
        });
    })

    createInVoiceHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId, role } = req as AuthenticatedRequest;
        const invoice = invoiceSchema.parse({
            ...req.body
        })

        const response = await this.__adminUseCase.createInvoiceService(invoice, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_CREATED,
            response
        })
    })

    getAllInvoicesHandler = catchErrors(async (req: Request, res: Response) => {
        const { user, role } = req as AuthenticatedRequest;
        const response = await this.__adminUseCase.getUserHierarchyInvoices(user, req.query);
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
        const response = await this.__adminUseCase.updateInvoiceService(invoice, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_UPDATED,
            response
        })
    })

    deleteInvoiceHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId, role } = req as AuthenticatedRequest;
        const { invoiceId } = req.body;
        const response = await this.__adminUseCase.deleteInvoiceService(invoiceId, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.INVOICE_DELETED,
            response
        })
    })


}