

import Joi from 'joi';
import { file_schema } from '../User/User.validation.js';
const genral_company_schema={ 
companyName: Joi.string().trim(),
description: Joi.string().trim(),
industry: Joi.string().trim(),
address: Joi.string().trim(),
numberOfEmployees: Joi.string().trim(),
companyEmail: Joi.string().trim().email(),
HRs: Joi.array()
.items(Joi.string().trim().length(24).hex())
.messages({
    "array.base": "HRs must be an array of user IDs.",
    "string.length": "Each HR ID must be a 24-character hex string.",
    "string.hex": "Each HR ID must be a valid MongoDB ObjectId."
}),
}

export const pars_to_array=async(req,res,next) => {
  if(req.body?.HRs){if (typeof req.body.HRs === "string") {
    try {
        req.body.HRs = await JSON.parse(req.body.HRs);
    } catch (error) {
        return res.status(400).json({ message: "Invalid HRs format. Must be a array." });
    }
}}next()
}
export const new_company_schema = {
  body: Joi.object({
    companyName: genral_company_schema.companyName.required(),
    description: genral_company_schema.description.required(),
    industry: genral_company_schema.industry.required(),
    address: genral_company_schema.address.required(),
    numberOfEmployees: genral_company_schema.numberOfEmployees.required(),
    companyEmail: genral_company_schema.companyEmail.required(),
    HRs:genral_company_schema.HRs.required()
  }),
  files: Joi.object({
    coverPic: Joi.array().items(file_schema.cloudinarySchema).required(),
    legalAttachment: Joi.array().items(file_schema.cloudinarySchema).required(),
    logo: Joi.array().items(file_schema.cloudinarySchema).required(),

  }),
 
};

export const update_companyinfo_schema = {
  body: Joi.object({
    companyName: genral_company_schema.companyName.optional(),
    description: genral_company_schema.description.optional(),
    industry: genral_company_schema.industry.optional(),
    address: genral_company_schema.address.optional(),
    numberOfEmployees: genral_company_schema.numberOfEmployees.optional(),
    companyEmail: genral_company_schema.companyEmail.optional(),
    HRs:genral_company_schema.HRs.optional()
  })
 
};

 export const Upload_image_schema = {
  file:
    file_schema.cloudinarySchema.required(),
  }