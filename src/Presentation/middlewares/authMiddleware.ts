import mongoose from "mongoose";
import Role from "../../Shared/constants/roles";
import { NextFunction, Request, RequestHandler, Response } from "express";
import catchErrors from "../../Shared/utils/catchErrors";
import AppErrorCode from "../../Shared/constants/appErrorCode";
import { UNAUTHORIZED } from "../../Shared/constants/http";
import appAssert from "../../Shared/utils/appAssert";
import { verifyToken } from "../../Infrastructure/services/jwtServices";
import { UserModel } from "../../Infrastructure/Database/Models/usermodel";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";


export interface AuthenticatedRequest extends Request {
  userId: string;
  sessionId: mongoose.Types.ObjectId;
  role: Role;
  user?: any;
}

const authenticate: RequestHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(accessToken, UNAUTHORIZED, ERROR_MESSAGES.NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);

  const { error, payload } = verifyToken(accessToken);

  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  (req as AuthenticatedRequest).userId = payload.userId;
  (req as AuthenticatedRequest).sessionId = payload.sessionId;
  (req as AuthenticatedRequest).role = payload.role;

  const user = await UserModel.findOne({ _id: payload.userId })
    .select("-password -__v")
  appAssert(user, UNAUTHORIZED, ERROR_MESSAGES.USER_NOT_FOUND, AppErrorCode.UserNotFound);

  (req as AuthenticatedRequest).user = user;
  next();
});

export default authenticate;
