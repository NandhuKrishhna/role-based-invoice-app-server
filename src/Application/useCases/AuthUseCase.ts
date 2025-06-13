import { Inject, Service } from "typedi";
import { ILoginUserParams } from "../../Domain/types/user.types";
import appAssert from "../../Shared/utils/appAssert";
import { BAD_REQUEST, UNAUTHORIZED } from "../../Shared/constants/http";
import { ERROR_MESSAGES, STATUS } from "../../Shared/constants/messages";
import { ISessionRepository, ISessionRepositoryToken } from "../../Domain/repositories/ISessionRepository";
import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../../Shared/utils/date";
import { RefreshTokenPayload, refreshTokenSignOptions, signToken } from "../../Infrastructure/services/jwtServices";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import { IUserUseCase, IUserUseCaseToken } from "../../Domain/repositories/IUserUseCase";


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
}
