import { Inject, Service } from "typedi";
import { IAdminDataParams, IGetAllUser, IGetAllUsersParams, IUpdateUserRoleParams } from "../../Domain/types/admin.types";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import appAssert from "../../Shared/utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../../Shared/constants/http";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";
import generateUserId from "../../Infrastructure/Database/repositories/CounterSchema";
import Role from "../../Shared/constants/roles";
import { UserDocument } from "../../Infrastructure/Database/Models/user.model";

@Service()
export class AdminUseCase {
    constructor(@Inject(IUserRepositoryToken) private __userRepository: IUserRepository) { }

    async createAdminService(usersData: IAdminDataParams, userId: string): Promise<any> {

        const isUser = await this.__userRepository.findUserByEmail(usersData.email);
        appAssert(!isUser, CONFLICT, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
        appAssert(
            usersData.role !== Role.SUPER_ADMIN
            && usersData.role !== Role.ADMIN
            && usersData.role !== Role.UNIT_MANAGER,
            CONFLICT,
            ERROR_MESSAGES.NOT_AUTHORIZED
        );
        const generatedId = await generateUserId(usersData.role as Role);
        const user = await this.__userRepository.createUser({
            _id: generatedId,
            name: usersData.name,
            email: usersData.email,
            password: usersData.password,
            role: usersData.role,
            group: usersData.group,
            createdBy: userId
        });
        appAssert(user, CONFLICT, ERROR_MESSAGES.USER_CREATION_FAILED);
        return {
            user: user.omitPassword(),
        }
    }

    async updateUserRoleService({ targetUserId, role: newRole, userId: creatorId }: IUpdateUserRoleParams): Promise<any> {

        const isTargetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(isTargetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(newRole !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
        appAssert(newRole !== Role.ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_ADMIN_ROLE);
        appAssert(newRole !== Role.UNIT_MANAGER, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_UNIT_MANAGER_ROLE);
        appAssert(isTargetUser.role !== newRole, CONFLICT, `This user already has the role ${newRole}`);

        const createdUnitManager = await this.__userRepository.findUsersByCreatorId(creatorId);
        appAssert(createdUnitManager, CONFLICT, ERROR_MESSAGES.UNIT_MANAGER_NOT_FOUND);
        appAssert(createdUnitManager?.createdBy === creatorId, CONFLICT, "This user does not belong to your hierarchy");
        const updatedUser = await this.__userRepository.updateUserRole(targetUserId, newRole);
        return {
            updatedUser: updatedUser!.omitPassword(),
        }
    }



    async deleteUserService(targetUserId: string, creatorId: string): Promise<any> {

        const isTargetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(isTargetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(isTargetUser.role !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
        appAssert(isTargetUser.role !== Role.ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_ADMIN_ROLE);
        appAssert(isTargetUser.role !== Role.UNIT_MANAGER, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_UNIT_MANAGER_ROLE);

        const createdUnitManager = await this.__userRepository.findUsersByCreatorId(creatorId);
        appAssert(createdUnitManager, CONFLICT, ERROR_MESSAGES.UNIT_MANAGER_NOT_FOUND);
        appAssert(createdUnitManager?.createdBy === creatorId, CONFLICT, "This user does not belong to your hierarchy");
        await this.__userRepository.deleteUserById(targetUserId);

    }
    async getAllUsersService(user: UserDocument, filter: IGetAllUsersParams): Promise<any> {
        const response = await this.__userRepository.getAllUsersForAdmin(user, filter);
        return { users: response }
    }


}
