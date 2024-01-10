const verifyIsAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(401)
      .json({ message: "Access denied : you are not an admin", error: true });
  }
  next();
};

module.exports = verifyIsAdmin;
