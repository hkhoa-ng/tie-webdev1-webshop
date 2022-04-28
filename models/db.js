const mongoose = require("mongoose");
require("dotenv").config();
/**
 * Get database connect URL.
 *
 * Returns the MongoDB connection URL from DBURL environment variable,
 * or if the environment variable is not defined, return the default URL
 * mongodb://localhost:27017/WebShopDb
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  const path = process.env.DBURL;
  const defaultUrl = "mongodb://localhost:27017/WebShopDb";
  if (!path) {
    return defaultUrl;
  }
  return path;
};

/**
 * Connect to the database if the program is not yet connected.
 */
function connectDB() {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true,
      })
      .then(() => {
        mongoose.connection.on("error", (err) => {
          console.error(err);
        });

        mongoose.connection.on("reconnectFailed", handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * Throw error when it's detected
 *
 * @param {string} err The detected error.
 */
function handleCriticalError(err) {
  console.error(err);
  throw err;
}

/**
 * Disconnect from the Mongo database
 */
function disconnectDB() {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };
