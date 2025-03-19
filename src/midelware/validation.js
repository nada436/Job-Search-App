



export const validation = (schema) => async (req, res, next) => {
  try {
    for (const key of Object.keys(schema)) {
      if (schema[key]) {
        await schema[key].validateAsync(req[key], { abortEarly: false });
      }
    }
    next(); 
  } catch (error) {
    return res.status(400).json({
      errors: error.details.map((err) => ({
        message: err.message,
      })),
    });
  }
};
