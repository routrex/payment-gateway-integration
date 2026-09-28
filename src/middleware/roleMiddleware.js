const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        succes: false,
        message: "User role not found!",
      });
    }

    const role = req.user.role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        succes: false,
        message: "You do not have permission to access this resource!",
      });
    }

    next();
  };
};

export default roleMiddleware;
