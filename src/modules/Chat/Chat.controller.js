import { Router } from "express";
import { authentication } from "../../midelware/authentication.js";
import { getChatHistory } from "./Chat.services.js";
export const chat_routes=Router()

chat_routes.get('/:userId',authentication,getChatHistory)