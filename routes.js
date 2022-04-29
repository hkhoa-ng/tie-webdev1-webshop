const responseUtils = require("./utils/responseUtils");
const mongoose = require("mongoose");
const { getCurrentUser } = require("./auth/auth.js");
const http = require("http");
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
const Product = require("./models/product");
const Order = require("./models/order");

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
  "/api/users": ["GET", "PUT", "DELETE"],
  "/api/products": ["GET", "PUT", "POST", "DELETE"],
  "/api/orders": ["POST", "GET"],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response The response to be eddited and return
 * @returns {http.ServerResponse} response The response with options header
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
 * @param {string} prefix the common path to have
 * @returns {boolean} true if the route match, false otherwise.
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
 * @returns {boolean} True if the user id match, false otherwise
 */
const matchUserId = (url) => {
  return matchIdRoute(url, "users");
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} True if the product Id match, false otherwise
 */
const matchProductId = (url) => {
  return matchIdRoute(url, "products");
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} True if the order Id match, false otherwise
 */
const matchOrderId = (url) => {
  return matchIdRoute(url, "orders");
};

/**
 * Check if the user is authorized and valid in the database
 *
 * @param {http.ServerRequest} request  The incoming request with user information
 * @param {http.ServerResponse} response The response that will be eddited and send to user
 * @param {boolean} checkCustomer flag to see if checking the customer is needed
 * @returns {http.ServerResponse} Base on the request, the user receive the equivalent response.
 */
const checkHeader = async (request, response, checkCustomer) => {
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

  if (currentUser === null) {
    // response with basic auth challenge if credentials are incorrect
    return responseUtils.basicAuthChallenge(response);
  }

  // check if the auth header is properly encoded
  const credentials = authorizationHeader.split(" ")[1];
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  // response with basic auth challenge if auth header is not properly encoded
  if (!base64regex.test(credentials)) {
    return responseUtils.basicAuthChallenge(response);
  }

  if (checkCustomer && currentUser.role === "customer") {
    return responseUtils.forbidden(response);
  }

  return null;
};

const handleRequest = async (request, response) => {
  // Find all users
  const users = await User.find({});

  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;
  const urlId = filePath.split("/")[3];

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === "OPTIONS") {
    return sendOptions(filePath, response);
  }

  const currentUser = await getCurrentUser(request);
  let simplifiedFilePath = "";
  const slashCount = [...filePath].filter((char) => char === "/").length;
  if (slashCount === 2) {
    simplifiedFilePath = filePath;
  } else if (slashCount === 3) {
    const removeDetailArr = filePath.split("/");
    removeDetailArr.pop();
    removeDetailArr.shift();
    removeDetailArr.forEach((str) => (simplifiedFilePath += `/${str}`));
  }

  // general API api/users
  if (!(simplifiedFilePath in allowedMethods)) {
    return responseUtils.notFound(response);
  }

  // Check for allowable methods
  if (!allowedMethods[simplifiedFilePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  const acceptHeader = headers["accept"];
  if (acceptHeader === undefined || !acceptHeader.split("/").includes("json")) {
    // There are 2 special cases in put user and put product that need following if
    if (
      method.toUpperCase() === "PUT" &&
      headers["authorization"] === undefined
    ) {
      return responseUtils.basicAuthChallenge(response);
    }
    return responseUtils.contentTypeNotAcceptable(response);
  }
  if (filePath === "/api/products") {
    const headerCheck = await checkHeader(request, response, false).then(
      (data) => data
    );
    if (headerCheck !== null) {
      return headerCheck;
    }

    if (method.toUpperCase() === "GET") {
      return ProductController.getAllProducts(response);
    }

    if (method.toUpperCase() === "POST") {
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }

      if (!isJson(request)) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      const requestBody = await parseBodyJson(request);
      if (requestBody.name === undefined || requestBody.price === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      // Create a new product
      const productData = {
        name: requestBody.name,
        price: requestBody.price,
        image: requestBody.image,
        description: requestBody.description,
      };
      const newProduct = new Product(productData);
      await newProduct.save();
      return responseUtils.createdResource(response, newProduct);
    }
  }

  // GET all users
  if (filePath === "/api/users" && method.toUpperCase() === "GET") {
    // DONE: 8.5 Add authentication (only allowed to users with role "admin")

    const headerCheck = await checkHeader(request, response, true).then(
      (data) => data
    );
    if (headerCheck !== null) {
      return headerCheck;
    }
    if (currentUser.role === "admin") {
      // respond with json when admin credentials are received
      return responseUtils.sendJson(response, users);
    }
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

  if (filePath === "/api/orders") {
    const headerCheck = await checkHeader(request, response, false).then(
      (data) => data
    );

    if (headerCheck !== null) {
      return headerCheck;
    }

    if (method.toUpperCase() === "GET") {
      if (currentUser["role"] === "admin") {
        const adminOrders = await Order.find({});
        return responseUtils.sendJson(response, adminOrders);
      }
      const customerOrders = await Order.find({
        customerId: currentUser["_id"],
      });
      return responseUtils.sendJson(response, customerOrders);
    }

    if (method.toUpperCase() === "POST") {
      if (!isJson(request)) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (currentUser["role"] === "admin") {
        return responseUtils.forbidden(response);
      }

      const requestBody = await parseBodyJson(request);
      if (requestBody["items"].length === 0) {
        return responseUtils.badRequest(response, "Bad Request");
      }
      const { items: orderItems } = requestBody;
      const { product, quantity: productQuantity } = orderItems[0];
      if (productQuantity === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }
      if (product === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }
      if (product["_id"] === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }
      if (product["name"] === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }
      if (product["price"] === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      const id = mongoose.Types.ObjectId(String(currentUser._id));
      const newOrderData = {
        customerId: currentUser._id,
        items: [
          {
            product: {
              _id: product["_id"],
              name: product["name"],
              price: product["price"],
              description: product["description"],
            },
            quantity: productQuantity,
          },
        ],
      };
      const newOrder = await Order.find({ customerId: currentUser._id });
      return responseUtils.createdResource(response, newOrder[0]);
    }
  }
  if (matchUserId(filePath)) {
    const headerCheck = await checkHeader(request, response, true).then(
      (data) => data
    );
    if (headerCheck !== null) {
      return headerCheck;
    }
    if (method.toUpperCase() === "GET") {
      const userToGet = await User.findById(urlId).exec();

      if (userToGet === null) {
        return responseUtils.notFound(response);
      }
      if (currentUser["role"] === "admin") {
        return responseUtils.sendJson(response, userToGet);
      }
    }
    if (method.toUpperCase() === "DELETE" && currentUser.role === "admin") {
      // Find user to be deleted with ID, and then delete and return that user
      const userToBeDeleted = await User.findById(urlId).exec();
      if (userToBeDeleted === null) {
        return responseUtils.notFound(response);
      }
      await User.deleteOne({ _id: urlId });
      return responseUtils.sendJson(response, userToBeDeleted);
    }
    const userChangeRole = await parseBodyJson(request);

    if (method.toUpperCase() === "PUT") {
      const roleToChange = userChangeRole.role;

      if (!roles.includes(roleToChange) || roleToChange === undefined) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (currentUser["role"] === "admin") {
        // Only update user role if role = admin
        const userToChange = await User.findById(urlId).exec();
        if (userToChange === null) {
          return responseUtils.notFound(response);
        }
        userToChange.role = roleToChange;
        await userToChange.save();
        return responseUtils.sendJson(response, userToChange);
      }
    }
  }

  if (matchProductId(filePath)) {
    const headerCheck = await checkHeader(request, response, false).then(
      (data) => data
    );
    if (headerCheck !== null) {
      return headerCheck;
    }

    if (method.toUpperCase() === "GET") {
      const productToGet = await Product.findById(urlId).exec();
      if (productToGet === null) {
        return responseUtils.notFound(response);
      }
      return responseUtils.sendJson(response, productToGet);
    }

    if (method.toUpperCase() === "PUT") {
      const productRequestBody = await parseBodyJson(request);
      const { name, price, image, description } = productRequestBody;

      if (currentUser["role"] === "customer") {
        return responseUtils.forbidden(response);
      }

      if (name === " ") {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (isNaN(price) || price === 0 || price <= 0) {
        return responseUtils.badRequest(response, "Bad Request");
      }

      if (currentUser["role"] === "admin") {
        const productToUpdate = await Product.findById(urlId);

        if (productToUpdate === null) {
          return responseUtils.notFound(response);
        }
        productToUpdate["name"] = name;
        productToUpdate["price"] = price;
        if (image !== undefined) {
          productToUpdate["image"] = image;
        }
        if (description !== undefined) {
          productToUpdate["description"] = description;
        }
        productToUpdate.save();
        return responseUtils.sendJson(response, productToUpdate);
      }
    }

    if (method.toUpperCase() === "DELETE") {
      if (currentUser["role"] === "customer") {
        return responseUtils.forbidden(response);
      }
      if (currentUser["role"] === "admin") {
        const productToDelete = await Product.findById(urlId);
        if (productToDelete === null) {
          return responseUtils.notFound(response);
        }
        await Product.deleteOne({ _id: urlId });
        return responseUtils.sendJson(response, productToDelete);
      }
    }
  }

  if (matchOrderId(filePath)) {
    const headerCheck = await checkHeader(request, response, false).then(
      (data) => data
    );
    if (headerCheck !== null) {
      return headerCheck;
    }

    if (method.toUpperCase() === "GET") {
      const orderToGet = await Order.findById(urlId);
      if (orderToGet === null) {
        return responseUtils.notFound(response);
      }
      if (currentUser["role"] === "admin") {
        return responseUtils.sendJson(response, orderToGet);
      }
      if (String(orderToGet["customerId"]) !== String(currentUser["_id"])) {
        return responseUtils.notFound(response);
      }
      return responseUtils.sendJson(response, orderToGet);
    }
  }
};

module.exports = { handleRequest };
