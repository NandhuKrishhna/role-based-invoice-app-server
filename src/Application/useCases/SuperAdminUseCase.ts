import { Inject, Service } from "typedi";
import { IAdminDataParams, IGetAllUsersParams, IUpdateUserRoleParams } from "../../Domain/types/admin.types";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import appAssert from "../../Shared/utils/appAssert";
import { CONFLICT } from "../../Shared/constants/http";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";
import Role from "../../Shared/constants/roles";
import generateUserId from "../../Infrastructure/Database/repositories/CounterSchema";

@Service()
export class SuperAdminUseCase {
    constructor(
        @Inject(IUserRepositoryToken) private __userRepository: IUserRepository
    ) { }
    async createAdminService(adminData: IAdminDataParams, userId: string, creatorRole: string): Promise<any> {
        const isAdminExists = await this.__userRepository.findUserByEmail(adminData.email);
        appAssert(!isAdminExists, CONFLICT, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
        appAssert(adminData.role === Role.ADMIN, CONFLICT, ERROR_MESSAGES.CAN_ONLY_CREATE_ADMINS);
        const generatedId = await generateUserId(adminData.role as Role);
        const admin = await this.__userRepository.createUser({
            _id: generatedId,
            name: adminData.name,
            email: adminData.email,
            password: adminData.password,
            role: adminData.role,
            group: adminData.group,
            createdBy: userId
        });
        appAssert(admin, CONFLICT, ERROR_MESSAGES.ADMIN_CREATION_FAILED);
        return {
            admin: admin.omitPassword(),
        }
    }


    async updateUserRoleService({ targetUserId, role, userId }: IUpdateUserRoleParams): Promise<any> {

        const isTargetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(isTargetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(isTargetUser.role !== Role.ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
        const updatedUser = await this.__userRepository.updateUserRole(targetUserId, role);
        return {
            updatedUser: updatedUser.omitPassword(),
        }
    }

    async deleteUserService(targetUserId: string): Promise<void> {
        const user = await this.__userRepository.findUserById(targetUserId);
        appAssert(user, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(user.role !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_DELETE_SUPER_ADMIN);
        await this.__userRepository.deleteUserById(targetUserId);
    };

    async getAllUsersService(filterOptions: IGetAllUsersParams): Promise<any> {
        const users = await this.__userRepository.getAllUsers(filterOptions);
        return users;

    }




}