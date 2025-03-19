import mongoose from "mongoose";
import {  chat_model } from "../../database/models/chat.model.js";
import { error_handeling } from "../../utils/error_handeling.js";

//-----------------------------------------------------send message ----------------------------------------------------------
export const getChatHistory = error_handeling(async (req, res, next) => {
    const { userId } = req.params; 
    const loggedInUserId = req.user._id; 
      const messages = await chat_model.find({
        $or: [
          { sender: loggedInUserId, receiver: userId },
          { sender: userId, receiver: loggedInUserId }
        ]
      }).sort({ createdAt: 1 }); 
  
      res.status(200).json(messages);
  });
