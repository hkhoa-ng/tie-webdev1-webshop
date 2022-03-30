/* eslint-disable quotes */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
const responseUtils = require("./utils/responseUtils");
const authUtils = require("./auth/auth.js");
const {
  getCredentials,
  acceptsJson,
  isJson,
  parseBodyJson,
} = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
// const {
//   emailInUse,
//   getAllUsers,
//   saveNewUser,
//   validateUser,
//   getUserById,
//   updateUserRole,
//   deleteUserById,
// } = require("./utils/users");

// Require user model
const User = require("./models/user");
// Find all users
const users = User.find({});

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
    const currentUser = await authUtils
      .getCurrentUser(request)
      .then((user) => user);
    if (currentUser === undefined) {
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
      User.deleteOne({ _id: uid });
      // deleteUserById(uid);
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
        // updateUserRole(uid, userChangeRole.role);
        const userToChange = User.findById(uid).exec();
        userToChange.role = userChangeRole.role;
        await userToChange.save();
        return responseUtils.sendJson(response, User.findById(uid).exec());
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

    // If all is good, attempt to get the current user
    const currentUser = await authUtils
      .getCurrentUser(request)
      .then((user) => user);
    if (currentUser === undefined) {
      // response with basic auth challenge if credentials are incorrect (no user found)
      return responseUtils.basicAuthChallenge(response);
    }
    // response with basic auth challenge if customer credentials are parsed
    if (currentUser.role === "customer") {
      return responseUtils.forbidden(response);
    }
    return responseUtils.sendJson(response, getAllUsers());
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
    const errors = validateUser(userAsJson);
    if (errors.length) {
      return responseUtils.badRequest(response, errors);
    }
    if (emailInUse(userAsJson.email)) {
      return responseUtils.badRequest(response, "Email already in use!");
    }

    let newUser = saveNewUser(userAsJson);
    newUser.role = "customer";
    return responseUtils.createdResource(response, newUser);
  }

  if (filePath === "/api/products" && method.toUpperCase() === "GET") {
    /**
     * AUTHORIZATION: Chech the authorization header of the request and response accordingly
     */
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
    const currentUser = await authUtils
      .getCurrentUser(request)
      .then((user) => user);
    if (currentUser === undefined) {
      // Response with basic auth challenge if credentials are incorrect (no user found)
      return responseUtils.basicAuthChallenge(response);
    }

    // Respond with JSON object contains all products
    const getAllProducts = () =>
      productData.products.map((product) => ({ ...product }));
    return responseUtils.sendJson(response, getAllProducts());
  }
};

module.exports = { handleRequest };
