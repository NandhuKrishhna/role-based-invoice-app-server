import { Inject, Service } from "typedi";
import catchErrors from "../../Shared/utils/catchErrors";
import { Request, Response } from "express";
import { createAdminSchema, createUserManagerSchema } from "./validators/adminScheme";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../Shared/constants/messages";
import { CREATED, OK, UNAUTHORIZED } from "../../Shared/constants/http";
import appAssert from "../../Shared/utils/appAssert";
import { AdminUseCase } from "../../Application/useCases/AdmimUseCase";
import { IAdminController } from "../../Domain/interfaces/IAdminController";
import Role from "../../Shared/constants/roles";
interface IGetAllUsersParams {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    role?: Role;
    createdBy?: string;
}


@Service()
export class AdminController implements IAdminController {
    constructor(@Inject() private __adminUseCase: AdminUseCase) { }

    createAdminHandler = catchErrors(async (req: Request, res: Response) => {
        const request = createUserManagerSchema.parse({
            ...req.body,
        })
        const { userId, role } = req as AuthenticatedRequest;
        const { admin } = await this.__adminUseCase.createAdminService(request, userId);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.UNIT_MANAGER_CREATED,
            response: admin,
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
        const { userId: creatorId } = req as AuthenticatedRequest;
        appAssert(targetUserId, UNAUTHORIZED, ERROR_MESSAGES.TARGET_ID_REQUIRED);
        await this.__adminUseCase.deleteUserService(targetUserId, creatorId);

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_DELETED,
        });
    });


    getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {

        const { user } = req as AuthenticatedRequest
        const { users } = await this.__adminUseCase.getAllUsersService(user, req.query)
        res.status(OK).json({
            success: true,
            message: SUCCESS_MESSAGES.USERS_FETCHED,
            users
        });
    })



}