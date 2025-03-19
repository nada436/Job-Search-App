


//--------------------------------------new application-------------------------------------------------------------------------------

import { io } from "../../../index.js";
import cloudinary from "../../cloudinary/index.js"
import { Application} from "../../database/models/Application.model.js"
import { company_model } from "../../database/models/company.model.js";
import { job_model } from "../../database/models/Job Opportunity.model.js";
import { user_model } from "../../database/models/user.model.js";
import { eventEmitter } from "../../utils/E-mail service/email event.js";
import { error_handeling } from "../../utils/error_handeling.js"


export const add_application = error_handeling(async (req, res, next) => {
    const { job_id } = req.params;
    if (req?.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `Job_Search_App/users/${req.user._id}/cv`
        });
        req.body.userCV = { secure_url, public_id };
    }
    const application = await Application.create({
        ...req.body,
        userId: req.user._id,
        jobId: job_id
    });//find job 
    const job = await job_model.findById(job_id).populate("companyId");
    if (!job || !job.companyId) {
        return next(new Error("Job or Company not found"));
    }// Find the HRs of the company
    const company = await company_model.findById(job.companyId).populate("HRs");
    if (!company) {
        return next(new Error("Company not found"));
    } //  socket
    company.HRs.forEach(hr => {
        io.to(hr._id.toString()).emit("newApplication", {
            message: "A new job application has been submitted",
            jobId: job_id,
            applicantId: req.user._id,
            applicationId: application._id
        });
    });
 res.status(200).json({ msg: "Application sent successfully" });
});

//-------------------------------------Accept or Reject an Applicant-------------------------------------------------------------------------------

export const acceptOrRejectApplicant = error_handeling(async (req, res, next) => {
        
        const { applicationId } = req.params;
        const { status } = req.body;
        const application = await Application.findById(applicationId).populate("jobId");
        if (!application) {
            return res.status(404).json({ msg: "Application not found" });
        }
        const company = await company_model.findById(application.jobId.companyId);
        if (!company) {
            return res.status(404).json({ msg: "Company not found" });
        }
       // Check if user is an HR of the company
        if (!company.HRs.some(hrId => hrId.equals(req.user._id))) {
            return res.status(403).json({ msg: "Access denied. Only HRs can perform this action." });
        }const user=await user_model.findOne({_id:application.userId})
        application.status = status;
        await application.save();
        // Send email notification
            if(status === "accepted"){
                await eventEmitter.emit("accepted", user.email)}
            if(status === "rejected"){
                await eventEmitter.emit("rejected", user.email)}
            else{
                return res.status(200).json({ msg: `enter accepted or rejected` 
            })}
           res.status(200).json({ msg: `Application ${status} successfully` });
});
