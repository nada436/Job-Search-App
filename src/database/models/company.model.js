import mongoose from "mongoose";
import { job_model } from "./Job Opportunity.model.js";
import { Application } from "./Application.model.js";
const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  address: { type: String, required: true },
  numberOfEmployees: { type: String, required: true },
  companyEmail: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logo: { secure_url: String, public_id: String },
  coverPic: { secure_url: String, public_id: String },
  HRs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bannedAt: { type: Date },
  deletedAt: { type: Date},
  legalAttachment: { secure_url: String, public_id: String },
  approvedByAdmin: { type: Boolean, default: false }
}, { timestamps: true,toJSON: { virtuals: true }, 
toObject: { virtuals: true }  });
// Virtual field for jobs related to this company
companySchema.virtual("jobs", {
  ref: "Job", 
  localField: "_id", 
  foreignField: "companyId", 
});
companySchema.pre("save", async function (next) {
  // closed jobs related to those jobs
  if (this.deletedAt) {
      await job_model.updateMany(
          { companyId: this._id },
          { closed:true }
      );

  }
  next();
});
export const company_model = mongoose.model('Company',companySchema)||mongoose.model.Company;


