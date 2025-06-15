import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import catchErrors from "../../Shared/utils/catchErrors";
import { FORBIDDEN, UNAUTHORIZED } from "../../Shared/constants/http";
import AppErrorCode from "../../Shared/constants/appErrorCode";
import appAssert from "../../Shared/utils/appAssert";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";


const authorizeRoles = (requiredRoles: string[]): RequestHandler =>
  catchErrors(async (req: Request, res: Response, next: NextFunction) => {
    console.log("This if from authorizeRoles middleware", requiredRoles)
    const { role } = req as AuthenticatedRequest;
    console.log("Role in authorizeRoles middleware:", role);
    console.log("Required roles in authorizeRoles middleware:", requiredRoles);
    appAssert(
      role,
      UNAUTHORIZED,
      ERROR_MESSAGES.USER_NOT_FOUND,
      AppErrorCode.MissingRole
    );

    appAssert(
      requiredRoles.includes(role),
      FORBIDDEN,
      ERROR_MESSAGES.NOT_AUTHORIZED,
      AppErrorCode.InsufficientPermission
    );

    next();
  });

export default authorizeRoles;