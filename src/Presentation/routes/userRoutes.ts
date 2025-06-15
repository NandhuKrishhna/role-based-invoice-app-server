import { Router } from "express";
import Container from "typedi";
import { UserController } from "../controllers/user-controller";




const userRouter = Router();
const userController = Container.get(UserController)
userRouter.post('/create-invoice', userController.createInVoiceHandler);
userRouter.get('/get-invoices', userController.getAllInvoicesHandler);
userRouter.patch('/update-invoice', userController.updateInvoiceHandler);
userRouter.delete('/delete-invoice', userController.deleteInvoiceHandler);


export default userRouter