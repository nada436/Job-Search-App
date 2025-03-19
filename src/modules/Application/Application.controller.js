import { Router } from "express";
import { fileTypes, multerHOST } from "../../midelware/multer.js";
import { validation } from './../../midelware/validation.js';

import { authentication } from './../../midelware/authentication.js';
import * as fn from "./Application.services.js";
import { Upload_image_schema } from "../Company/Company.validation.js";
import { role_authorization } from "../../midelware/authorization.js";

export const application_routes=Router({mergeParams:true})
application_routes.post('/new',multerHOST([...fileTypes.image,...fileTypes.pdf]).single('userCV'),authentication,role_authorization(['user']),validation(Upload_image_schema),fn.add_application
)
application_routes.patch('/:applicationId/status',authentication,fn.acceptOrRejectApplicant)
