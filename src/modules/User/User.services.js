import { customAlphabet} from 'nanoid'
import { user_model} from '../../database/models/user.model.js';
import { eventEmitter } from '../../utils/E-mail service/email event.js';
import { error_handeling } from './../../utils/error_handeling.js';
import {OAuth2Client} from 'google-auth-library';
import jwt from 'jsonwebtoken'
import { now } from 'mongoose';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js'
import cloudinary from '../../cloudinary/index.js';
import { authentication_types, decoded } from '../../midelware/authentication.js';
import { company_model } from '../../database/models/company.model.js';

//---------------------------------------------sign up with system-------------------------------------------------------------------------
export const sign_up = error_handeling(async (req, res, next) => {
  const {  email } = req.body;

  // Check if email already exists
  const existingUser = await user_model.findOne({ email });
  if (existingUser) {
      return next(new Error("Email already exists"));
  }
  // Create new user in the database
  const newUser = new user_model({
      ...req.body,
      provider: "system",
  });
  // Handle file uploads (profilePic & coverPic)
  if (req.files) {
      if (req.files.profilePic) { // Profile Picture
          const { public_id, secure_url } = await cloudinary.uploader.upload(req.files.profilePic[0].path, {
              folder: `Job_Search_App/users/${newUser._id}/profilePic`
          });
          newUser.profilePic = { public_id, secure_url };
      }
      if (req.files.coverPic) { // Cover Picture
          const { public_id, secure_url } = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
              folder: `Job_Search_App/users/${newUser._id}/coverPic`
          });
          newUser.coverPic = { public_id, secure_url };}}
  // Save user with uploaded files
  await newUser.save();
  // Send email event
  eventEmitter.emit("sendemail", email);
  res.status(200).json({ msg: "User added", user: newUser });
});

//--------------------------------------confirm account-------------------------------------------------------------------------------

export const confirm=error_handeling(async(req,res,next) => {
    const{code,email}=req.body
    const user=await user_model.findOne({ email });
    if (!user) {
      return next(new Error("Email not exists"));
  }
    const user_otp = user.OTP.find(otp => otp.type === 'confirmEmail').code;     
    const compare= await bcrypt.compare(code,user_otp)
    if(!compare||user.isConfirmed==true){
        return next(new Error("invalid code or email already confirmed"))
    }
     await user_model.updateOne({email},{isConfirmed:true})
     res.status(200).json({msg:'user confirm successfully'})
})
//-----------------------------------------login by system--------------------------------------------------------------------------
export const login=error_handeling(async(req,res,next) => {
    const{email,password}=req.body
    const User=await user_model.findOne({email,isConfirmed:true,bannedAt: { $exists: false },deletedAt: { $exists: false } ,provider:'system'})
    if(!User){
    return next(new Error("email not exist or not confirmed yet"))
    }
    const compare=await bcrypt.compare(password, User.password)
    if(!compare){
        return next(new Error("wrong password try again"))
    }
    const token=jwt.sign({email},User.role=='admin'?process.env.access_token_admin:process.env.access_token_user,{expiresIn:'1h'})
    const refresh_token=jwt.sign({email},User.role=='admin'?process.env.refresh_token_admin:process.env.refresh_token_user,{expiresIn:'7d'})
    res.json({token,refresh_token,message:'done'})
    

})

//-------------------------------------------google login/signup --------------------------------------------------------------------------------------
export const social_login=error_handeling(async(req,res,next) => {
  const{idToken}=req.body
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    return payload
  }
 const payload= await verify();
 const{email,email_verified,name,picture,family_name}=payload

 const User = await user_model.findOne({email})
 //sign up with google
 if(!User){
    await user_model.create({email,provider:'google',firstName:name,profilePic:picture,isConfirmed:email_verified,lastName:family_name})
    return res.status(200).json({msg:"user added"})
 }
 //login by google
 if(User.provider=='system'){
  return next(new Error("you should login with system"))
}
//give him token
const token = jwt.sign({email}, process.env.SECRET_KEY);
return res.status(200).json({token})
})
//--------------------------------------------forget password-------------------------------------------------------------------------------------
export const forget_password=error_handeling(async(req,res,next) => {
    const now = new Date(); 
    const user_otp = req.user.OTP.find(otp => otp.type === 'forgetPassword'&&new Date(otp.expiresIn) >now);   //otp still valid
    if(user_otp){
        return next(new Error("otp already sent check your email"))
    }
  //send email
  eventEmitter.emit('forget_password',req.user.email)
   res.status(200).json({msg:'otp sent'})
})


//---------------------------------------reassign password(update password)-----------------------------------------------------------------------
export const re_assign=error_handeling(async(req,res,next) => {
  const{code,oldpassword,newpassword}=req.body
  const{email,OTP,password}=req.user
  const user_otp = OTP.find(otp => otp.type === 'forgetPassword');
  const now = new Date(); 
  const expiresIn = new Date(user_otp.expiresIn); 
 if (expiresIn < now) {
  return next(new Error("otp expired")) }
  const compare=await bcrypt.compare(code,user_otp.code)
  if(!compare){
      return next(new Error("invalid code "))
  }
  //oldpassword is exist or not
  const is_correct_password=await bcrypt.compare(oldpassword, password)
  if(!is_correct_password){
      return next(new Error("wrong password"))
  }

  const new_password= await bcrypt.hash(newpassword,+process.env.SECRET_KEY )
  await user_model.updateOne({email},{password:new_password, changeCredentialTime:new Date() })

   res.status(200).json({msg:'password  update successfully'})
})

//-------------------------------------------refesh_token-----------------------------------------------------------------------------------
export const refesh_token=error_handeling(async(req,res,next) => {
    const { authentication } = req.headers;
    const User=await decoded(authentication,authentication_types.refresh_token,next)
    const email=User.email
    await user_model.updateOne({email},{changeCredentialTime:new Date() })
    const token=jwt.sign({email},User.role=='admin'?process.env.access_token_admin:process.env.access_token_user,{expiresIn:'1h'})
    res.json({token})

})
//-----------------------------------update user info( mobileNumber, DOB ,firstName, lastName, Gender)------------------------------------------------------------------
export const update_userinfo=error_handeling(async(req,res,next) => {
    const {email}=req.user
   //update user mobileNumber
   if(req.body?.mobileNumber){
    const {mobileNumber}=req.body
    req.body.mobileNumber=await CryptoJS.AES.encrypt(mobileNumber, process.env.SECRET_KEY).toString();
   }
     await user_model.updateOne({email},{...req.body})
     res.status(200).json({msg:'user info updated successfully'})
})
//-----------------------------------get user profile------------------------------------------------------------------
export const get_loginuser=error_handeling(async(req,res,next) => {
    const {email}=req.user
    const user= await user_model.findOne({email})
     res.status(200).json(user)
})
//-----------------------------------Get profile data for another use------------------------------------------------------------------
export const get_anotherUserProfile=error_handeling(async(req,res,next) => {
    const{_id}=req.params
    const user= await user_model.findOne({_id}).select('userName mobileNumber profilePic coverPic -_id')
    res.status(200).json(user)
})
//-----------------------------------------------update password----------------------------------------------------------------------------------
export const update_password=error_handeling(async(req,res,next) => {
    const {new_password,oldpassword}=req.body
    const user = await user_model.findById(req.user._id);
   const is_correct_password=await bcrypt.compare(oldpassword, user.password)
   if(!is_correct_password){
       return next(new Error("wrong password"))
   }
   user.password=new_password
   user.changeCredentialTime=new Date()
   await user.save()                                   //will hash by pre_hook
   return res.status(200).json({msg:'updated successfully',user})
})
//-----------------------------------------------Upload Cover Pic----------------------------------------------------------------------------------
export const update_CoverPic=error_handeling(async(req,res,next) => {
 const user = await user_model.findById(req.user._id);
 if (req.file) { // Cover Picture
    await cloudinary.uploader.destroy(user.coverPic.public_id)
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Job_Search_App/users/${user._id}/coverPic`})
        user.coverPic={ public_id, secure_url };
         user.save()}
         return res.status(200).json({msg:'updated successfully',user})
})

//-----------------------------------------------Upload profilePic----------------------------------------------------------------------------------
export const update_profilePic=error_handeling(async(req,res,next) => {
    const user = await user_model.findById(req.user._id);
    if (req.file) { // profilePic
       await cloudinary.uploader.destroy(user.profilePic.public_id)
       const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
           folder: `Job_Search_App/users/${user._id}/profilePic`})
           user.profilePic={ public_id, secure_url };
            user.save()}
            return res.status(200).json({msg:'updated successfully',user})
   })
//-----------------------------------------------delete coverpic----------------------------------------------------------------------------------
export const delete_CoverPic=error_handeling(async(req,res,next) => {
    const{_id}=req.user
    const user = await user_model.findOneAndUpdate({_id,deletedAt:{$exists:false},coverPic:{$exists:true}},{ $unset: { coverPic: 1 }} ,{ new: true });
    if(!user){
        return next(new Error("your account might doesn’t have a cover picture already"))
    }   await cloudinary.uploader.destroy(user.coverPic.public_id)
        return res.status(200).json({msg:'deleted successfully',user})
   })


//-----------------------------------------------delete profilepic----------------------------------------------------------------------------------
export const delete_profilePic=error_handeling(async(req,res,next) => {
    const{_id}=req.user
    const user = await user_model.findOneAndUpdate({_id,deletedAt:{$exists:false},profilePic:{$exists:true}},{ $unset: { profilePic: 1 }} ,{ new: true });
    if(!user){
        return next(new Error("your account might doesn’t have a profile picture already "))
    }   await cloudinary.uploader.destroy(user.profilePic.public_id)
        return res.status(200).json({msg:'deleted successfully',user})
   })

//-----------------------------------------------Soft delete account----------------------------------------------------------------------------------
export const soft_deleteacc=error_handeling(async(req,res,next) => {
    const{_id}=req.user
    const user = await user_model.findOneAndUpdate({_id,deletedAt:{$exists:false}},{deletedAt:new Date()});
    if(!user){
        return next(new Error("invalid user or already deleted "))
    } 
    return res.status(200).json({msg:'deleted successfully'})
   })

/////////////////////////////////////////////////admin dashboard////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------pan/unpan user-------------------------------------------------------------------------------
export const Ban_And_UnbanUser=error_handeling(async(req,res,next) => {
    let action=''
   const {email}=req.body
   const user=await user_model.findOne({email,deletedAt:{$exists:false}})
   if(!user){ return next(new Error("invalid user"))}
   if(user.role=='admin'){ return next(new Error("you canot ban admin"))}
   if(user?.bannedAt){
    action='unban'
    await user_model.updateOne({email},{ $unset: {bannedAt:0}})
   }
   else{
    action='ban'
    await user_model.updateOne({email},{bannedAt:new Date()})
   }

    res.status(200).json(`${user.firstName} ${action} successfully`)
   })
//--------------------------------------ban/uban company-------------------------------------------------------------------------------
export const Ban_And_Unbancompany=error_handeling(async(req,res,next) => {
    let action=''
   const {email}=req.body
   const company=await company_model.findOne({companyEmail:email,deletedAt:{$exists:false}})
   if(!company){ return next(new Error("invalid company"))}
   if(company?.bannedAt){
    action='unban'
    await company_model.updateOne({companyEmail:email},{ $unset: {bannedAt:0}})
   }
   else{
    action='ban'
    await company_model.updateOne({companyEmail:email},{bannedAt:new Date()})
   }

    res.status(200).json(`${company.companyName} ${action} successfully`)
   })
//--------------------------------------Approve company-------------------------------------------------------------------------------
export const approve_company=error_handeling(async(req,res,next) => {
   const {email}=req.body
   const company=await company_model.findOne({companyEmail:email,deletedAt:{$exists:false},bannedAt:{$exists:false}})
   if(!company){ return next(new Error("invalid company or already approved"))}
    await company_model.updateOne({companyEmail:email},{approvedByAdmin:true})
    res.status(200).json(`${company.companyName} approved successfully`)
   })

//--------------------------------------view all companies and users by graphql------------------------------------------------------------
import { GraphQLSchema,
    GraphQLObjectType,
    GraphQLList, GraphQLID ,GraphQLString ,GraphQLBoolean} from 'graphql';
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        username: { 
            type: GraphQLString, 
            resolve: (user) => `${user.firstName} ${user.lastName}` 
        },
        email: { type: GraphQLString },
        provider: { type: GraphQLString },
        gender: { type: GraphQLString },
        DOB: { type: GraphQLString },
        mobileNumber: { type: GraphQLString },
        role: { type: GraphQLString },
        isConfirmed: { type: GraphQLBoolean },
        deletedAt: { type: GraphQLString },
        bannedAt: { type: GraphQLString },
        updatedBy: { type: GraphQLID },
        changeCredentialTime: { type: GraphQLString },
        profilePic: { type: GraphQLString, resolve: (user) => user.profilePic?.secure_url },
        coverPic: { type: GraphQLString, resolve: (user) => user.coverPic?.secure_url },
        OTP: { type: new GraphQLList(new GraphQLObjectType({name:'otp',fields:{type:{ type: GraphQLString },
        code:{ type: GraphQLString },expiresIn:{ type: GraphQLString }}}))},
    })
});

// Company Type
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        _id: { type: GraphQLID },
        companyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLString },
        companyEmail: { type: GraphQLString },
        createdBy: { 
            type: UserType,
            resolve: async (company) => await user_model.findById(company.createdBy)
        },
        logo: { type: GraphQLString, resolve: (company) => company.logo?.secure_url },
        coverPic: { type: GraphQLString, resolve: (company) => company.coverPic?.secure_url },
        HRs: { 
            type: new GraphQLList(UserType), 
            resolve: async (company) => await user_model.find({ _id: { $in: company.HRs } }) 
        },
        bannedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        legalAttachment: { type: GraphQLString, resolve: (company) => company.legalAttachment?.secure_url },
        approvedByAdmin: { type: GraphQLBoolean }
    })
});



export const graphql_schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            getAllUsers: {
                type: new GraphQLList(UserType),
                resolve: async () => await user_model.find({})
            },
            getAllCompanies: {
                type: new GraphQLList(CompanyType),
                resolve: async () => await company_model.find({})
            }
        }
    })
});