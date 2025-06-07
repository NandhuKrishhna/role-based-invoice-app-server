import { RequestHandler } from "express";
import { Token } from "typedi";

export interface ISuperAdminController {
    createAdminHandler: RequestHandler;
};

export const ISuperAdminControllerToken = new Token<ISuperAdminController>();