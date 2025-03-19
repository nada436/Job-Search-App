
import fs from 'fs';
import multer from 'multer';
import { nanoid } from 'nanoid';

export const fileTypes = {
  image: ["image/png", "image/jpeg", "image/gif"],
  video: ["video/mp4"],
  audio: ["audio/mpeg"],
  pdf: ["application/pdf"]
};


export const multerHOST = (customValidation = []) => {
  const storage = multer.diskStorage({})
  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format'), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};
