import { Router } from "express";
import Container from "typedi";
import { AuthController } from "../controllers/auth-controller/auth-controller";



const authRouter = Router();
const authController = Container.get(AuthController);

authRouter.post("/login", authController.loginHandler);
authRouter.get("/refresh", authController.refreshHandler);
authRouter.get("/logout", authController.logoutHandler);

export default authRouter;
