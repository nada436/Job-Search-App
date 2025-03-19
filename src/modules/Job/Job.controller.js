import { Router } from "express";
import { authentication } from './../../midelware/authentication.js';
import { validation } from './../../midelware/validation.js';
import * as fn from "./Job .services.js";
import * as schema from "./Job.validation.js";
import { application_routes } from './../Application/Application.controller.js';

export const job_routes=Router({mergeParams:true})
job_routes.use('/:job_id/application',application_routes)
job_routes.post('/new',authentication,validation(schema.newJob_schema),fn.add_job)
job_routes.patch('/update/:job_id',authentication,validation(schema.updateJob_schema),fn.update_job)
job_routes.patch('/delete/:job_id',authentication,fn.delete_job)
job_routes.get('/',authentication,fn.get_jobs)
job_routes.get('/filter',authentication,fn.filter_jobs)
job_routes.get('/:job_id/job_application',authentication,fn.job_applications)
