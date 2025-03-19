

import { io } from "../../../index.js";
import { chat_model } from "../../database/models/chat.model.js";
import { company_model } from "../../database/models/company.model.js";
import { socket_auth } from "../../midelware/authentication.js";

export const sendmessage=() => {

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);
    const user = socket_auth(socket.handshake.auth);
    const company = await company_model.findOne({ companyName: socket.handshake.auth.companyName });
    socket.on("send_message", async ({ sender, receiver, message }) => {
        const existingChat = await chat_model.findOne({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        });

        if (existingChat||user._id.toString() == company.createdBy.toString()||
            company.HRs.some(hrId => hrId.equals(user._id))) {
              const newMessage = await chat_model.create({ sender, receiver, message });
              io.to(receiver.toString()).emit("receive_message", newMessage);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User ${user._id} disconnected.`);
    });
});

;}
      


