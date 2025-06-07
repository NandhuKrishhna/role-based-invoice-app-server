
import assert from "node:assert";
import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import AppError from "./AppError";

type AppAssert = (
    condition: any,
    httpsStatusCode: HttpStatusCode,
    message: string,
    appErrorCode?: AppErrorCode
) => asserts  condition;


const appAssert: AppAssert = (
    condition,
    httpsStatusCode,
    message,
    appErrorCode
) => assert(condition, new AppError(httpsStatusCode, message, appErrorCode));

export default appAssert;