const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  stock: { type: Number, required: true },
  mainImageURL: { type: String, required: true },
  additionalImages: [String],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
