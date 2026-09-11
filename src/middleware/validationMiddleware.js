const validationMiddleware = (validation) => {
  return (req, res, next) => {
    const { error, value } = validation(req.body);

    if (error) {
      const messageError = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: messageError,
      });
    }

    req.dataValidate = value;

    next();
  };
};

export default validationMiddleware;
