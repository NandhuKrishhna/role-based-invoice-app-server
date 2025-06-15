import { Inject, Service } from "typedi";
import { ILoginUserParams } from "../../Domain/types/user.types";
import appAssert from "../../Shared/utils/appAssert";
import { BAD_REQUEST, UNAUTHORIZED } from "../../Shared/constants/http";
import { ERROR_MESSAGES, STATUS } from "../../Shared/constants/messages";
import { ISessionRepository, ISessionRepositoryToken } from "../../Domain/repositories/ISessionRepository";
import { ONE_DAY_MS, thirtyDaysFromNow } from "../../Shared/utils/date";
import { AccessTokenPayload, RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from "../../Infrastructure/services/jwtServices";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import { IUserUseCase } from "../../Domain/repositories/IUserUseCase";


@Service()
export class AuthUseCase implements IUserUseCase {
    constructor(
        @Inject(IUserRepositoryToken) private __userRepository: IUserRepository,
        @Inject(ISessionRepositoryToken) private __sessionRepository: ISessionRepository
    ) { }
    //TODO - change the return type to a more specific type
    async loginUserService(userData: ILoginUserParams): Promise<any> {
        const existingUser = await this.__userRepository.findUserByEmail(userData.email);
        appAssert(existingUser, BAD_REQUEST, ERROR_MESSAGES.INVALID_CREDENTIALS);
        appAssert(existingUser?.status !== STATUS.BLOCKED, UNAUTHORIZED, ERROR_MESSAGES.ACCOUNT_BANNED);
        const isValid = await existingUser.comparePassword(userData.password);
        appAssert(isValid, UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);

        const newSession = await this.__sessionRepository.createSession({
            userId: existingUser._id,
            role: existingUser.role,
            expiresAt: thirtyDaysFromNow(),
            createdAt: new Date(),
            userAgent: userData.userAgent
        });
        const sessionInfo: RefreshTokenPayload = {
            sessionId: newSession._id!,
            role: newSession.role,
        };
        const accessToken = signToken({
            ...sessionInfo,
            userId: existingUser._id,
            role: existingUser.role,
        });
        const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
        return {
            user: existingUser.omitPassword(),
            accessToken,
            refreshToken,
        };
    }
    async setRefreshToken(refreshToken: string) {
        const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
            secret: refreshTokenSignOptions.secret,
        });
        appAssert(payload, UNAUTHORIZED, "Invalid refresh token");
        const session = await this.__sessionRepository.findById(payload.sessionId);
        appAssert(session?.role === payload.role, UNAUTHORIZED, "UnAuthorized! Please Login Again");
        appAssert(session && session.expiresAt.getTime() > Date.now(), UNAUTHORIZED, "Session expired");
        const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS;
        if (sessionNeedsRefresh) {
            await this.__sessionRepository.updateSession(session._id!, {
                expiresAt: thirtyDaysFromNow(),
            });
        }

        const newRefreshToken = sessionNeedsRefresh
            ? signToken(
                {
                    sessionId: session._id!,
                    role: payload.role,
                },
                refreshTokenSignOptions
            )
            : refreshToken;
        const accessToken = signToken({
            userId: session.userId,
            sessionId: session._id!,
            role: session.role,
        });
        return {
            accessToken,
            newRefreshToken,
        };
    }
    async logoutUser(payload: AccessTokenPayload) {
        await this.__sessionRepository.findByIdAndDelete(payload.sessionId);
    }
}
