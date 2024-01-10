// create router

const express = require("express");
const verifyTokenAndRefresh = require("../middlewares/verifyTokenAndRefresh");
const verifyIsAdmin = require("../middlewares/verifyIsAdmin");
const verifyUserWithParams = require("../middlewares/verifyUserWithParams");
const verifyIfIdIsValid = require("../middlewares/verifyIfIdIsValid");

const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");

const ordersRouter = express.Router();

// get all orders
ordersRouter.get(
  "/",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  async (req, res) => {
    const orders = await Order.find({}).populate("userId").exec();

    res.json(orders);
  }
);

// get all orders of a user
ordersRouter.get(
  "/users/:id",
  verifyTokenAndRefresh,
  verifyUserWithParams,
  verifyIfIdIsValid,
  async (req, res) => {
    const orders = await Order.find({ userId: req.params.id })
      .populate("products.productId")
      .exec();

    res.json(orders);
  }
);

// get one order
ordersRouter.get(
  "/:id",
  verifyTokenAndRefresh,
  verifyUserWithParams,
  verifyIfIdIsValid,
  async (req, res) => {
    // check if id is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid id", error: true });

    const order = await Order.findById(req.params.id)
      .populate("products.productId")
      .exec();

    if (!order)
      return res.status(404).json({ message: "Order not found", error: true });

    res.json(order);
  }
);

// create order
ordersRouter.post("/", verifyTokenAndRefresh, async (req, res) => {
  const order = new Order({
    userId: req.user._id,
    products: req.body.products,
    totalPrice: 0,
  });

  let totalPrice = 0;
  for (const product of req.body.products) {
    const productInDB = await Product.findById(product.productId);
    // add product price in order
    order.products.find((p) => {
      // transform ObjectId to string
      return p.productId.toString() === product.productId;
    }).price = productInDB.price;

    order.totalPrice += productInDB.price * product.quantity;
  }

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update order
ordersRouter.put(
  "/:id",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  verifyIfIdIsValid,
  async (req, res) => {
    try {
      const updatedOrder = await Order.findById(req.params.id).exec();

      if (!updatedOrder)
        return res
          .status(404)
          .json({ message: "Order not found", error: true });

      updatedOrder.status = req.body.status;

      await updatedOrder.save();

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// delete order
ordersRouter.delete(
  "/:id",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  verifyIfIdIsValid,
  async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id).exec();

      if (!order)
        return res
          .status(404)
          .json({ message: "Order not found", error: true });

      res.json({ message: "Order deleted" });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

module.exports = ordersRouter;
