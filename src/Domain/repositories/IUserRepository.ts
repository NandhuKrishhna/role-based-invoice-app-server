import { Token } from "typedi";
import { UserDocument } from "../../Infrastructure/Database/Models/usermodel";
import { IAdminDataParams } from "../types/admin.types";
import mongoose from "mongoose";

export interface IUserRepository {
    findUserByEmail(email: string): Promise<UserDocument | null>;
    createAdmin(adminData: IAdminDataParams): Promise<UserDocument>;
    findUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument | null>;
    updateUserRole(targetUserId: mongoose.Types.ObjectId, role: string): Promise<UserDocument>;
}

export const IUserRepositoryToken = new Token<IUserRepository>();
