export const error_handeling = (fn) => {
    return async (req, res, next) => {
        try {
          return  await fn(req, res, next); 
        } catch (error) {
          return next(error); 
          
        }
    };
};
