import { Router } from "express";
import Container from "typedi";
import { UnitManagerController } from "../controllers/unitManagerController";
import { AdminController } from "../controllers/adminController";



const unitManagerController = Container.get(UnitManagerController);
const adminController = Container.get(AdminController);
const unitManagerRouter = Router();
unitManagerRouter.post('/create-user', unitManagerController.createUserHandler);
unitManagerRouter.get('/get-all-users', unitManagerController.getAllUsersHandler);
unitManagerRouter.patch('/update-user', unitManagerController.updateUserHandler);
unitManagerRouter.delete('/delete-user', unitManagerController.deleteUserHandler);
unitManagerRouter.post('/create-invoice', adminController.createInVoiceHandler);
unitManagerRouter.delete('/delete-invoice', adminController.deleteInvoiceHandler);
unitManagerRouter.patch('/update-invoice', adminController.updateInvoiceHandler);
unitManagerRouter.get('/get-invoice', adminController.getAllInvoicesHandler);



export default unitManagerRouter;
