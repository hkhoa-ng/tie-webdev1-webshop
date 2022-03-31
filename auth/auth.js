// const { createNotification } = require("../public/js/utils");
const {
  // acceptsJson,
  getCredentials,
  // isJson,
  // parseBodyJson,
} = require("../utils/requestUtils");
// require user model
const User = require("../models/user");

// const {
//   deleteUserById,
//   emailInUse,
//   getAllUsers,
//   getUser,
//   getUserById,
//   resetUsers,
//   saveNewUser,
//   updateUserRole,
//   validateUser,
// } = require("../utils/users.js");
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
  // DONE: 8.5 Implement getting current user based on the "Authorization" request header
  const credentials = getCredentials(request);
  const userEmail = credentials[0];
  const userPassword = credentials[1];
  if (credentials.length === 0) {
    console.log("No credentials!");
    return null;
  }
  // const currentUser = await getUser(credentials[0], credentials[1]);
  const currentUser = await User.findOne({ email: userEmail }).exec();
  if (currentUser === null) {
    console.log("Found no user with given email!");
    return null;
  }
  const isPasswordCorrect = await currentUser.checkPassword(userPassword);
  // isPasswordCorrect ? "await currentUser" : "null";
  if (!isPasswordCorrect) {
    return currentUser;
  }
  return null;
};

module.exports = { getCurrentUser };
