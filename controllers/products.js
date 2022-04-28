const UserModel = require("../models/user.js");
const responseUtils = require("../utils/responseUtils");
const { getCurrentUser } = require("../auth/auth.js");

const {
  getCredentials,
  acceptsJson,
  isJson,
  parseBodyJson,
} = require("../utils/requestUtils");
const { renderPublic } = require("../utils/render");

// const productData = {
//   products: require("../products.json").map((product) => ({ ...product })),
// };

const Product = require("../models/product");

module.exports = {
  /**
   * Return all products in the database
   * @param {*} response 
   * @returns 
   */
  getAllProducts: async (response, request) => {
    try {
      const products = await Product.find({});
      const result = products.map(product => (
        {
          _id: product['_id'],
          name: product['name'],
          price: product['price'],
          image: product['image'],
          description: product['description']
        }
      ))
      // result.map((product) => {
      //   console.log("Actual: " + product['_id']);
      //   console.log(product['name']);
      //   console.log(product['price']);
      //   console.log(product['image']);
      //   console.log(product['description']);
      //   console.log("==============");
      // })
      return responseUtils.sendJson(response, result, 200);
    } catch (err) {}
  },
};
