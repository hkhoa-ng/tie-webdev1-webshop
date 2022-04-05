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



const validateUser = (user) => {
  const errors = [];

  const roles = ["customer", "admin"];

  if (!user.name) errors.push("Missing name");
  if (!user.email) errors.push("Missing email");
  if (!user.password) errors.push("Missing password");
  if (user.role && !roles.includes(user.role)) errors.push("Unknown role");

  return errors;
};

module.exports = {

    /****************************************************
    * 06. the registration of a new user (POST /api/register) to controllers/users.js inside the registerUser() function.
    *
    /****************************************************/
     registerUser: async (request, response) => {
        try {


      const { url, method, headers } = request;
      const authorizationHeader = headers["authorization"];


      if (!isJson(request)) {
        return responseUtils.badRequest(
          response,
          "Invalid Content-Type. Expected application/json"
        );
      }
      const userAsJson = await parseBodyJson(request);
      const user = await User.findOne({ email: userAsJson.email }).exec();
      const errors = validateUser(userAsJson);
      if (errors.length) {
        return responseUtils.badRequest(response, errors);
      }
      if (user) {
        return responseUtils.badRequest(response, "Email already in use!");
      }
      // Create a new user
      const userData = {
        name: userAsJson.name,
        email: userAsJson.email,
        password: userAsJson.password,
        role: "customer",
      }; 
      const newUser = new User(userData);
      await newUser.save();
      const newId = newUser._id;
  
      const newlyAddedUser = await User.findOne({ _id: newId }).exec();
      newlyAddedUser.role = "customer";
      await newlyAddedUser.save();
      return responseUtils.createdResource(response, newUser);
       
        
        } catch (err) {
        	
        }
    },






    /****************************************************
    * 02. getAllUsers a user list (GET /api/users) to controllers/users.js inside 
    *     the getAllUsers() function.
    ****************************************************/



    getAllUsers: async (request, response) => {
      const { url, method, headers } = request;


      // DONE: 8.5 Add authentication (only allowed to users with role "admin")
        const authorizationHeader = headers["authorization"];
        if (!authorizationHeader) {
          // response with basic auth challenge if auth header is missing/empty
          return responseUtils.basicAuthChallenge(response);
        }

        // check if the header is properly encoded
        const credentials = authorizationHeader.split(" ")[1];
        const base64regex =
          /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        if (!base64regex.test(credentials)) {
          // response with basic auth challenge if auth header is not properly encoded
          return responseUtils.basicAuthChallenge(response);
        }


        getCurrentUser(request).then((currentUser) => {
          
          if (currentUser === null) {
            // response with basic auth challenge if credentials are incorrect (no user found)
            return responseUtils.basicAuthChallenge(response);
          }
          // response with basic auth challenge if customer credentials are parsed
          if (currentUser.role === "customer") {
            return responseUtils.forbidden(response);
          }
          if (currentUser.role === "admin") {
            // respond with json when admin credentials are received
            return responseUtils.sendJson(response, users);
          }
        });

    },




    /****************************************************************************
    * 
    * 03. View user a user view (GET /api/users/{userId}) to controllers/users.js inside the
    *     viewUser() function.
    * 
    ****************************************************************************/

    viewUser: async (request, response) => {
      const { url, method, headers } = request;


       // DONE: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
          if (!request.headers.authorization) {
            response.setHeader("WWW-Authenticate", "Basic");
            return responseUtils.unauthorized(response);
          }

          const authorizationHeader = headers["authorization"];
          if (!authorizationHeader) {
            // response with basic auth challenge if auth header is missing/empty
            return responseUtils.basicAuthChallenge(response);
          }

          if (method.toUpperCase() === "OPTIONS") {
            return sendOptions(filePath, response);
          }
          const currentUser = await getCurrentUser(request);
          if (currentUser === null) {
            // response with basic auth challenge if credentials are incorrect
            return responseUtils.basicAuthChallenge(response);
          }
          const uid = filePath.split("/")[3];
          if (User.findById(uid).exec() === null) {
            return responseUtils.notFound(response);
          }
          // response with basic auth challenge if customer credentials are parse
          if (currentUser.role === "customer") {
            return responseUtils.forbidden(response);
          }
          if (method.toUpperCase() === "GET" && currentUser.role === "admin") {
            return responseUtils.sendJson(response, currentUser);
          }
         
          

    },


    /****************************************************************************
    * 
    * 04. Delete User the deletion of a single user (DELETE /api/users/{userId}) to 
    *     controllers/users.js inside the deleteUser() function.
    * 
    ****************************************************************************/

     deleteUser: async (request, response) => {


        // Find user to be deleted with ID, and then delete and return that user
        const userToBeDeleted = await User.findById(uid).exec();
        if (userToBeDeleted === null) {
          return responseUtils.notFound(response);
        }
        await User.deleteOne({ _id: uid });
        return responseUtils.sendJson(response, userToBeDeleted);

     },

     /****************************************************************************
    * 
    * 05. a user update (PUT /api/users/{userId}) to controllers/users.js inside the updateUser() function.
    * Add a check that current user cannot update his/her own data. Respond with "400 Bad Request" if this is tried. This is meant to prevent an admin  downgrading his/her own role to customer but also in general it is not a good idea to allow anyone to change their own access rights in a system.
    * 
    ****************************************************************************/


     updateUser: async (request, response) => {



      const userChangeRole = await parseBodyJson(request);
          


          const roleToChange = userChangeRole.role;
            if (
              (roleToChange !== "admin" && roleToChange !== "customer") ||
              !roleToChange
            ) {
              return responseUtils.badRequest(response);
            }

            if (currentUser.role === "admin") {
              // Only update user role if role = admin
              const userToChange = await User.findById(uid).exec();
              userToChange.role = roleToChange;
              await userToChange.save();
              return responseUtils.sendJson(response, userToChange);
            }

    },
   
};