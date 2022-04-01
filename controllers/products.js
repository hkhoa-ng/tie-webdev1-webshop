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
  // Make copies of products (prevents changing from outside this module/file)
  products: require("../products.json").map((product) => ({ ...product })),
};

module.exports = { 
	
	getAllProducts: async (request, response) => {
		try {
				const { url, method, headers } = request;
			    const authorizationHeader = headers["authorization"];
			    // Response with basic auth challenge if auth header is missing/empty
			    if (!authorizationHeader) return responseUtils.basicAuthChallenge(response);
			    // Check if the header is properly encoded
			    const credentials = authorizationHeader.split(" ")[1];
			    const base64regex =
			      /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
			    if (!base64regex.test(credentials)) {
			      // Response with basic auth challenge if auth header is not properly encoded
			      return responseUtils.basicAuthChallenge(response);
			    }
			    // If all is good, attempt to get the current user
			    const currentUser = await getCurrentUser(request);
			    
			    if (currentUser === null) {
			      // Response with basic auth challenge if credentials are incorrect (no user found)
			      return responseUtils.basicAuthChallenge(response);
			    }

			    // Respond with JSON object contains all products
			    const getAllProducts = () =>
			      productData.products.map((product) => ({ ...product }));
			     return responseUtils.sendJson(response, getAllProducts());

		} catch (err) {
        	
        }
	}

}
