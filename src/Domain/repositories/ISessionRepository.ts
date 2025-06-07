import { Token } from "typedi";
import mongoose, { ObjectId } from "mongoose";
import { SessionDocument } from "../../Infrastructure/Database/Models/session.model";

export interface ISessionRepository {
  createSession(session: Partial<SessionDocument>): Promise<SessionDocument>;
  findByIdAndDelete(id: mongoose.Types.ObjectId): Promise<SessionDocument | null>;
  findById(id: mongoose.Types.ObjectId): Promise<SessionDocument | null>;
  updateSession(id: mongoose.Types.ObjectId, updates: Partial<SessionDocument>): Promise<SessionDocument | null>;
  deleteMany(id: mongoose.Types.ObjectId): Promise<void>;
  deleteSessionByID(id: mongoose.Types.ObjectId): Promise<void>;
}

export const ISessionRepositoryToken = new Token<ISessionRepository>();
