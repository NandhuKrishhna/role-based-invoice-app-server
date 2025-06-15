import { Router } from "express";
import Container from "typedi";
import { AdminController } from "../controllers/adminController";



const adminRouter = Router();
const adminController = Container.get(AdminController);

adminRouter.post('/create-unit-manager', adminController.createAdminHandler);
adminRouter.post('/update-role', adminController.updateUserRoleHandler);
adminRouter.delete('/delete-user', adminController.deleteUserHandler);
adminRouter.get('/get-all-users', adminController.getAllUsersHandler);
adminRouter.post('/create-invoice', adminController.createInVoiceHandler);
adminRouter.get('/get-invoices', adminController.getAllInvoicesHandler);
adminRouter.patch('/update-invoice', adminController.updateInvoiceHandler);
adminRouter.delete('/delete-invoice', adminController.deleteInvoiceHandler);

export default adminRouter;
