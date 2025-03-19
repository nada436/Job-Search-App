import nodemailer from "nodemailer";
export const sendemail=async(to,html) => {

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: "nada.nasr436@gmail.com",
    pass: process.env.pass,
  },
});

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: ' <nada.nasr436@gmail.com>', 
    to: to,
    subject: "Hello", 
    text: "Hello ?", 
    html: html
  });

  if(info.accepted.length>0){
     return true
  }else{
    return false
  }
 




}
