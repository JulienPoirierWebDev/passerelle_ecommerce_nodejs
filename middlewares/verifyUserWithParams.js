const verifyUserWithParams = (req, res, next) => {
  if (req.user._id !== req.params.id && !req.user.isAdmin) {
    return res
      .status(401)
      .json({ message: "Access denied : you are not this user", error: true });
  }
  next();
};

module.exports = verifyUserWithParams;
