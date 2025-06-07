import { Inject, Service } from "typedi";
import { IAdminDataParams, IUpdateUserRoleParams } from "../../Domain/types/admin.types";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import appAssert from "../../Shared/utils/appAssert";
import { CONFLICT } from "../../Shared/constants/http";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";
import mongoose from "mongoose";
import Role from "../../Shared/constants/roles";

@Service()
export class SuperAdminUseCase {
    constructor(
        @Inject(IUserRepositoryToken) private __userRepository: IUserRepository
    ) { }
    async createAdminService(adminData: IAdminDataParams, userId: mongoose.Types.ObjectId): Promise<any> {
        const isAdminExists = await this.__userRepository.findUserByEmail(adminData.email);
        appAssert(!isAdminExists, CONFLICT, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);

        const admin = await this.__userRepository.createAdmin({
            name: adminData.name,
            email: adminData.email,
            password: adminData.password,
            role: adminData.role,
            group: adminData.group,
            createdBy: userId
        })
        return {
            admin: admin.omitPassword(),
        }
    }


    async updateUserRoleService({ targetUserId, role, userId }: IUpdateUserRoleParams): Promise<any> {
        const isSuperAdmin = await this.__userRepository.findUserById(userId);
        appAssert(isSuperAdmin?.role === Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.NOT_AUTHORIZED);
        const isTargetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(isTargetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);

        appAssert(isTargetUser.role !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);

        const updatedUser = await this.__userRepository.updateUserRole(targetUserId, role);
        return {
            updatedUser: updatedUser.omitPassword(),
        }
    }
}