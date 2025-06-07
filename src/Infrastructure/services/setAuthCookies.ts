import { Response } from "express";
import { CookieOptions } from "express"
import { NODE_ENV } from "../../Shared/constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "../../Shared/utils/date";
import { ENVIRONMENTS, TOKENS } from "../../Shared/constants/config";
const secure = NODE_ENV === "production";
export const REFRESH_PATH = "/api/auth/refresh";
//TODO : fill domain in production
const defaults: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === ENVIRONMENTS.PRODUCTION,
  sameSite: NODE_ENV === ENVIRONMENTS.PRODUCTION ? "none" : "strict",
  domain: NODE_ENV === ENVIRONMENTS.PRODUCTION ? "" : undefined
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow()
})

export const generateRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: REFRESH_PATH
})

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params): Response => {
  return res
    .cookie(TOKENS.ACCESS, accessToken, getAccessTokenCookieOptions())
    .cookie(TOKENS.REFRESH, refreshToken, generateRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) =>
  res.clearCookie(TOKENS.ACCESS).clearCookie(TOKENS.REFRESH, {
    path: REFRESH_PATH
  });


