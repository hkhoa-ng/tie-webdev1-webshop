const { getCredentials } = require("../utils/requestUtils");

const User = require("../models/user");

const http = require("http");
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request The incoming user information authentication.
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
  // Check for Authorization header
  const authHeader = request.headers["authorization"];
  // Return null if Authorization header is missing/empty, or if Authorization type is not "Basic"
  if (authHeader === undefined || authHeader === "") {
    return null;
  }
  // Return null if Authorization header is not Basic
  const authType = authHeader.split(" ")[0];
  if (authType !== "Basic") {
    return null;
  }
  const credentials = getCredentials(request);
  const userEmail = credentials[0];
  const userPassword = credentials[1];
  if (credentials.length === 0) {
    return null;
  }
  // const currentUser = await getUser(credentials[0], credentials[1]);
  const currentUser = await User.findOne({ email: userEmail }).exec();
  if (currentUser === null) {
    return null;
  }
  const isPasswordCorrect = await currentUser.checkPassword(userPassword);
  if (!isPasswordCorrect) {
    return null;
  }
  return currentUser;
};

module.exports = { getCurrentUser };
