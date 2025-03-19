
import mongoose from "mongoose";
import { Application } from "./Application.model.js";

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  jobLocation: { type: String, enum: ['onsite', 'remotely', 'hybrid'], required: true },
  workingTime: { type: String, enum: ['part-time', 'full-time'], required: true },
  seniorityLevel: { type: String, enum: ['fresh', 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO'], required: true },
  jobDescription: { type: String, required: true },
  technicalSkills: [{ type: String, required: true }],
  softSkills: [{ type: String, required: true }],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closed: { type: Boolean, default: false },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true,toJSON: { virtuals: true }, 
toObject: { virtuals: true }  });
jobSchema.virtual("Applications", {
  ref: "Application", 
  localField: "_id", 
  foreignField: "jobId", 
});
//Ensure applications are deleted whenever a job is deleted.
jobSchema.pre("deleteOne", { query: true, document: false }, async function (next) {
  const jobId = this.getFilter()?._id; 
  console.log("Deleting applications for job:", jobId);
  await Application.deleteMany({ jobId });
  next();
});

export const job_model = mongoose.model('Job',jobSchema)||mongoose.model.Job;


