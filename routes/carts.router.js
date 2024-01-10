const express = require("express");

const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const verifyTokenAndRefresh = require("../middlewares/verifyTokenAndRefresh");
const verifyIsAdmin = require("../middlewares/verifyIsAdmin");
const verifyIfIdIsValid = require("../middlewares/verifyIfIdIsValid");

const cartsRouter = express.Router();

cartsRouter.get("/", verifyTokenAndRefresh, verifyIsAdmin, async (req, res) => {
  const carts = await Cart.find({}).populate("products.productId").exec();

  res.json(carts);
});

cartsRouter.get(
  "/users/:id",
  verifyTokenAndRefresh,
  verifyIfIdIsValid,
  async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.id })
      .populate("products.productId")
      .exec();

    if (!cart)
      return res.status(404).json({ message: "Cart not found", error: true });

    if (cart.userId.toString() !== req.user._id.toString())
      return res.status(403).json({
        message: "You are not allowed to access this cart",
        error: true,
      });

    res.json(cart);
  }
);

cartsRouter.get(
  "/:id",
  verifyTokenAndRefresh,
  verifyIfIdIsValid,
  async (req, res) => {
    const cart = await Cart.findById(req.params.id)
      .populate("products.productId")
      .exec();

    //check if id is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid id", error: true });

    if (!cart)
      return res.status(404).json({ message: "Cart not found", error: true });

    if (cart.userId.toString() !== req.user._id.toString())
      return res.status(403).json({
        message: "You are not allowed to access this cart",
        error: true,
      });

    res.json(cart);
  }
);

// create cart
cartsRouter.post("/", verifyTokenAndRefresh, async (req, res) => {
  // check if user already has a cart
  const cartInDB = await Cart.findOne({ userId: req.user._id });
  // if (cartInDB)
  //   return res
  //     .status(403)
  //     .json({ message: "You already have a cart", error: true });

  if (cartInDB) {
    try {
      const updatedCart = await Cart.findByIdAndUpdate(
        cartInDB._id,
        {
          user: req.user._id,
          products: req.body.products,
        },
        { new: true }
      )
        .populate("products.productId")
        .exec();

      if (!updatedCart)
        return res.status(404).json({ message: "Cart not found", error: true });
      // get the total price
      const totalPrice = updatedCart.products.reduce(
        (acc, product) => acc + product.productId.price * product.quantity,
        0
      );
      // update the total price
      updatedCart.totalPrice = totalPrice;
      // save the cart
      await updatedCart.save();

      res.json(updatedCart);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    const cart = new Cart({
      userId: req.user._id,
      products: req.body.products,
      totalPrice: 0,
    });

    // get the total price
    for (let product of cart.products) {
      const productInDB = await Product.findById(product.productId);
      if (!productInDB)
        return res
          .status(404)
          .json({ message: "Product not found", error: true });
      // update the total price
      cart.totalPrice += productInDB.price * product.quantity;
    }

    try {
      const newCart = await cart.save();

      res.status(201).json(newCart);
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

// update cart
cartsRouter.put(
  "/:id",
  verifyTokenAndRefresh,
  verifyIfIdIsValid,
  async (req, res) => {
    try {
      const updatedCart = await Cart.findByIdAndUpdate(
        req.params.id,
        {
          user: req.user._id,
          products: req.body.products,
          totalPrice: req.body.totalPrice,
        },
        { new: true }
      )
        .populate("products.productId")
        .exec();

      if (!updatedCart)
        return res.status(404).json({ message: "Cart not found", error: true });
      // get the total price
      const totalPrice = updatedCart.products.reduce(
        (acc, product) => acc + product.productId.price * product.quantity,
        0
      );
      // update the total price
      updatedCart.totalPrice = totalPrice;
      // save the cart
      await updatedCart.save();

      res.json(updatedCart);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// delete cart
cartsRouter.delete(
  "/:id",
  verifyTokenAndRefresh,
  verifyIfIdIsValid,
  async (req, res) => {
    try {
      const deletedCart = await Cart.findByIdAndDelete(req.params.id);

      if (!deletedCart)
        return res.status(404).json({ message: "Cart not found", error: true });
      res.json({ message: "Cart deleted" });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

module.exports = cartsRouter;
