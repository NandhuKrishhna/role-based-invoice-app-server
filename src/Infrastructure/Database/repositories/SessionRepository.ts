import { Service } from "typedi";


import mongoose from "mongoose";
import { ISessionRepository, ISessionRepositoryToken } from "../../../Domain/repositories/ISessionRepository";
import SessionModel, { SessionDocument } from "../Models/session.model";


@Service(ISessionRepositoryToken)
export class SessionRepository implements ISessionRepository {
  // create session
  async createSession(session: Partial<SessionDocument>): Promise<SessionDocument> {
    const createdSession = await SessionModel.create(session);
    return createdSession
  }
  // delete session
  async findByIdAndDelete(id: mongoose.Types.ObjectId): Promise<SessionDocument | null> {
    return await SessionModel.findByIdAndDelete(id).exec();
  }
  // find session by id
  async findById(id: mongoose.Types.ObjectId): Promise<SessionDocument | null> {
    return await SessionModel.findById(id);
  }
  // update session
  async updateSession(id: mongoose.Types.ObjectId, updates: Partial<SessionDocument>): Promise<SessionDocument | null> {
    return await SessionModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
  }

  // session delete many
  async deleteMany(id: mongoose.Types.ObjectId): Promise<void> {
    await SessionModel.deleteMany({ userId: id }).exec();
  }

  async deleteSessionByID(id: mongoose.Types.ObjectId): Promise<void> {
    await SessionModel.deleteMany({ userId: id }).exec();
  }
}
