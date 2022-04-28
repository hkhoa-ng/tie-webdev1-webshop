const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SALT_ROUNDS = 10;

// const orderSchema = new Schema({
//   customerId: {
//     type: mongoose.ObjectId,
//     required: true
//   },
//   items: [
//     {
//       // _id: {
//       //   type: mongoose.ObjectId,
//       //   required: true 
//       // },
//       product: {
//         _id: {
//           type: mongoose.ObjectId,
//           required: true 
//         },
//         name: {
//           type: String,
//           required: true 
//         },
//         price: {
//           type: Number,
//           required: true 
//         },
//         description: {
//           type: String,
//           required: true 
//         }
//       },
//       quantity: {
//         type: Number,
//         required: true
//       }
//     }
//   ]
// });
const orderSchema = new Schema({
  customerId: {
    type: mongoose.ObjectId,
    required: true
  },
  items: [
    {
      product: Schema.Types.Mixed,
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
});

orderSchema.set("toJSON", { virtuals: false, versionKey: false });
const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;
