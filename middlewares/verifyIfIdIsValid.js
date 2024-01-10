const mongoose = require("mongoose");

const checkIfIdIsValid = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid id", error: true });

  next();
};

module.exports = checkIfIdIsValid;
