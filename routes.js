/* eslint-disable quotes */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
const responseUtils = require("./utils/responseUtils");
// const requestUtils = require("./utils/requestUtils");
const authUtils = require("./auth/auth.js");
const {
  getCredentials,
  acceptsJson,
  isJson,
  parseBodyJson,
} = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const {
  emailInUse,
  getAllUsers,
  saveNewUser,
  validateUser,
  getUserById,
  updateUserRole,
  deleteUserById,
} = require("./utils/users");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  "/api/register": ["POST"],
  "/api/users": ["GET"],
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
    // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    // If the HTTP method of a request is OPTIONS you can use sendOptions(filePath, response) function from this module
    // If there is no currently logged in user, you can use basicAuthChallenge(response) from /utils/responseUtils.js to ask for credentials
    //  If the current user's role is not admin you can use forbidden(response) from /utils/responseUtils.js to send a reply
    // Useful methods here include:
    // - getUserById(userId) from /utils/users.js
    // - notFound(response) from  /utils/responseUtils.js
    // - sendJson(response,  payload)  from  /utils/responseUtils.js can be used to send the requested data in JSON format
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
    if (getUserById(uid) === undefined) {
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
      const userToBeDeleted = getUserById(uid);
      deleteUserById(uid);
      return responseUtils.sendJson(response, userToBeDeleted);
    }
    const userChangeRole = await parseBodyJson(request);
    // console.log(userChangeRole);
    // console.log(currentUser);
    // console.log(getUserById(uid));
    if (method.toUpperCase() === "PUT") {
      const roleToChange = userChangeRole.role;
      if (
        (roleToChange !== "admin" && roleToChange !== "customer") ||
        !roleToChange
      ) {
        return responseUtils.badRequest(response);
      }

      if (currentUser.role === "admin") {
        updateUserRole(uid, userChangeRole.role);
        return responseUtils.sendJson(response, getUserById(uid));
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
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(
        response,
        "Invalid Content-Type. Expected application/json"
      );
    }

    const dataJson = await parseBodyJson(request);
    const { name, email, password } = dataJson;

    if (
      dataJson.email === undefined ||
      dataJson.name === undefined ||
      dataJson.password === undefined
    ) {
      return responseUtils.badRequest(response, "400 Bad Request");
    }

    if (emailInUse(email)) {
      return responseUtils.badRequest(response, "400 Bad Request");
    }

    if (name && email && password) {
      const __data = {
        ...dataJson,
        _id: "5558",
        role: "customer",
      };
      return responseUtils.createdResource(response, __data, 201);
    }
    // TODO: 8.4 Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    // Useful methods here include:
    // - validateUser(user) from /utils/users.js
    // - emailInUse(user.email) from /utils/users.js
    // - badRequest(response, message) from /utils/responseUtils.js
    // throw new Error('Not Implemented');
  }
};

module.exports = { handleRequest };
