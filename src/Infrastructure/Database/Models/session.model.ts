import mongoose, { model, Schema } from "mongoose";

import { thirtyDaysFromNow } from "../../../Shared/utils/date";
import Role from "../../../Shared/constants/roles";

export interface SessionDocument extends Document {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: Role;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
}

const sessionSchema = new Schema<SessionDocument>({
  userId: {
    ref: "User",
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(Role),
    required: true,
  },
  userAgent: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, default: thirtyDaysFromNow },
});

const SessionModel = model<SessionDocument>("Session", sessionSchema);
export default SessionModel;
