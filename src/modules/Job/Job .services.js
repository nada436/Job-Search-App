
import { error_handeling } from "../../utils/error_handeling.js"
import { company_model } from "../../database/models/company.model.js"
import { job_model } from './../../database/models/Job Opportunity.model.js';
import { pagination } from './../../utils/pagination.js';
import { Application } from "../../database/models/Application.model.js";
import { populate } from "dotenv";


//--------------------------------------post new job-------------------------------------------------------------------------------

export const add_job=error_handeling(async(req,res,next) => {
    const{company_id}=req.params
    const company=await company_model.findOne({_id:company_id,deletedAt:{$exists:false},bannedAt:{$exists:false},approvedByAdmin:true})
    if(!company){return next(new Error("invalid company"))}
    if (
        req.user._id.toString() !== company.createdBy.toString() &&
        !company.HRs.some(hrId => hrId.equals(req.user._id))
    ) {
        return next(new Error("You do not have access"));}
    await job_model.create({...req.body,companyId:company_id,addedBy:req.user._id})
    res.status(200).json({msg:'job added successfully'})
})

//--------------------------------------update  job(only the owner can perform this )-------------------------------------------------------------------------------

export const update_job=error_handeling(async(req,res,next) => {
    const{company_id,job_id}=req.params
    const company=await company_model.findOne({_id:company_id,deletedAt:{$exists:false},bannedAt:{$exists:false},approvedByAdmin:true,createdBy:req.user._id})
    if(!company){return next(new Error("invalid company or You do not have access"))}
    await job_model.updateOne({_id:job_id},{...req.body,updatedBy:req.user._id})
    res.status(200).json({msg:'job updated successfully'})
})

//--------------------------------------delete job(only the hr can perform this )-------------------------------------------------------------------------------

export const delete_job=error_handeling(async(req,res,next) => {
    const{company_id,job_id}=req.params
    const company=await company_model.findOne({_id:company_id,deletedAt:{$exists:false},bannedAt:{$exists:false},approvedByAdmin:true,HRs:{$in:req.user._id}})
    if(!company){return next(new Error("invalid company or You do not have access"))}
    await job_model.deleteOne({_id:job_id})
    res.status(200).json({msg:'job deleted successfully'})
})
//--------------------------------------Get all Jobs or a specific one for a specific company. -------------------------------------------------------------------------------

export const get_jobs = error_handeling(async (req, res, next) => {
    const { companyName} = req.params; 
    const { _id,page } = req.query;                  //job id
    let  company={}
    if (companyName && !_id) {
         company = await company_model.findOne({ 
            companyName,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true
        }).select('companyName description industry address jobs ');
        res.status(200).json(company)

        if (!company) {
            return next(new Error("Invalid company"));
        } 
    }
    const filter = _id ? { _id } : {};  
    const { data, _page, limit ,total_count} = await pagination({ page, model:job_model, findby : filter })
    res.status(200).json({total_jobs: total_count, 
        current_page: _page, 
        jobs_per_page: limit,jobs: data 
    });
});
//--------------------------------------Get all Jobs that match the following filters and if no filters apply then get all jobs-------------------------------------------------------------------------------

export const filter_jobs = error_handeling(async (req, res, next) => {
    const { workingTime, technicalSkills, jobTitle, seniorityLevel, jobLocation, page } = req.query;
    let filter = {};
    if (workingTime) filter.workingTime = workingTime;
    if (jobTitle) filter.jobTitle = jobTitle;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (technicalSkills) {
        filter.technicalSkills = { $in: technicalSkills };
    }
    const { data, _page, limit, total_count } = await pagination({ page, model: job_model, findby: filter });
    res.status(200).json({
        total_jobs: total_count,
        current_page: _page,
        jobs_per_page: limit,
        jobs: data
    });
});
//--------------------------------------Get all applications for specific Job.-------------------------------------------------------------------------------

export const job_applications = error_handeling(async (req, res, next) => {
    const{companyName,job_id}=req.params
    const {page} = req.query;   
    const company=await company_model.findOne({companyName,deletedAt:{$exists:false},bannedAt:{$exists:false},approvedByAdmin:true})
    if(!company){return next(new Error("invalid company"))}
    if (
        req.user._id.toString() !== company.createdBy.toString() &&
        !company.HRs.some(hrId => hrId.equals(req.user._id))
    ) {
        return next(new Error("You do not have access"));}
    const { data, _page, limit, total_count } = await pagination({ page, model:job_model, findby: {_id:job_id} ,populate:[{path:'Applications' ,populate:{path:'userId'}}]});
    res.status(200).json({
        total_applications: total_count,
        current_page: _page,
        applications_per_page: limit,
        applications: data
    });
});
