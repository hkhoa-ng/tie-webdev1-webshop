const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SALT_ROUNDS = 10;

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  }
});

productSchema.set("toJSON", { virtuals: false, versionKey: false });
const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
