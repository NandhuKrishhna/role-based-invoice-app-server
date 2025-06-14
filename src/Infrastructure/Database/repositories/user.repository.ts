import { Service } from "typedi";
import { SortOrder } from "mongoose";
import { UserModel, UserDocument } from "../Models/user.model";
import { IUserRepository, IUserRepositoryToken } from "../../../Domain/repositories/IUserRepository";
import { IAdminDataParams, IGetAllUsersParams } from "../../../Domain/types/admin.types";
import Role from "../../../Shared/constants/roles";

export interface GetAllUsersResponse {
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Service(IUserRepositoryToken)
export class UserRepository implements IUserRepository {
    async findUserByEmail(email: string): Promise<UserDocument | null> {
        const result = await UserModel.findOne({ email })
        return result;
    };


    async createUser(adminData: IAdminDataParams): Promise<UserDocument> {
        const newAdmin = await UserModel.create({ ...adminData });
        return newAdmin;
    }
    async findUserById(userId: string): Promise<UserDocument | null> {
        const user = await UserModel.findById({ _id: userId }).exec();
        return user;
    }

    async updateUserRole(targetUserId: string, role: string): Promise<UserDocument> {
        const updatedUser = await UserModel.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true }
        ).exec();
        return updatedUser as UserDocument;
    }

    async deleteUserById(userId: string): Promise<void> {
        await UserModel.findByIdAndDelete({ _id: userId }).exec();
    };

    async getAllUsers(filterOptions: IGetAllUsersParams): Promise<{
        users: UserDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            status,
            group,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = filterOptions;

        const skip = (page - 1) * limit;

        const filters: any = {
            role: { $ne: "SUPER_ADMIN" },
        };

        if (role) filters.role = role;
        if (status) filters.status = status;
        if (group) filters.group = group;

        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const sort: Record<string, SortOrder> = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [users, total] = await Promise.all([
            UserModel.find(filters)
                .select("-password -__v")
                .populate({
                    path: "createdBy",
                    select: "name email role"
                })
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .exec(),
            UserModel.countDocuments(filters),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            users,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findUsersByCreatorId(creatorId: string): Promise<UserDocument | null> {
        const users = await UserModel.findOne({ createdBy: creatorId }).exec();
        return users

    }

    async getAllUsersForAdmin(user: UserDocument, filter: IGetAllUsersParams): Promise<any> {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            status,
            group,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = filter;

        const sortDirection = sortOrder === "asc" ? 1 : -1;

        const basePipeline: any[] = [
            {
                $facet: {
                    unitManagers: [
                        { $match: { role: Role.UNIT_MANAGER, createdBy: user._id } }
                    ],
                    usersFromUMs: [
                        { $match: { role: Role.USER } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "createdBy",
                                foreignField: "_id",
                                as: "creator"
                            }
                        },
                        { $unwind: "$creator" },
                        { $match: { "creator.createdBy": user._id } },
                        { $project: { creator: 0 } }
                    ]
                }
            },
            {
                $project: {
                    unitManagers: "$unitManagers",
                    usersFromUMs: "$usersFromUMs",
                    groups: {
                        $filter: {
                            input: {
                                $map: {
                                    input: "$unitManagers",
                                    as: "um",
                                    in: "$$um.group"
                                }
                            },
                            as: "g",
                            cond: { $ne: ["$$g", null] }
                        }
                    },
                    umIds: {
                        $map: {
                            input: "$unitManagers",
                            as: "um",
                            in: "$$um._id"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { groups: "$groups", umIds: "$umIds" },
                    pipeline: [
                        { $match: { role: Role.UNIT_MANAGER } },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$group", "$$groups"] },
                                        { $not: [{ $in: ["$_id", "$$umIds"] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "groupUnitManagers"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { groupUMIds: "$groupUnitManagers._id" },
                    pipeline: [
                        { $match: { role: Role.USER } },
                        {
                            $match: {
                                $expr: {
                                    $in: ["$createdBy", "$$groupUMIds"]
                                }
                            }
                        }
                    ],
                    as: "groupUsers"
                }
            },
            {
                $project: {
                    result: {
                        $concatArrays: [
                            "$unitManagers",
                            "$usersFromUMs",
                            "$groupUnitManagers",
                            "$groupUsers"
                        ]
                    }
                }
            },
            { $unwind: "$result" },
            { $replaceRoot: { newRoot: "$result" } },
            {
                $match: {
                    ...(role && { role }),
                    ...(status && { status }),
                    ...(group && { group }),
                    ...(search && {
                        $or: [
                            { name: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } }
                        ]
                    })
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { [sortBy]: sortDirection } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit }
                    ]
                }
            }
        ];

        const result = await UserModel.aggregate(basePipeline);

        const total = result[0].metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        return {
            total,
            page,
            limit,
            totalPages,
            data: result[0].data
        };
    }



}



