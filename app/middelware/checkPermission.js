const checkPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userType = req.user.user_type;

  if (userType === "admin") {
    return next();
  }

  if (userType === "user") {
    // if () {
    //     return next();
    // } else {
    //     return res.status(403).json({ message: "Forbidden" });
    // }
    return next();
  }

  return res.status(403).json({ message: "Forbidden" });
};

module.exports = checkPermission;
