

import Joi from 'joi';



const genral_job_schema = {
  jobTitle: Joi.string().min(3).max(100),
  jobLocation: Joi.string().valid("onsite", "remotely", "hybrid"),
  workingTime: Joi.string().valid("part-time", "full-time"),
  seniorityLevel: Joi.string().valid("fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"),
  jobDescription: Joi.string().min(10).max(1000),
  technicalSkills: Joi.array().items(Joi.string()),
  softSkills: Joi.array().items(Joi.string()),

}



export const newJob_schema = {
  body: Joi.object({
    jobTitle: genral_job_schema.jobTitle.required(),
    jobLocation: genral_job_schema.jobLocation.required(),
    workingTime: genral_job_schema.workingTime.required(),
    seniorityLevel: genral_job_schema.seniorityLevel.required(),
    jobDescription: genral_job_schema.jobDescription.required(),
    technicalSkills: genral_job_schema.technicalSkills.required(),
    softSkills: genral_job_schema.softSkills.required(),
  
  }),
 
};

export const updateJob_schema = {
  body: Joi.object({
    jobTitle: genral_job_schema.jobTitle.optional(),
    jobLocation: genral_job_schema.jobLocation.optional(),
    workingTime: genral_job_schema.workingTime.optional(),
    seniorityLevel: genral_job_schema.seniorityLevel.optional(),
    jobDescription: genral_job_schema.jobDescription.optional(),
    technicalSkills: genral_job_schema.technicalSkills.optional(),
    softSkills: genral_job_schema.softSkills.optional(),
  
  }),
 
};