const { createNotification } = require("../public/js/utils");
const {
  acceptsJson,
  getCredentials,
  isJson,
  parseBodyJson,
} = require("../utils/requestUtils");
const {
  deleteUserById,
  emailInUse,
  getAllUsers,
  getUser,
  getUserById,
  resetUsers,
  saveNewUser,
  updateUserRole,
  validateUser,
} = require("../utils/users.js");
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
  // DONE: 8.5 Implement getting current user based on the "Authorization" request header
  const credentials = getCredentials(request);
  const currentUser = await getUser(credentials[0], credentials[1]);
  return currentUser;
};

module.exports = { getCurrentUser };
