import mongoose, { Document, Model, Schema } from "mongoose";
import { comparePassword, hashPassword } from "../../../Shared/utils/bcrypt";
import Role from "../../../Shared/constants/roles";


export interface UserDocument extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    group?: string;
    createdBy: string;
    status?: "blocked" | "active";
    profilePicture?: string;
    comparePassword(val: string): Promise<boolean>;
    omitPassword(): Pick<UserDocument, "_id" | "name" | "email" | "role" | "status" | "profilePicture">;
}

const UserSchema: Schema = new Schema<UserDocument>(
    {
        _id: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.USER,
        },
        group: {
            type: String,
            required: false,
            default: null,
            trim: true,
        },
        status: {
            type: String,
            enum: ["blocked", "active"],
            default: "active",
        },
        profilePicture: {
            type: String,
            required: false,
            default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        },
        createdBy: {
            type: String,
            ref: "User",
            required: false,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await hashPassword(this.password as string);
});

UserSchema.methods.comparePassword = async function (val: string): Promise<boolean> {
    return comparePassword(val, this.password);
};

UserSchema.methods.omitPassword = function () {
    const { _id, name, email, role, status, profilePicture, createdBy, group } = this;
    return { _id, name, email, role, status, profilePicture, createdBy, group };
};

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);
