import { Token } from "typedi";
import { UserDocument } from "../../Infrastructure/Database/Models/usermodel";
import { IAdminDataParams, IGetAllUsersParams } from "../types/admin.types";
import Role from "../../Shared/constants/roles";
import { GetAllUsersResponse } from "../../Infrastructure/Database/repositories/user.repository";
interface IUserNode {
    id: string;
    name: string;
    email: string;
    role: Role;
    children?: IUserNode[];
}
export interface IUserRepository {
    findUserByEmail(email: string): Promise<UserDocument | null>;
    createAdmin(adminData: IAdminDataParams): Promise<UserDocument>;
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
    findUsersByCreatorId(creatorId: string): Promise<UserDocument | null>;
    getAllUsersForAdmin(user: UserDocument, filter: IGetAllUsersParams): Promise<any>

}

export const IUserRepositoryToken = new Token<IUserRepository>();
