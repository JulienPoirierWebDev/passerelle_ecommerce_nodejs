import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import mongoDBConnexion from "../database/mongo.js";

import User from "../models/user.model.js";

mongoDBConnexion();

const addAdminUser = async () => {
  const adminUser = new User({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    address: {
      addressLine1: "admin",
      addressLine2: "admin",
      city: "admin",
      state: "admin",
      postalCode: "admin",
      country: "admin",
    },
    isAdmin: true,
  });

  try {
    await adminUser.save();
    console.log("Admin user created");
  } catch (error) {
    console.log(error);
  }
};

addAdminUser();
