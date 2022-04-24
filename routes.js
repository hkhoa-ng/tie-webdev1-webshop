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

const roles = ["customer", "admin"];

const validateUser = (user) => {
  const errors = [];

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
  "/api/products": ["PUT"],
  "/api/products": ["POST"],
  "/api/orders": ["POST"],
  "/api/orders": ["GET"],
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

/**
 * Does the URL match /api/products/{id}
 * 
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchProductId = (url) => {
  return matchIdRoute(url, "products");
}

const matchOrderId = (url) => {
  return matchIdRoute(url, "orders");
}

const checkHeader = async (request) => {
  const { headers } = request;
  const authorizationHeader = headers["authorization"];
  const currentUser = await getCurrentUser(request);
  // response with basic auth challenge & 401 Unauthorized if auth header is missing
  if (!authorizationHeader) {
    response.setHeader("WWW-Authenticate", "Basic");
    return responseUtils.unauthorized(response);
  }
  if (authorizationHeader === undefined || authorizationHeader === " ") {
    // response with basic auth challenge if auth header is missing/empty
    return responseUtils.basicAuthChallenge(response);
  }
  // response with basic auth challenge if credentials are incorrect
  if (currentUser === null) {
    return responseUtils.basicAuthChallenge(response);
  }
  // response with 406 not acceptable if Accept header not found/client doesn't accept json
  const acceptHeader = headers['accept'];
  if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // check if the auth header is properly encoded
  const credentials = authorizationHeader.split(" ")[1];
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  // response with basic auth challenge if auth header is not properly encoded
  if (!base64regex.test(credentials)) {
    return responseUtils.basicAuthChallenge(response);
  }
}


const handleRequest = async (request, response) => {
  // Find all users
  const users = await User.find({});

  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // console.log(request);

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  const currentUser = await getCurrentUser(request);

  if (matchUserId(filePath)) {
    // DONE: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    const authorizationHeader = headers["authorization"];
    if (!authorizationHeader) {
      response.setHeader("WWW-Authenticate", "Basic");
      return responseUtils.unauthorized(response);
    }
    if (authorizationHeader === undefined || authorizationHeader === " ") {
      // response with basic auth challenge if auth header is missing/empty
      return responseUtils.basicAuthChallenge(response);
    }
    // Response with 406 Not Acceptable when Accept header is missing/client doesn't accept JSON
    const acceptHeader = request.headers['accept'];
    if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    if (method.toUpperCase() === "OPTIONS") {
      return sendOptions(filePath, response);
    }

    
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
    if (method.toUpperCase() === "GET") {
      console.log(currentUser);
      if (currentUser.role === "admin") return responseUtils.sendJson(response, currentUser);
      if (currentUser === null) return responseUtils.notFound(response);
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

    // console.log(userChangeRole);

    if (method.toUpperCase() === "PUT") {
      const roleToChange = userChangeRole.role;

      // if (!roles.includes(roleToChange)) {
      //   return responseUtils.badRequest(response);
      // }
      if ( !roles.includes(roleToChange) || roleToChange === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (currentUser.role === "admin") {
        // Only update user role if role = admin
        const userToChange = await User.findById(uid).exec();
        if (userToChange === null) return responseUtils.notFound(response);
        userToChange.role = roleToChange;
        await userToChange.save();
        return responseUtils.sendJson(response, userToChange);
      }
    }
  }

  if (matchProductId(filePath)) {
    const { headers } = request;
    const authorizationHeader = headers["authorization"];
    const currentUser = await getCurrentUser(request);
    // response with basic auth challenge & 401 Unauthorized if auth header is missing
    if (!authorizationHeader) {
      response.setHeader("WWW-Authenticate", "Basic");
      return responseUtils.unauthorized(response);
    }
    if (authorizationHeader === undefined || authorizationHeader === " ") {
      // response with basic auth challenge if auth header is missing/empty
      return responseUtils.basicAuthChallenge(response);
    }
    // response with basic auth challenge if credentials are incorrect
    if (currentUser === null) {
      return responseUtils.basicAuthChallenge(response);
    }
    // response with 406 not acceptable if Accept header not found/client doesn't accept json
    const acceptHeader = headers['accept'];
    if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    const productRequestBody = await parseBodyJson(request);
    const {name, price, image, description} = productRequestBody;

    // console.log(name + "/ " + price + "/ " + image + "/ " + description);

    if (method.toUpperCase() === "GET") {

    }

    if (method.toUpperCase() === "PUT") {
      // console.log("PUT products");
      if (currentUser.role === "customer") {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (name === ' ') {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (isNaN(price) || price === 0 || price <= 0) {
        return responseUtils.badRequest(response, "Bad Request");
      }
    }
  }

  if (matchOrderId(filePath)) {
    const { headers } = request;
    const authorizationHeader = headers["authorization"];
    const currentUser = await getCurrentUser(request);
    // response with basic auth challenge & 401 Unauthorized if auth header is missing
    if (!authorizationHeader) {
      response.setHeader("WWW-Authenticate", "Basic");
      return responseUtils.unauthorized(response);
    }
    if (authorizationHeader === undefined || authorizationHeader === " ") {
      // response with basic auth challenge if auth header is missing/empty
      return responseUtils.basicAuthChallenge(response);
    }
    // response with basic auth challenge if credentials are incorrect
    if (currentUser === null) {
      return responseUtils.basicAuthChallenge(response);
    }
    // response with 406 not acceptable if Accept header not found/client doesn't accept json
    const acceptHeader = headers['accept'];
    if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
      return responseUtils.contentTypeNotAcceptable(response);
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
    console.log("/api/products");
    const { headers } = request;
    const authorizationHeader = headers["authorization"];
    const currentUser = await getCurrentUser(request);
    // response with basic auth challenge & 401 Unauthorized if auth header is missing
    if (!authorizationHeader) {
      response.setHeader("WWW-Authenticate", "Basic");
      return responseUtils.unauthorized(response);
    }
    if (authorizationHeader === undefined || authorizationHeader === " ") {
      // response with basic auth challenge if auth header is missing/empty
      return responseUtils.basicAuthChallenge(response);
    }
    // response with basic auth challenge if credentials are incorrect
    if (currentUser === null) {
      return responseUtils.basicAuthChallenge(response);
    }
    // response with 406 not acceptable if Accept header not found/client doesn't accept json
    const acceptHeader = headers['accept'];
    if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    console.log("GET /api/products");
  
    // check if the auth header is properly encoded
    const credentials = authorizationHeader.split(" ")[1];
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    // response with basic auth challenge if auth header is not properly encoded
    if (!base64regex.test(credentials)) {
      return responseUtils.basicAuthChallenge(response);
    }
    ProductController.getAllProducts(request, response)
    

    if (method.toUpperCase() === "POST") {

    }
  
  }

  if (filePath === "/api/orders") {

  }
};

module.exports = { handleRequest };
