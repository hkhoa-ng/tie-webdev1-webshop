const User = require("../models/user.js");
const responseUtils = require("../utils/responseUtils");
const { getCurrentUser } = require("../auth/auth.js");

const {
  getCredentials,
  acceptsJson,
  isJson,
  parseBodyJson,
} = require("../utils/requestUtils");
const { renderPublic } = require("../utils/render");

module.exports = {

    /**
    * /User
    */
     registerUser: async (request, response) => {
        try {


      const { url, method, headers } = request;

      const authorizationHeader = headers["authorization"];
       


        
        } catch (err) {
        	
        }
    }
   
};