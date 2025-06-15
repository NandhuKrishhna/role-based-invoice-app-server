import { Inject, Service } from "typedi";
import { AuthUseCase } from "../../../Application/useCases/AuthUseCase";
import { IAuthController } from "../../../Domain/interfaces/IAuthController";
import { Request, Response } from "express";
import catchErrors from "../../../Shared/utils/catchErrors";
import { loginUserSchema } from "../validators/loginUserSchema";
import { SUCCESS_MESSAGES } from "../../../Shared/constants/messages";
import { clearAuthCookies, generateRefreshTokenCookieOptions, getAccessTokenCookieOptions, setAuthCookies } from "../../../Infrastructure/services/setAuthCookies";
import { OK, UNAUTHORIZED } from "../../../Shared/constants/http";
import appAssert from "../../../Shared/utils/appAssert";
import { verifyToken } from "../../../Infrastructure/services/jwtServices";




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
    refreshHandler = catchErrors(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken as string | undefined;
        appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token, please log in again");
        const { accessToken, newRefreshToken } = await this.__authService.setRefreshToken(refreshToken);
        if (newRefreshToken) {
            res.cookie("refreshToken", newRefreshToken, generateRefreshTokenCookieOptions());
        }
        return res.status(OK).cookie("accessToken", accessToken, getAccessTokenCookieOptions()).json({
            message: "Access token refreshed",
            accessToken,
        });
    });
    logoutHandler = catchErrors(async (req: Request, res: Response) => {
        const accessToken = req.cookies.accessToken as string | undefined;
        const { payload } = verifyToken(accessToken || "");
        if (payload) {
            await this.__authService.logoutUser(payload);
        }
        return clearAuthCookies(res).status(OK).json({
            message: "Logout successful",
        });
    });





}