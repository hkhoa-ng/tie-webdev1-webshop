const mongoose = require("mongoose");
const ProductSchema = require("./product");
const Schema = mongoose.Schema;

const SALT_ROUNDS = 10;

const orderSchema = new Schema({
  customerId: {
    type: mongoose.ObjectId,
    required: true
  },
  items: {[
    product: Object,
    quantity: Number
  ]},
});

orderSchema.set("toJSON", { virtuals: false, versionKey: false });
const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;
