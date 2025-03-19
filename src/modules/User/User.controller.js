import { Router } from "express";
import { validation } from "../../midelware/validation.js";
import { fileTypes, multerHOST } from "../../midelware/multer.js";
import * as schema from "./User.validation.js";
import * as fn from "./User.services.js";
import { authentication } from "../../midelware/authentication.js";
import {role_authorization } from './../../midelware/authorization.js';
export const user_routes=Router()
export const ADMIN_routes=Router()

user_routes.post('/sign-up',multerHOST(fileTypes.image).fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }      
]),validation(schema.signup_schema),fn.sign_up)
user_routes.patch('/confirm',validation(schema.confirm_otp_schema),fn.confirm)
user_routes.get('/login',validation(schema.login_schema),fn.login)
user_routes.post('/login_signupWithGmail',fn.social_login)
user_routes.patch('/forget_password',authentication,fn.forget_password)
user_routes.patch('/reassign_password',validation(schema.reassignPassword_schema),authentication,fn.re_assign)
user_routes.get('/refresh_token',fn.refesh_token)
user_routes.patch('/update_userinfo',validation(schema.update_userinfo_schema),authentication,fn.update_userinfo)
user_routes.get('/user_profile/:_id',fn.get_anotherUserProfile)
user_routes.patch('/update_password',validation(schema.update_password_schema),authentication,fn.update_password)
user_routes.patch('/update_CoverPic',multerHOST(fileTypes.image).single('CoverPic'),validation(schema.update_image_schema),authentication,fn.update_CoverPic)
user_routes.patch('/update_profilePic',multerHOST(fileTypes.image).single('profilePic'),validation(schema.update_image_schema),authentication,fn.update_profilePic)
user_routes.delete('/delete_coverpic',authentication,fn.delete_CoverPic)
user_routes.delete('/delete_profilepic',authentication,fn.delete_profilePic)
user_routes.delete('/soft_delete',authentication,fn.soft_deleteacc)
//admin routes
ADMIN_routes.patch('/pan_or_unpan_user',validation(schema.enter_email_schema),authentication,role_authorization(['admin']),fn.Ban_And_UnbanUser)
ADMIN_routes.patch('/pan_or_unpan_company',validation(schema.enter_email_schema),authentication,role_authorization(['admin']),fn.Ban_And_Unbancompany)
ADMIN_routes.patch('/approve_company',validation(schema.enter_email_schema),authentication,role_authorization(['admin']),fn.approve_company)

















// user_routes.post('/loginWithGmail',social_login)
// user_routes.patch('/confirm',validation(confirm_schema),authantcation,confirm)
// user_routes.patch('/update_info',multerHOST(fileTypes.image).single('coverimage')     
// ,validation(update_schema),authantcation,update_userinfo)
// user_routes.get('/SHARE/:id',validation(share_schema),authantcation,share_profile)
// user_routes.patch('/update_email',validation(update_email_schema),authantcation,update_email)
// user_routes.patch('/replace_email',validation(replace_email_schema),authantcation,replace_email)
// user_routes.patch('/blockandunblock_user',validation(block_user_schema),authantcation,block_user)
// user_routes.get('/myprofile',authantcation,myprofile)
// user_routes.patch('/addfriebd',validation(update_email_schema),authantcation,add_friend)
// //-------admin dashboard---------------------------------------------------------------
// user_routes.get('/dashboard',authantcation,authorization(['admin']),dash_board)
// user_routes.patch('/dashboard/update_role/:user_id',validation(update_role_schema),authantcation,authorization(['admin',"super_admin"]),update_role)