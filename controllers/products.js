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
  getAllProducts: async (request, response) => {
    try {
      const { url, method, headers } = request;

      // const authorizationHeader = headers["authorization"];
      // if (authorizationHeader === undefined || authorizationHeader === " ") return responseUtils.basicAuthChallenge(response);
      // const credentials = authorizationHeader.split(" ")[1];
      // const base64regex =
      //   /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      // if (!base64regex.test(credentials)) {
      //   return responseUtils.basicAuthChallenge(response);
      // }
      // const currentUser = await getCurrentUser(request);

      // if (currentUser === null) {
      //   return responseUtils.basicAuthChallenge(response);
      // }

      // const products = productData.products.map((product) => ({ ...product }));
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
