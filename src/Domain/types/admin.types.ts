import mongoose from "mongoose";
import Role from "../../Shared/constants/roles";
import { UserDocument } from "../../Infrastructure/Database/Models/usermodel";

export interface IAdminDataParams {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: string;
    group?: string;
    createdBy?: String;
}


export interface IUpdateUserRoleParams {
    targetUserId: string,
    role: Role;
    userId: string;
};

export interface IGetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: "blocked" | "active";
    group?: string;
    sortBy?: "name" | "email" | "role" | "status";
    sortOrder?: "asc" | "desc";
    createdBy?: string;
}

export interface IGetAllUser {
    filterOptions: IGetAllUsersParams;
    role: string,
    userId: string
}
