const roleMiddleware = async (req, res, next) => {
  const role = req.user.role;

  if (role === "ADMIN") {
    next();

    return;
  }

  if (role !== "ADMIN") {
    return res.status(403).json({
      succes: false,
      message: "You do not have access!",
    });
  }
};

export default roleMiddleware;
