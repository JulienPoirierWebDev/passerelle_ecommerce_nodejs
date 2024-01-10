const jwt = require("jsonwebtoken");

const verifyTokenAndRefresh = (req, res, next) => {
  // get token from cookie
  let token = req.cookies.token;

  if (!token) {
    // get token from header authotization bearer
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    // refresh token
    const newToken = jwt.sign(
      { _id: verified._id, isAdmin: verified.isAdmin },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "30m",
      }
    );
    req.token = newToken;
    res.cookie("token", newToken, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: process.env.NODE_ENV !== "development",
    });
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

module.exports = verifyTokenAndRefresh;
