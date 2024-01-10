const express = require("express");
const Category = require("../models/categorie.model.js");
const verifyTokenAndRefresh = require("../middlewares/verifyTokenAndRefresh");
const verifyIsAdmin = require("../middlewares/verifyIsAdmin");
const verifyIfIdIsValid = require("../middlewares/verifyIfIdIsValid");

const categoriesRouter = express.Router();

categoriesRouter.get("/", async (req, res) => {
  const categories = await Category.find({});

  res.json(categories);
});

categoriesRouter.get("/:id", verifyIfIdIsValid, async (req, res) => {
  const category = await Category.findById(req.params.id);

  res.json(category);
});

// create category
categoriesRouter.post(
  "/",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  async (req, res) => {
    // verify if category already exists
    const isAlreadyCategoryWithThisName = await Category.findOne({
      name: req.body.name,
    });

    if (isAlreadyCategoryWithThisName)
      return res
        .status(400)
        .json({ message: "Category already exists", error: true });

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    try {
      const newCategory = await category.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// update category

categoriesRouter.put(
  "/:id",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  verifyIfIdIsValid,
  async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      category.description = req.body.description || category.description;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  }
);

// delete category
categoriesRouter.delete(
  "/:id",
  verifyTokenAndRefresh,
  verifyIsAdmin,
  verifyIfIdIsValid,
  async (req, res) => {
    const category = await Category.findOneAndDelete({ _id: req.params.id });

    if (category) {
      res.json({ message: "Category deleted" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  }
);

module.exports = categoriesRouter;
