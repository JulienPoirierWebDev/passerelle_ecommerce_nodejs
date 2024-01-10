const express = require("express");
const Product = require("../models/product.model");
const verifyTokenAndRefresh = require("../middlewares/verifyTokenAndRefresh");
const verifyIsAdmin = require("../middlewares/verifyIsAdmin");
const verifyIfIdIsValid = require("../middlewares/verifyIfIdIsValid");

const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  const products = await Product.find({}).populate("category").exec();

  res.json(products);
});

productsRouter.get("/:id", verifyIfIdIsValid, async (req, res) => {
  const product = await Product.findById(req.params.id);

  res.json(product);
});

// create product
productsRouter.post(
  "/",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  async (req, res) => {
    // verify if product already exists
    const isAlreadyProductWithThisName = await Product.findOne({
      name: req.body.name,
    });

    if (isAlreadyProductWithThisName)
      return res.status(400).json({
        message: "Product already exists with this name",
        error: true,
      });

    // check if mainImageURL is valid
    const mainImageURL = req.body.mainImageURL;

    // if (!mainImageURL.match(/\.(jpeg|jpg|gif|png)$/)) {
    //   return res.status(400).json({
    //     message: "mainImageURL is not valid",
    //     error: true,
    //   });
    // }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      mainImageURL: req.body.mainImageURL,
      stock: req.body.stock,
      additionalImages: req.body.additionalImages,
    });

    try {
      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// update product
productsRouter.put(
  "/:id",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  verifyIfIdIsValid,
  async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.additionalImages = req.body.additionalImages || [];
      product.mainImageURL = req.body.mainImageURL || product.mainImageURL;
      product.stock = req.body.stock || product.stock;

      const updatedProduct = await product.save();

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found", error: true });
    }
  }
);

// delete product
productsRouter.delete(
  "/:id",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  verifyIfIdIsValid,
  async (req, res) => {
    const product = await Product.findOneAndDelete({ _id: req.params.id });

    if (product) {
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found", error: true });
    }
  }
);

module.exports = productsRouter;
