/* eslint-disable quotes */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
const responseUtils = require("./utils/responseUtils");
// const authUtils = require("./auth/auth.js");
const { getCurrentUser } = require("./auth/auth.js");
const {
  getCredentials,
  acceptsJson,
  isJson,
  parseBodyJson,
} = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");

const validateUser = (user) => {
  const errors = [];

  const roles = ["customer", "admin"];

  if (!user.name) errors.push("Missing name");
  if (!user.email) errors.push("Missing email");
  if (!user.password) errors.push("Missing password");
  if (user.role && !roles.includes(user.role)) errors.push("Unknown role");

  return errors;
};

// Require user model
const User = require("./models/user");

const UserController = require("./controllers/users.js");
const ProductController = require("./controllers/products.js");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  "/api/register": ["POST"],
  "/api/users": ["GET"],
  "/api/products": ["GET"],
};
/**
 * Read the products data in JSON
 */
const productData = {
  // Make copies of products (prevents changing from outside this module/file)
  products: require("./products.json").map((product) => ({ ...product })),
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      "Access-Control-Allow-Methods": allowedMethods[filePath].join(","),
      "Access-Control-Allow-Headers": "Content-Type,Accept",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Expose-Headers": "Content-Type,Accept",
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = "[0-9a-z]{8,24}";
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = (url) => {
  return matchIdRoute(url, "users");
};

const handleRequest = async (request, response) => {
  // Find all users
  const users = await User.find({});

  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
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
    if (method.toUpperCase() === "DELETE" && currentUser.role === "admin") {
      // Find user to be deleted with ID, and then delete and return that user
      const userToBeDeleted = await User.findById(uid).exec();
      if (userToBeDeleted === null) {
        return responseUtils.notFound(response);
      }
      await User.deleteOne({ _id: uid });
      return responseUtils.sendJson(response, userToBeDeleted);
    }
    const userChangeRole = await parseBodyJson(request);
    if (method.toUpperCase() === "PUT") {
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
    }
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === "OPTIONS")
    return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === "/api/users" && method.toUpperCase() === "GET") {
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
    
  }

  // register new user
  if (filePath === "/api/register" && method.toUpperCase() === "POST") {
    // DONE: 8.4 Implement user registration
    // Fail if not a JSON request, don't allow non-JSON Content-Type
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
  }

  if (filePath === "/api/products" && method.toUpperCase() === "GET") {
    /**
     * AUTHORIZATION: Chech the authorization header of the request and response accordingly
     */
     ProductController.getAllProducts(request, response)
  
  }
};

module.exports = { handleRequest };
