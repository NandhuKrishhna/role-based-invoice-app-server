import { Inject, Service } from "typedi";
import { IAdminDataParams, IGetAllUser, IGetAllUsersParams, IUpdateUserRoleParams } from "../../Domain/types/admin.types";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import appAssert from "../../Shared/utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../../Shared/constants/http";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";
import generateUserId from "../../Infrastructure/Database/repositories/CounterSchema";
import Role from "../../Shared/constants/roles";
import { UserDocument } from "../../Infrastructure/Database/Models/usermodel";

@Service()
export class AdminUseCase {
    constructor(@Inject(IUserRepositoryToken) private __userRepository: IUserRepository) { }

    async createAdminService(unit_managerData: IAdminDataParams, userId: string): Promise<any> {
        const isUnitManager = await this.__userRepository.findUserByEmail(unit_managerData.email);
        appAssert(!isUnitManager, CONFLICT, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
        appAssert(
            unit_managerData.role !== Role.SUPER_ADMIN && unit_managerData.role !== Role.ADMIN,
            CONFLICT,
            ERROR_MESSAGES.NOT_AUTHORIZED
        );
        console.log("Details of unit manager:", unit_managerData);
        const generatedId = await generateUserId(unit_managerData.role as Role);

        const admin = await this.__userRepository.createAdmin({
            _id: generatedId,
            name: unit_managerData.name,
            email: unit_managerData.email,
            password: unit_managerData.password,
            role: unit_managerData.role,
            group: unit_managerData.group,
            createdBy: userId
        });
        appAssert(admin, CONFLICT, ERROR_MESSAGES.ADMIN_CREATION_FAILED);
        return {
            admin: admin.omitPassword(),
        }
    }

    async updateUserRoleService({ targetUserId, role: newRole, userId: creatorId }: IUpdateUserRoleParams): Promise<any> {
        const isTargetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(isTargetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(newRole !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
        appAssert(newRole !== Role.ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_ADMIN_ROLE);
        let updatedUser;
        if (isTargetUser.role === Role.UNIT_MANAGER) {
            appAssert(isTargetUser.createdBy !== creatorId, CONFLICT, ERROR_MESSAGES.YOU_DID_NOT_CREATE_THIS_UNIT_MANAGER);
            appAssert(isTargetUser.role !== newRole, CONFLICT, `This user already has the role ${newRole}`);
            updatedUser = await this.__userRepository.updateUserRole(targetUserId, newRole);
        } else if (isTargetUser.role === Role.USER) {
            appAssert(isTargetUser.role !== newRole, CONFLICT, `This user already has the role ${newRole}`);
            const createdUnitManager = await this.__userRepository.findUsersByCreatorId(creatorId);
            console.log("Created Unit Manager:");
            console.log(createdUnitManager);
            appAssert(createdUnitManager, CONFLICT, ERROR_MESSAGES.UNIT_MANAGER_NOT_FOUND);
            appAssert(createdUnitManager?.createdBy === creatorId, CONFLICT, "This user does not belong to your hierarchy");
            updatedUser = await this.__userRepository.updateUserRole(targetUserId, newRole);
        }


        return {
            updatedUser: updatedUser!.omitPassword(),
        }
    }
    async deleteUserService(targetUserId: string, creatorId: string): Promise<any> {
        console.log("Deleting user with ID:", targetUserId);
        console.log("Creator ID:", creatorId);
        const isTargetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(isTargetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(isTargetUser.role !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
        appAssert(isTargetUser.role !== Role.ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_ADMIN_ROLE);
        if (isTargetUser.role === Role.UNIT_MANAGER) {
            appAssert(isTargetUser.createdBy !== creatorId, CONFLICT, ERROR_MESSAGES.YOU_DID_NOT_CREATE_THIS_UNIT_MANAGER);
            await this.__userRepository.deleteUserById(targetUserId);
        } else if (isTargetUser.role === Role.USER) {
            const createdUnitManager = await this.__userRepository.findUsersByCreatorId(creatorId);
            appAssert(createdUnitManager, CONFLICT, ERROR_MESSAGES.UNIT_MANAGER_NOT_FOUND);
            appAssert(createdUnitManager?.createdBy === creatorId, CONFLICT, "This user does not belong to your hierarchy");
            await this.__userRepository.deleteUserById(targetUserId);
        }
    }
    async getAllUsersService(user: UserDocument, filter: IGetAllUsersParams): Promise<any> {
        const response = await this.__userRepository.getAllUsersForAdmin(user, filter);
        return { users: response }
    }


}
