import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IUnitManagerController {
    createUserHandler: RequestHandler;
    updateUserHandler: RequestHandler;
    deleteUserHandler: RequestHandler;
    getAllUsersHandler: RequestHandler;
};

export const IUnitManagerControllerToken = new Token<IUnitManagerController>();