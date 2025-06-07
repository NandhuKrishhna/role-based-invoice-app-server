import mongoose from "mongoose";
import Role from "../../Shared/constants/roles";

export interface IAdminDataParams {
    name: string;
    email: string;
    password: string;
    role: string;
    group?: string;
    createdBy?: mongoose.Types.ObjectId;
}


export interface IUpdateUserRoleParams {
    targetUserId: mongoose.Types.ObjectId,
    role: Role;
    userId: mongoose.Types.ObjectId;
}