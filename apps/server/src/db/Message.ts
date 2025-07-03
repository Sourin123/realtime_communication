import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    message: string;
    from: string;
    to: string;
    timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
    message: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String},
    timestamp: { type: Date, default: Date.now },
});

const MessageModel = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;