import jwt from 'jsonwebtoken';
import { error_handeling } from "../utils/error_handeling.js";
import { user_model } from '../database/models/user.model.js';

export const authentication_types = {
    access_token: "access_token",
    refresh_token: "refresh_token"
};

export const decoded = error_handeling(async (authentication, authentication_type, next) => {
    if (!authentication) {
        return next(new Error("Token is required"));
    }

    const [role, token] = authentication.split(' ');
    if (!token || !role) {
        return next(new Error("Invalid token format"));
    }

    let access_token = '';
    let refresh_token = '';

    if (role === "user") {
        access_token = process.env.access_token_user;
        refresh_token = process.env.refresh_token_user;
    } else {
        access_token = process.env.access_token_admin;
        refresh_token = process.env.refresh_token_admin;
    }

    let tokendata;
    try {
        tokendata = jwt.verify(token, authentication_type === authentication_types.access_token ? access_token : refresh_token);
    } catch (err) {
        return next(new Error("Invalid or expired token"));
    }

    const User = await user_model.findOne({ email: tokendata.email });

    if (!User) {
        return next(new Error("Invalid token"));
    }
    if (User?.changeCredentialTime && tokendata.iat < Math.floor(User.changeCredentialTime.getTime() / 1000)) {
        return next(new Error("Token expired"));
    }

    if (User?.deletedAt) {
        return next(new Error("User was deleted"));
    }
    if (User?.bannedAt) {
        return next(new Error("User was baned"));
    }
    
    return User;
});

export const authentication = async (req, res, next) => {
    const { authentication } = req.headers;
    
    if (!authentication) {
        return next(new Error("Token is required"));
    }

    const User = await decoded(authentication, authentication_types.access_token, next);
    req.user = User;
    
    next();
};

export const socket_auth = async (authentication) => {
    if (!authentication) {
        return { message: "Token is required", statuscode: '401' };
    }

    const [role, token] = authentication.split(' ');
    if (!token || !role) {
        return { message: "Invalid token format", statuscode: '400' };
    }

    let access_token = role === "user" ? process.env.access_token_user : process.env.access_token_admin;

    try {
        const tokendata = jwt.verify(token, access_token);
        const User = await user_model.findOne({ email: tokendata.email });

        if (!User) {
            return { message: "Invalid token", statuscode: '404' };
        }
        
        if (User?.changeCredentialTime && tokendata.iat < Math.floor(User.changeCredentialTime.getTime() / 1000)) {
            return { message: "Token expired", statuscode: '403' };
        }
          

        if (User?.deletedAt) {
            return { message: "User was deleted", statuscode: '403' };
        }

        return { user: User, statuscode: '200' };
    } catch (error) {
        return { message: "Invalid or expired token", statuscode: '401' };
    }
};
