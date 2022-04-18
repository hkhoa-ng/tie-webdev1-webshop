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

const productData = {
  products: require("../products.json").map((product) => ({ ...product })),
};

module.exports = {
  getAllProducts: async (request, response) => {
    try {
      const { url, method, headers } = request;

      const authorizationHeader = headers["authorization"];
      if (!authorizationHeader)
        return responseUtils.basicAuthChallenge(response);
      const credentials = authorizationHeader.split(" ")[1];
      const base64regex =
        /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      if (!base64regex.test(credentials)) {
        return responseUtils.basicAuthChallenge(response);
      }
      const currentUser = await getCurrentUser(request);

      if (currentUser === null) {
        return responseUtils.basicAuthChallenge(response);
      }
      const __data = productData.products.map((product) => ({ ...product }));
      return responseUtils.sendJson(response, __data);
    } catch (err) {}
  },
};
