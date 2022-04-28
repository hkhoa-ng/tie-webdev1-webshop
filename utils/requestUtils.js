const http = require("http");
/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request the incoming request to take out the credentials
 * @returns {Array|null} array [username, password] from Authorization header, or null if header is missing
 */
const getCredentials = (request) => {
  const authorization = request.headers["authorization"];
  if (!authorization) return null;
  const array = authorization.split(" ");
  const type = array[0];
  if (type === "Basic") {
    const credentials = array[1];
    // Create a buffer
    const buff = Buffer.from(credentials, "base64");
    // decode buffer as UTF-8
    const credentialsString = buff.toString("utf-8");
    // Get the decoded authorization as array
    const credentialsResult = credentialsString.split(":");
    return credentialsResult;
  } else {
    return null;
  }
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request the request to check from
 * @returns {boolean} if request header accept JSON then true, otherwise false
 */
const acceptsJson = (request) => {
  //Check if the client accepts JSON as a response based on "Accept" request header
  // NOTE: "Accept" header format allows several comma separated values simultaneously
  // as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
  // Do not rely on the header value containing only single content type!
  const acceptHeader = request.headers.accept || "";
  return (
    acceptHeader.includes("application/json") || acceptHeader.includes("*/*")
  );
};

/**
 * Is the client request content type JSON? Return true if it is.
 *
 * @param {http.incomingMessage} request The request with content.
 * @returns {boolean} if request content isJson then true, otherwise false.
 */
const isJson = (request) => {
  if (request.headers["content-type"] === "application/json") {
    return true;
  } else {
    return false;
  }
};

/**
 * Asynchronously parse request body to JSON
 *
 * @param {http.IncomingMessage} request The request with JSON as its content.
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = (request) => {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("error", (err) => reject(err));

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };
