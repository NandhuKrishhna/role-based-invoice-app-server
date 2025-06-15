import { RequestHandler } from "express";
import { Token } from "typedi";

export interface IUserController {
    createInVoiceHandler: RequestHandler
    getAllInvoicesHandler: RequestHandler
    updateInvoiceHandler: RequestHandler
    deleteInvoiceHandler: RequestHandler
};

export const IUserControllerToken = new Token<IUserController>();