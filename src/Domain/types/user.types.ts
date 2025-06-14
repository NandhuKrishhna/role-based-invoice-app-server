import mongoose from "mongoose";
import Role from "../../Shared/constants/roles";

export interface ILoginUserParams {
    email: string;
    password: string;
    userAgent?: string;
}


export interface IUserLoginResponse {
    user: ILoginUser
    accessToken: string;
    refreshToken: string;
}
export interface ILoginUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    profilePicture: string;
    role: string;
};

export type GetAllUserResponse = {
    _id: string;
    name: string;
    email: string;
    role: Role;
    group: string | null;
    status: 'active' | 'inactive';
    profilePicture: string;
    createdBy: string | {
        _id: string;
        name: string;
        email: string;
        role: Role;
    } | null;
    createdAt: string;
    updatedAt: string;
};
