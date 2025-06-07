import { Inject, Service } from "typedi";
import { AuthUseCase } from "../../../Application/useCases/AuthUseCase";
import { IAuthController } from "../../../Domain/interfaces/IAuthController";
import { Request, Response } from "express";
import catchErrors from "../../../Shared/utils/catchErrors";
import { loginUserSchema } from "../validators/loginUserSchema";
import { SUCCESS_MESSAGES } from "../../../Shared/constants/messages";
import { setAuthCookies } from "../../../Infrastructure/services/setAuthCookies";
import { OK } from "../../../Shared/constants/http";




@Service()
export class AuthController implements IAuthController {
    constructor(@Inject() private __authService: AuthUseCase) { }

    loginHandler = catchErrors(async (req: Request, res: Response) => {

        const request = loginUserSchema.parse({
            ...req.body,
            userAgent: req.headers["user-agent"],
        });
        const { accessToken, refreshToken, user } = await this.__authService.loginUserService(request);
        return setAuthCookies({ res, accessToken, refreshToken })
            .status(OK)
            .json({
                message: SUCCESS_MESSAGES.USER_LOGGED_IN,
                response: { ...user, accessToken },
            });
    });



}