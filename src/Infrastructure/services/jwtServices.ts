import mongoose from "mongoose";
import { SignOptions, VerifyOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../../Shared/constants/env";

import { TOKEN_EXPIRATION } from "../../Shared/constants/config";
import Role from "../../Shared/constants/roles";




export type RefreshTokenPayload = { sessionId: mongoose.Types.ObjectId, role: Role };
export type AccessTokenPayload = { userId: string; sessionId: mongoose.Types.ObjectId, role: Role };

type SignOptionsAndSecret = SignOptions & { secret: string };
const defaults: SignOptions = { audience: ["user"] };

export const accessTokenOptions: SignOptionsAndSecret = { expiresIn: TOKEN_EXPIRATION.ACCESS, secret: JWT_SECRET };
export const refreshTokenSignOptions: SignOptionsAndSecret = { expiresIn: TOKEN_EXPIRATION.REFRESH, secret: JWT_REFRESH_SECRET };


export const signToken = (payload: AccessTokenPayload | RefreshTokenPayload, options?: SignOptionsAndSecret) => {
    const { secret, ...signOpts } = options || accessTokenOptions;
    return jwt.sign(payload, secret, { ...defaults, ...signOpts });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(token: string, options?: VerifyOptions & { secret: string }) => {
    const { secret = JWT_SECRET, ...verifyOpts } = options || {};
    try {
        const payload = jwt.verify(token, secret, { ...defaults, ...verifyOpts }) as TPayload;
        return { payload };
    } catch (error: any) {
        return { error: error.message };
    }
};

