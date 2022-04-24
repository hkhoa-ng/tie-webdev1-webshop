const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SALT_ROUNDS = 10;

const orderSchema = new Schema({
  customerId: {
    type: mongoose.ObjectId,
    required: true
  },
  items: {
    type: Array,
    required: true,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  }
});

orderSchema.set("toJSON", { virtuals: false, versionKey: false });
const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;
