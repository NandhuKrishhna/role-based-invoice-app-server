import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IAuthController {
    loginHandler: RequestHandler;
};

export const IAuthControllerToken = new Token<IAuthController>();