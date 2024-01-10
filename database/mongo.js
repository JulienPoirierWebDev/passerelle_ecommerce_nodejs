// import mongoose from "mongoose";

const mongoose = require("mongoose");

const mongoDBConnexion = async () => {
  mongoose.Promise = global.Promise;

  try {
    // Connecting to the database
    await mongoose.connect(
      `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@teachingcluster.rylpson.mongodb.net/passerelle`
    );

    console.log("Successfully connected to the database");
  } catch (error) {
    console.log(error);
  }
};

module.exports = mongoDBConnexion;
