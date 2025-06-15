import { Token } from "typedi";
import { UserDocument } from "../../Infrastructure/Database/Models/user.model";
import { IAdminDataParams, IGetAllUsersParams } from "../types/admin.types";
import Role from "../../Shared/constants/roles";
export interface IUserRepository {
    findUserByEmail(email: string): Promise<UserDocument | null>;
    createUser(adminData: IAdminDataParams): Promise<UserDocument>;
    findUserById(userId: string): Promise<UserDocument | null>;
    updateUserRole(targetUserId: string, role: string): Promise<UserDocument>;
    deleteUserById(userId: string): Promise<void>;
    getAllUsers(filterOptions: IGetAllUsersParams): Promise<{
        users: UserDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findUsersByCreatorId(creatorId: string): Promise<UserDocument[]>;
    getAllUsersForAdmin(user: UserDocument, filter: IGetAllUsersParams): Promise<any>
    findUsersByMultipleCreatorIds(creatorIds: string[]): Promise<UserDocument[]>
    findAllUsers(): Promise<UserDocument[]>
    findUsersByGroup(group: string[]): Promise<UserDocument[]>
    findAllUsersForUM(userId: string, filter: IGetAllUsersParams, uniqueGroups: (string | undefined)[]): Promise<any>

}

export const IUserRepositoryToken = new Token<IUserRepository>();
