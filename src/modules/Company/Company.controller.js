import { Router } from "express";
import { fileTypes, multerHOST } from "../../midelware/multer.js";
import { validation } from "../../midelware/validation.js";
import * as schema from './Company.validation.js';
import * as fn from "./Company.services.js";
import { authentication } from "../../midelware/authentication.js";
import { job_routes } from './../Job/Job.controller.js';
export const company_routes=Router({mergeParams:true})

company_routes.use('/:company_id/job',job_routes)
company_routes.use('/:companyName?/jobs',job_routes)
company_routes.post('/new-company',multerHOST(fileTypes.image).fields([{ name: 'logo', maxCount: 1 }, { name: 'coverPic', maxCount: 1 } , { name: 'legalAttachment', maxCount: 1 }   
]),schema.pars_to_array,validation(schema.new_company_schema),authentication,fn.add_company)
company_routes.patch('/update_info/:_id',authentication,schema.pars_to_array,validation(schema.update_companyinfo_schema),fn.update_data)
company_routes.delete('/delete/:_id',authentication,fn.soft_deleteacc)
company_routes.get('/:_id',authentication,fn.get_company)
company_routes.get('/name/:companyName',authentication,fn.get_companybyname)
company_routes.patch('/upload/logo/:_id',multerHOST(fileTypes.image).single('logo'),authentication,validation(schema.Upload_image_schema),fn.Upload_logo)
company_routes.patch('/upload/coverpic/:_id',multerHOST(fileTypes.image).single('coverpic'),authentication,validation(schema.Upload_image_schema),fn.Upload_CoverPic)
company_routes.patch('/delete/logo/:_id',authentication,fn.delete_logo)
company_routes.patch('/delete/coverpic/:_id',authentication,fn.delete_CoverPic)