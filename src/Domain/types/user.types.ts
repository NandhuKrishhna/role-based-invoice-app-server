import mongoose from "mongoose";

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