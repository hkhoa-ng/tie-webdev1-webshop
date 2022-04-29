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
const http = require("http");
const Product = require("../models/product");

module.exports = {
  /**
   * Return all products in the database
   *
   * @param {http.ServerResponse} response The response to take products from
   * @param {*} request The incoming request even though not used
   * @returns {http.ServerResponse} response with content of all users in JSON format
   */
  getAllProducts: async (response, request) => {
    try {
      const products = await Product.find({});
      const result = products.map((product) => ({
        _id: product["_id"],
        name: product["name"],
        price: product["price"],
        image: product["image"],
        description: product["description"],
      }));
      return responseUtils.sendJson(response, result, 200);
    } catch (err) {
      console.error(err);
    }
  },
};
