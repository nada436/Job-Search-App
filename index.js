import express from 'express';
import { bootstrap } from './src/app.controller.js';
import { Server } from "socket.io";
import './src/modules/User/deleteExpiredOTPs.js';
import { sendmessage } from './src/modules/Chat/socket.servies.js';

const app = express();
const port = process.env.PORT || 3000;
export const server = app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
export const io = new Server(server, {
    cors: { origin: "*" }
});
sendmessage()
bootstrap(app, express);

