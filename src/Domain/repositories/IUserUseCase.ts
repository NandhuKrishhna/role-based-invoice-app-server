import { Token } from "typedi";
import { ILoginUserParams, IUserLoginResponse } from "../types/user.types";


export interface IUserUseCase {

    loginUserService(userData: ILoginUserParams): Promise<IUserLoginResponse>;
}

export const IUserUseCaseToken = new Token<IUserUseCase>();