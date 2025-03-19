import { EventEmitter } from 'events';
import { customAlphabet} from 'nanoid'
import { sendemail } from './send email .js';
import { email_template } from './html.js';
import bcrypt from 'bcrypt';
import { user_model } from '../../database/models/user.model.js';
export const eventEmitter = new EventEmitter();
const expiresIn = new Date(Date.now() + 10 * 60 * 1000)    //Set expiration to 10 min
//confirm email
eventEmitter.on('sendemail',async(email) => {   
const otp=customAlphabet('123456789',4)()  
if(!(sendemail(email,email_template("Verify Email address",otp)))){
    return next(new Error("ERROR will send email"))
}
const code= await bcrypt.hash(otp,+process.env.SECRET_KEY )
await user_model.updateOne({email},{$push:{OTP:{code,expiresIn,type:'confirmEmail'}}})
})
//forget password
eventEmitter.on('forget_password',async(email) => {   
    const otp=customAlphabet('123456789',4)()  
    if(!(sendemail(email,email_template("forget_password",otp)))){
        return next(new Error("ERROR will send email"))
    }const user=await user_model.findOne({email})
    const user_otp = user.OTP.find(otp => otp.type === 'forgetPassword');   //replace if exist
    const code= await bcrypt.hash(otp,+process.env.SECRET_KEY )
    if(user_otp){
       user_otp.code=code
       user_otp.expiresIn=expiresIn
       user.save()}
    else{
    await user_model.updateOne({email},{$push:{OTP:{code,expiresIn,type:'forgetPassword'}}})}
    })

//accept application 
eventEmitter.on('accepted',async(email) => {   
    if(!(sendemail(email,email_template("Congratulations! Your application has been accepted")))){
        return next(new Error("ERROR will send email"))
    }})

//reject application 
eventEmitter.on('rejected',async(email) => {   
    if(!(sendemail(email,email_template("CWe regret to inform you that your application has been rejected")))){
        return next(new Error("ERROR will send email"))
    }})