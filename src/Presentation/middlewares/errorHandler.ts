import { ErrorRequestHandler, Response, Request, NextFunction } from "express";
import { z } from "zod";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../../Shared/constants/http";
import AppError from "../../Shared/utils/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../../Infrastructure/services/setAuthCookies";
import { ENVIRONMENTS } from "../../Shared/constants/config";
import { ERROR_MESSAGES, STATUS } from "../../Shared/constants/messages";

const handleZodError = (res: Response, error: z.ZodError): void => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  res.status(BAD_REQUEST).json({
    status: STATUS.FAIL,
    message: ERROR_MESSAGES.VALIDATION_ERROR,
    errors,
    timestamp: new Date().toISOString(),
  });
};

const handleAppError = (res: Response, error: AppError): void => {
  res.status(error.statusCode).json({
    status: STATUS.ERROR,
    message: error.message,
    errorCode: error.errorCode,
    timestamp: new Date().toISOString(),
  });
};

const errorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers,
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== ENVIRONMENTS.PRODUCTION ? error.stack : undefined,
    },
  };

  console.error("Error : ", errorDetails);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
    return;
  }

  res.status(INTERNAL_SERVER_ERROR).json({
    status: STATUS.ERROR,
    message: ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
