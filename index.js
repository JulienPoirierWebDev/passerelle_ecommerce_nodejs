// // create express server
// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";

// import mongoDBConnexion from "./database/mongo.js";

// import User from "./models/user.model.js";
// import Product from "./models/product.model.js";
// import Order from "./models/order.model.js";
// import Cart from "./models/cart.model.js";
// import Category from "./models/categorie.model.js";

// import userRouter from "./routes/users.router.js";
// import productRouter from "./routes/products.router.js";
// import categoriesRouter from "./routes/categories.router.js";
// import cartsRouter from "./routes/carts.router.js";
// import ordersRouter from "./routes/orders.router.js";

// transform import to require
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const mongoDBConnexion = require("./database/mongo.js");

const User = require("./models/user.model.js");
const Product = require("./models/product.model.js");
const Order = require("./models/order.model.js");
const Cart = require("./models/cart.model.js");
const Category = require("./models/categorie.model.js");

const userRouter = require("./routes/users.router.js");
const productRouter = require("./routes/products.router.js");
const categoriesRouter = require("./routes/categories.router.js");
const cartsRouter = require("./routes/carts.router.js");
const ordersRouter = require("./routes/orders.router.js");

dotenv.config();
const app = express();

// cors for all origins
app.use(
  cors({
    credentials: true,
  })
);

// for parsing cookies
app.use(cookieParser());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

mongoDBConnexion();

// home
app.get("/", (req, res) => {
  // create json to explain routes and params / body and role of each route
  res.json({
    "/users/register": {
      POST: {
        description: "Create a user",
        body: {
          name: "String",
          email: "String",
          password: "String",
          address: "String",
        },
      },
      GET: {
        description: "Get all users",
      },
    },
    "/users/login": {
      POST: {
        description: "Login a user",
        body: {
          email: "String",
          password: "String",
        },
      },
    },
    "/users/logout": {
      POST: {
        description: "Logout a user by deleting his cookie",
      },
      "/users/": {
        GET: {
          description: "Get all users",
        },
      },
    },
    "/users/:id": {
      GET: {
        description: "Get a user by id",
      },
      PUT: {
        description: "Update a user by id",
        body: {
          name: "String",
          address: "String",
        },
      },
      DELETE: {
        description: "Delete a user by id",
      },
    },
    "/products": {
      POST: {
        description: "Create a product",
        body: {
          name: "String",
          description: "String",
          price: "Number",
          category: "String",
          mainImageURL: "String",
          stock: "Number",
        },
      },
      GET: {
        description: "Get all products",
      },
    },
    "/products/:id": {
      GET: {
        description: "Get a product by id",
      },
      PUT: {
        description: "Update a product by id",
        body: {
          name: "String",
          description: "String",
          price: "Number",
          category: "String",
          mainImageURL: "String",
          stock: "Number",
          additionalImages: "Array of String",
        },
      },
      DELETE: {
        description: "Delete a product by id",
      },
    },
    "/categories": {
      POST: {
        description: "Create a category",
        body: {
          name: "String",
          description: "String",
        },
      },
      GET: {
        description: "Get all categories",
      },
    },
    "/categories/:id": {
      GET: {
        description: "Get a category by id",
      },
      PUT: {
        description: "Update a category by id",
        body: {
          name: "String",
          description: "String",
        },
      },
      DELETE: {
        description: "Delete a category by id",
      },
    },
    "/carts": {
      POST: {
        description: "Create a cart",
        body: {
          products: "Array",
        },
      },
      GET: {
        description: "Get all carts",
      },
    },
    "/carts/:id": {
      GET: {
        description: "Get a cart by id",
      },
      PUT: {
        description: "Update a cart by id",
        body: {
          userId: "String",
          products: "Array",
        },
      },
      DELETE: {
        description: "Delete a cart by id",
      },
    },
    "/orders": {
      POST: {
        description: "Create an order",
        body: {
          userId: "String",
          products: "Array",
          totalPrice: "Number",
        },
      },
      GET: {
        description: "Get all orders",
      },
    },
    "/orders/:id": {
      GET: {
        description: "Get an order by id",
      },
    },
    "/orders/users/:id": {
      GET: {
        description: "Get all orders of a user",
      },
    },
  });
});

// routes
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/categories", categoriesRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);

// 404
app.use((req, res) => {
  res.status(404).send("404");
});

// listen
app.listen(3000, () => {
  console.log("Express server listening on port 3000");
});
