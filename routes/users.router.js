const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const verifyTokenAndRefresh = require("../middlewares/verifyTokenAndRefresh");
const verifyUserWithParams = require("../middlewares/verifyUserWithParams");
const verifyIfIdIsValid = require("../middlewares/verifyIfIdIsValid");

const userRouter = express.Router();

// import controller
userRouter.post("/register", async (req, res) => {
  // hash password
  console.log(req.body);

  // check if user exists
  const isAlreadyUserWithThisEmail = await User.findOne({
    email: req.body.email,
  });

  if (isAlreadyUserWithThisEmail)
    return res
      .status(400)
      .json({ message: "Email already exists", error: true });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    address: req.body.address,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      address: newUser.address,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

userRouter.post("/login", async (req, res) => {
  //get password and email from request body
  const { email, password } = req.body;

  // check if user exists
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ message: "Email or password is wrong", error: true });

  // check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res
      .status(400)
      .json({ message: "Email or password is wrong", error: true });

  // create and assign a token with a expiration date of 10 minutes

  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "30m",
    }
  );

  // create cookie and send response
  res
    .cookie("token", token, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      jwt: token,
    });

  console.log("user logged in");
});

userRouter.post("/logout", (req, res) => {
  res.clearCookie("token").sendStatus(200);
});

userRouter.get(
  "/:id",
  verifyTokenAndRefresh,
  verifyUserWithParams,
  verifyIfIdIsValid,
  async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found", error: true });

    user.password = undefined;

    res.status(200).json(user);
  }
);
userRouter.put(
  "/:id",
  verifyTokenAndRefresh,
  verifyUserWithParams,
  verifyIfIdIsValid,
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found", error: true });
    // Just update the name and address, not the password, email or isAdmin
    // TODO : make route to update password and another to update email with verification
    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
    });
  }
);
userRouter.get("/", async (req, res) => {
  const users = await User.find({});

  const usersWithoutPassword = users.map((user) => {
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  });
  res.status(200).json(usersWithoutPassword);
});

userRouter.delete(
  "/:id",
  verifyTokenAndRefresh,
  verifyUserWithParams,
  verifyIfIdIsValid,
  (req, res) => {
    User.findByIdAndDelete(req.params.id)
      .then(() => {
        res.clearCookie("token").json("User deleted.");
      })
      .catch((err) => res.status(400).json("Error: " + err));
  }
);

userRouter.get("/refreshToken", verifyTokenAndRefresh, (req, res) => {
  res.json({ jwt: req.token });
});

module.exports = userRouter;
