import { Inject, Service } from "typedi";
import catchErrors from "../../Shared/utils/catchErrors";
import { Request, Response } from "express";
import { createUserManagerSchema } from "./validators/adminScheme";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../Shared/constants/messages";
import { CREATED, OK, UNAUTHORIZED } from "../../Shared/constants/http";
import appAssert from "../../Shared/utils/appAssert";
import { UnitManagerUseCase } from "../../Application/useCases/AdminUseCase";
import { IUnitManagerController } from "../../Domain/interfaces/IUnitManagerController";


@Service()
export class UnitManagerController implements IUnitManagerController {
    constructor(@Inject() private __unitManagerUseCase: UnitManagerUseCase) { }

    createUserHandler = catchErrors(async (req: Request, res: Response) => {
        const request = createUserManagerSchema.parse({
            ...req.body,
        })
        const { userId } = req as AuthenticatedRequest;
        const { user } = await this.__unitManagerUseCase.createUserService(request, userId);
        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_CREATED,
            response: user,
        })
    });

    updateUserHandler = catchErrors(async (req: Request, res: Response) => {
        const { userId } = req as AuthenticatedRequest;
        const { userId: targetUserId, role } = req.body;

        appAssert(targetUserId, UNAUTHORIZED, ERROR_MESSAGES.TARGET_ID_REQUIRED);
        appAssert(role, UNAUTHORIZED, "Role is required");

        const { updatedUser } = await this.__unitManagerUseCase.updateUserService({ targetUserId, role, userId });

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
        await this.__unitManagerUseCase.deleteUserService(targetUserId, creatorId);

        res.status(CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_DELETED,
        });
    });


    getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {

        const { user } = req as AuthenticatedRequest
        const { users } = await this.__unitManagerUseCase.getAllUsersService(user, req.query)
        res.status(OK).json({
            success: true,
            message: SUCCESS_MESSAGES.USERS_FETCHED,
            users
        });
    })



}