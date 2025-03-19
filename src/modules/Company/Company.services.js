
import cloudinary from "../../cloudinary/index.js"
import { company_model } from "../../database/models/company.model.js";
import { error_handeling } from "../../utils/error_handeling.js"


//--------------------------------------create new company-------------------------------------------------------------------------------

export const add_company=error_handeling(async(req,res,next) => {
  const{companyEmail,companyName}=req.body
  
  // Check if company exists
  const existingcompany = await company_model.findOne({ companyEmail,companyName });
  if (existingcompany) {
      return next(new Error("company already exist"));
  }
  // Create new user in the database
  const company = new company_model({...req.body,createdBy:req.user._id});
 
   if (req?.files) {
      if (req.files?.legalAttachment) { // Profile Picture
          const { public_id, secure_url } = await cloudinary.uploader.upload(req.files.legalAttachment[0].path, {
              folder: `Job_Search_App/companies/${company._id}/legalAttachment`
          });
          company.legalAttachment = { public_id, secure_url };
      }
      if (req.files?.coverPic) { // Cover Picture
          const { public_id, secure_url } = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
            folder: `Job_Search_App/companies/${company._id}/coverPic`
          });
          company.coverPic = { public_id, secure_url }}
          if (req.files?.logo) { // Cover Picture
            const { public_id, secure_url } = await cloudinary.uploader.upload(req.files.logo[0].path, {
              folder: `Job_Search_App/companies/${company._id}/logo`
            });
            company.logo = { public_id, secure_url }}}
  // Save company with uploaded files
  await company.save();
  res.status(200).json({ msg: "company added", user: company });
});
//-----------------------------------------------update company data----------------------------------------------------------------------------------
export const update_data=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const is_exsist= await company_model.findOne({_id,createdBy:req.user._id,deletedAt:{$exists:false},bannedAt:{$exists:false}});
    if(!is_exsist){
      return next(new Error("invalid company or you are not authorize"));
    }
  await company_model.updateOne({_id},{...req.body})
 return res.status(200).json({msg:'updated successfully'})
})
//-----------------------------------------------Soft delete account----------------------------------------------------------------------------------
export const soft_deleteacc=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const company = await company_model.findOne({_id,createdBy:req.user._id,deletedAt:{$exists:false}});
  if(!company){
      return next(new Error("invalid company or already deleted "))
  } company.deletedAt = new Date();
      await company.save();

  return res.status(200).json({msg:'deleted successfully'})
 })
//-----------------------------------Get specific company with related jobs ------------------------------------------------------------------
export const get_company=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const company= await company_model.findOne({_id}).populate({path:"jobs"})
  if(!company){
    return next(new Error("invalid company  "))
} 
  res.status(200).json(company)
})
//-----------------------------------Get specific company with name ------------------------------------------------------------------
export const get_companybyname=error_handeling(async(req,res,next) => {
  const{companyName}=req.params
  const company= await company_model.findOne({companyName,deletedAt:{$exists:false},bannedAt:{$exists:false}});
  if(!company){
    return next(new Error("invalid company or already deleted "))
} 
  res.status(200).json(company)
})

//-----------------------------------------------Upload logo----------------------------------------------------------------------------------
export const Upload_logo=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const company = await company_model.findOne({_id,createdBy:req.user._id,deletedAt:{$exists:false}});
  if (req.file) { 
     await cloudinary.uploader.destroy(company.logo.public_id)
     const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
         folder: `Job_Search_App/companies/${company._id}/logo`})
         company.logo={ public_id, secure_url };
          company.save()}
          return res.status(200).json({msg:'updated successfully',company})
 })
//-----------------------------------------------Upload Cover Pic----------------------------------------------------------------------------------
export const Upload_CoverPic=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const company = await company_model.findOne({_id,createdBy:req.user._id,deletedAt:{$exists:false}});
  if (req.file) { 
     await cloudinary.uploader.destroy(company.coverPic.public_id)
     const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
         folder: `Job_Search_App/companies/${company._id}/coverPic`})
         company.coverPic={ public_id, secure_url };
          company.save()}
          return res.status(200).json({msg:'updated successfully',company})
 })

//-----------------------------------------------delete coverpic----------------------------------------------------------------------------------
export const delete_CoverPic=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const company =await company_model.findOne({_id,createdBy:req.user._id,deletedAt:{$exists:false},coverPic:{$exists:true}})
  if(!company){
    return next(new Error("error happen can't delete"))
}   await cloudinary.uploader.destroy(company.coverPic.public_id)
   await company_model.updateOne({_id},{ $unset: { coverPic: 1 }} ,{ new: true });
   return res.status(200).json({msg:'deleted successfully',company})
 })


//-----------------------------------------------delete logo----------------------------------------------------------------------------------
export const delete_logo=error_handeling(async(req,res,next) => {
  const{_id}=req.params
  const company =await company_model.findOne({_id,createdBy:req.user._id,deletedAt:{$exists:false},logo:{$exists:true}})
  if(!company){
    return next(new Error("error happen can't delete"))
}   
  await cloudinary.uploader.destroy(company.logo.public_id)
   await company_model.updateOne({_id},{ $unset: { logo: 1 }} ,{ new: true });
   return res.status(200).json({msg:'deleted successfully',company})
 })




