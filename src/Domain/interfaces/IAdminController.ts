import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IAdminController {
    createAdminHandler: RequestHandler;
    updateUserRoleHandler: RequestHandler;
    deleteUserHandler: RequestHandler;
    getAllUsersHandler: RequestHandler;
    createInVoiceHandler: RequestHandler
};

export const IAdminControllerToken = new Token<IAdminController>();