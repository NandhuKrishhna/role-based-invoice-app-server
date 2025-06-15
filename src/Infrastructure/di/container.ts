import "reflect-metadata";
import { Container } from "typedi";
import { IAuthControllerToken } from "../../Domain/interfaces/IAuthController";
import { AuthController } from "../../Presentation/controllers/auth-controller/auth-controller";
import { IUserUseCaseToken } from "../../Domain/repositories/IUserUseCase";
import { AuthUseCase } from "../../Application/useCases/AuthUseCase";
import { IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import { UserRepository } from "../Database/repositories/user.repository";
import { SessionRepository } from "../Database/repositories/SessionRepository";
import { ISessionRepositoryToken } from "../../Domain/repositories/ISessionRepository";
import { SuperAdminController } from "../../Presentation/controllers/super-admin/superAdminController";
import { ISuperAdminControllerToken } from "../../Domain/interfaces/ISuperAdminController";
import { IAdminControllerToken } from "../../Domain/interfaces/IAdminController";
import { AdminController } from "../../Presentation/controllers/adminController";
import { IInvoiceRepositoryToken } from "../../Domain/repositories/IInvoiceRepository";
import { InvoiceRepository } from "../Database/repositories/InoviceRepository";
import { IUnitManagerControllerToken } from "../../Domain/interfaces/IUnitManagerController";
import { UnitManagerController } from "../../Presentation/controllers/unitManagerController";

Container.set(IUserRepositoryToken, new UserRepository());
Container.set(ISessionRepositoryToken, new SessionRepository());
Container.set(IAuthControllerToken, Container.get(AuthController));
Container.set(IUserUseCaseToken, Container.get(AuthUseCase));
Container.set(ISuperAdminControllerToken, Container.get(SuperAdminController));
Container.set(IAdminControllerToken, Container.get(AdminController));
Container.set(IInvoiceRepositoryToken, new InvoiceRepository())
Container.set(IUnitManagerControllerToken, Container.get(UnitManagerController))