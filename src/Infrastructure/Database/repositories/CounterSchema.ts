import mongoose from "mongoose";
import Role from "../../../Shared/constants/roles";

// MongoDB schema to track counters per role
const counterSchema = new mongoose.Schema({
    role: { type: String, unique: true },
    count: { type: Number, default: 1 },
});
const CounterModel = mongoose.model("RoleCounter", counterSchema);

export default async function generateUserId(role: Role): Promise<string> {
    const rolePrefixMap: Record<Role, string> = {
        SUPER_ADMIN: "SA",
        ADMIN: "A",
        UNIT_MANAGER: "UM",
        USER: "U",
    };

    const prefix = rolePrefixMap[role];
    const counter = await CounterModel.findOneAndUpdate(
        { role },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
    );

    return `${prefix}${counter.count}`;
}
