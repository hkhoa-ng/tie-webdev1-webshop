const responseUtils = require("../utils/responseUtils");
// const usersJson = {
//   users: require("../users.json").map((user) => ({ ...user })),
// };
const User = require("../models/user");
const roles = ["customer", "admin"];

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};


const validateUser = (user) => {
  const pwdRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  const errors = [];

  
  if (!validateEmail(user['email'])) errors.push("Invalid email");
  if (user.email === undefined) errors.push("Missing email");
  if (user.name === undefined) errors.push("Missing name");
  if (user['password'] === undefined) {
    errors.push("Missing password");
  }
  if (String(user.password).length < 10) errors.push("Password too short");

  return errors;
};

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllUsers = async response => {
  const allUsers = await User.find({});

  try {
    return responseUtils.sendJson(response, allUsers);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async(response, userId, currentUser) => {
  // TODO: 10.2 Implement this
  const userToDelete = await User.findById(userId).exec();
  if (userToDelete === null) {
    return responseUtils.notFound(response);
  }
  if (String(userId) === String(currentUser['_id'])) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  await User.deleteOne({ _id: userId }).exec();
  return responseUtils.sendJson(response, userToDelete);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async(response, userId, currentUser, userData) => {
  const userToUpdate = await User.findById(userId);
  if (userToUpdate === null) {
    return responseUtils.notFound(response);
  }
  if (String(userId) === String(currentUser['_id'])) {
    return responseUtils.badRequest(response, "Updating own data is not allowed");
  }
  if (userData['role'] === undefined) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  if (!roles.includes(userData['role'])) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  userToUpdate['role'] = userData['role'];
  await userToUpdate.save();
  return responseUtils.sendJson(response, userToUpdate); 
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async(response, userId, currentUser) => {
  // TODO: 10.2 Implement this
  const userToFind = await User.findById(userId).exec();
  if (userToFind === null) {
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, userToFind);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
const registerUser = async(response, userData) => {
  const user = await User.findOne({ email: userData.email }).exec();
  const errors = validateUser(userData);

  if (errors.length > 0) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  if (user !== null) {
    return responseUtils.badRequest(response, "Bad Request");
  }
  const newUser = new User(userData);
  newUser['role'] = "customer";
  await newUser.save();

  return responseUtils.createdResource(response, newUser);
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };