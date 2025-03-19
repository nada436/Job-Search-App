

import Joi from 'joi';

export const file_schema={
  cloudinarySchema: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  })
}

export const user_genral_schema = {
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(4),
  mobileNumber: Joi.string()
    .length(11) // 11-digit phone number validation
    ,
  gender: Joi.string().valid('male', 'female'),
  DOB: Joi.date()
    .less("now") // Must be before the current date
    .custom((value, helpers) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18) {
        return helpers.message("Age must be greater than 18 years");
      }
      return value;
    })
    ,
    role: Joi.string().valid('user', 'admin'),
    code: Joi.string().length(4).required().messages({
      "string.length": "OTP must be exactly 4 characters long",
    })
};
// Sign-up Schema 
export const signup_schema = {
  body: Joi.object({
  firstName: user_genral_schema.firstName.required(),
  lastName: user_genral_schema.lastName.required(),
  email: user_genral_schema.email.required(),
  password: user_genral_schema.password.required(),
  mobileNumber: user_genral_schema.mobileNumber.required(),
  gender: user_genral_schema.gender.required(),
  DOB: user_genral_schema.DOB.required(),
  role: user_genral_schema.role.required(),
  }),
  files: Joi.object({
    coverPic: Joi.array().items(file_schema.cloudinarySchema).required(),
    profilePic: Joi.array().items(file_schema.cloudinarySchema).required(),
  }),
};



export const confirm_otp_schema = {
  body:Joi.object({
  email: user_genral_schema.email.required(),
  code: user_genral_schema.code
})}


export const login_schema = {
  body:Joi.object({
  email: user_genral_schema.email.required(),
  password: user_genral_schema.password.required()
})}


export const reassignPassword_schema = {
  body:Joi.object({
    code:user_genral_schema.code,
    oldpassword: user_genral_schema.password.required(),
    newpassword:user_genral_schema.password.required(),
})}

export const update_userinfo_schema = {
  body:Joi.object({
    mobileNumber:user_genral_schema.mobileNumber.optional(),
    DOB: user_genral_schema.DOB.optional(),
    firstName:user_genral_schema.firstName.optional(),
    gender:user_genral_schema.gender.optional()
    ,lastName:user_genral_schema.lastName.optional()
})}
export const update_password_schema = {
  body:Joi.object({
    oldpassword: user_genral_schema.password.required(),
    new_password:user_genral_schema.password.required(),
})}


  export const enter_email_schema = {
    body:Joi.object({
      email: user_genral_schema.email.required()
  })
    }
