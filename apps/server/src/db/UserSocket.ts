import mongoose, { Schema, Document } from "mongoose";

export interface IUserSocket extends Document {
  userId: string;
  socketId: string;
}

const UserSocketSchema = new Schema<IUserSocket>({
  userId: { type: String, required: true, unique: true },
  socketId: { type: String, required: true },
});

const UserSocketModel = mongoose.models.UserSocket || mongoose.model<IUserSocket>("UserSocket", UserSocketSchema);

export default UserSocketModel;