import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{ message: String, senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });

export const chat_model = mongoose.model("Chat", chatSchema) || mongoose.model.Chat
