import { UserDocument, UserModel } from "../../Infrastructure/Database/Models/usermodel";
import Role from "../constants/roles";

export interface IUserNode {
    id: string;
    name: string;
    email: string;
    role: Role;
    children?: IUserNode[];
}

export function buildUserHierarchy(users: UserDocument[], parentId: string): IUserNode[] {
    const result: IUserNode[] = [];

    users
        .filter(user => user.createdBy?.toString() === parentId)
        .forEach(user => {
            const children = buildUserHierarchy(users, user._id.toString());
            const userObj: IUserNode = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            };
            if (children.length > 0) {
                userObj.children = children;
            }
            result.push(userObj);
        });

    return result;
}

export async function getUserHierarchy(userId: string): Promise<string[]> {
    const ids: Set<string> = new Set();
    const queue: string[] = [userId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        if (!currentId) continue;

        ids.add(currentId);

        const children = await UserModel.find({ createdBy: currentId }, '_id').lean();
        for (const child of children) {
            if (!ids.has(child._id.toString())) {
                queue.push(child._id.toString());
            }
        }
    }

    return Array.from(ids);
}
