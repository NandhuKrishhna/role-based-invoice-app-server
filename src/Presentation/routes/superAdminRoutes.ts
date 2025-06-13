import { Router } from "express";
import Container from "typedi";
import { SuperAdminController } from "../controllers/super-admin/superAdminController";


const superAdminRoutes = Router();
const superController = Container.get(SuperAdminController);

superAdminRoutes.post('/create-admin', superController.createAdminHandler);
superAdminRoutes.post('/update-role', superController.updateUserRoleHandler);
superAdminRoutes.delete('/delete-user', superController.deleteUserHandler);
superAdminRoutes.get('/get-all-users', superController.getAllUsersHandler);

export default superAdminRoutes;
