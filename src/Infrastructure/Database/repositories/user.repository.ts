import { Service } from "typedi";

import { UserModel, UserDocument } from "../Models/usermodel";
import { IUserRepository, IUserRepositoryToken } from "../../../Domain/repositories/IUserRepository";
import { IAdminDataParams } from "../../../Domain/types/admin.types";
import mongoose from "mongoose";

@Service(IUserRepositoryToken)
export class UserRepository implements IUserRepository {
    async findUserByEmail(email: string): Promise<UserDocument | null> {
        const result = await UserModel.findOne({ email })
        return result;
    };


    async createAdmin(adminData: IAdminDataParams): Promise<UserDocument> {
        const newAdmin = await UserModel.create({ ...adminData });
        console.log("New Admin Created:", newAdmin);
        return newAdmin;
    }
    async findUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument | null> {
        const user = await UserModel.findById({ _id: userId }).exec();
        return user;
    }

    async updateUserRole(targetUserId: mongoose.Types.ObjectId, role: string): Promise<UserDocument> {
        const updatedUser = await UserModel.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true }
        ).exec();
        return updatedUser as UserDocument;
    }
}
