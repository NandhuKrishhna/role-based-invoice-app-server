import { Inject, Service } from "typedi";
import catchErrors from "../../../Shared/utils/catchErrors";
import { Request, Response } from "express";
import { createAdminSchema } from "../validators/adminScheme";
import { SuperAdminUseCase } from "../../../Application/useCases/SuperAdminUseCase";
import { CREATED, UNAUTHORIZED } from "../../../Shared/constants/http";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../Shared/constants/messages";
import { AuthenticatedRequest } from "../../middlewares/authMiddleware";
import { ISuperAdminController } from "../../../Domain/interfaces/ISuperAdminController";
import appAssert from "../../../Shared/utils/appAssert";

@Service()
export class SuperAdminController implements ISuperAdminController {
    constructor(@Inject() private __superAdminUseCase: SuperAdminUseCase) { }







    createAdminHandler = catchErrors(async (req: Request, res: Response) => {
        const request = createAdminSchema.parse({
            ...req.body,
        })
        const { userId, role } = req as AuthenticatedRequest;
        const { admin } = await this.__superAdminUseCase.createAdminService(request, userId, role);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.ADMIN_CREATED,
            response: admin,
        })
    });

    updateUserRoleHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId } = req as AuthenticatedRequest;
        const { userId: targetUserId, role } = req.body;

        appAssert(targetUserId, UNAUTHORIZED, ERROR_MESSAGES.TARGET_ID_REQUIRED);
        appAssert(role, UNAUTHORIZED, "Role is required");

        const { updatedUser } = await this.__superAdminUseCase.updateUserRoleService({ targetUserId, role, userId });

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_ROLE_UPDATED,
            response: updatedUser
        });
    })

    deleteUserHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId: targetUserId } = req.body;

        appAssert(targetUserId, UNAUTHORIZED, ERROR_MESSAGES.TARGET_ID_REQUIRED);

        const deletedUser = await this.__superAdminUseCase.deleteUserService(targetUserId);

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_DELETED,
            response: deletedUser
        });
    });


    getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId } = req as AuthenticatedRequest;

        appAssert(userId, UNAUTHORIZED, ERROR_MESSAGES.USER_NOT_FOUND);

        const users = await this.__superAdminUseCase.getAllUsersService({ ...req.query });

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USERS_FETCHED,
            ...users
        });
    })
}