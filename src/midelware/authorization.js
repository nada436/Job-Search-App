



export const role_authorization=(acess_role=[]) => {
    return async(req,res,next) => {
        if(!acess_role.includes(req.user.role)){
           return next(new Error("you donot have acess"))
        }
        next()
    }
}

