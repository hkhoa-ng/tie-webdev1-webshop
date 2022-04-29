# Web Development 1 - Group 23 - Group Work Repository

This is the main repository of our group work's project. We created a simple web shop application with vanilla JavaScript, run and deploy with MongoDB Atlas and Heroku!

## Group Information: Member and Work share

- **Member 1**: Ahmad Sharif, ahmad.sharif@tuni.fi, K436765. Work share:

  1. 8.4.1 User Registration - Backend
  2. 10.2 MVC - user stories as GitLab issues
  3. 10.2.1 Issues for upcoming MVC features
  4. 10.3 MVC - Mocha test cases for GitLab issues
  5. 10.3.1 Test case place holders written reflect the issues
  6. 10.4 MVC - refactoring application
  7. 10.4.1 Split routes.js's handleRequest (request, response) into files, modules and functions
  8. 10.5 Setting up and using the GitLab CI pipeline
  9. 10.5.1 Continuous integration with Gitlab
  10. 10.6.1 Functional Programming
      </br>

- **Member 2**: An Nguyen, an.nguyen@tuni.fi, 50359099 . Work share:
  1. 8.6 Method POST and DELETE for user - Backend.
  2. 8.7 First use of Eslint and fix errors show on it.
  3. 9.4 Connect URL and its secure handling.
  4. 9.5 User Mongoose Schema.
  5. 9.6 Refractor application to use Mongoose Schema.
  6. 11.2.2 Comment and fix all problems/errors shown by JSDOC grader.
  7. 11.2.3 Register and deploy the app front end on Heroku, database on MongoDB Atlas.
- **Member 3**: Khoa Nguyen, khoa.h.nguyen@tuni.fi, 50359141. Work share: I handle most of the frontend behavior of the server (adding product, deleting users, updating shopping cart, placing orders, etc.). In the 11th round, I fixed most of the Mocha tests.
  1. 8.4.1 User Registration - Frontend. Updating new user registration and update the registration form.
  2. 8.5 User Authentication - Handling the Authentication header from the requests. Server send back correct Basic Authorization Challenge when the Authentication header is incorrect.
  3. 9.2 Session storage - Front to backend communication between client and server. Updating the GUI based on user's action. Saving user's Cart into the SessionStorage.
  4. 11.2.1 Mocha grader - Fixing most of Mocha's tests. Including Auth tests, Controller tests, Routes tests, and UI tests.
  5. 11.2.4 Check and remove unnecessary comments and code, following Eslint convention.

</br>

## Node Project Structure

The project's structure consists of 3 main components: the **models** for database handling, the **controller** to control the behavior of components, and the **GUI** to view the data.

</br>

## Page and Navigation

</br>

## Data Models

The project uses MongoDB for its database, and we created 3 Data Model Schemas for **User**, **Product**, and **Order**. These models can be manipulated to control the database of the application.

For

### **User**

The data model for the user contains these fields:

### **Product**

### **Order**

</br>

## Security Concerns

There are several security vulnerabilities that our web application has, and we did several things to mitigate them:

1. Sanity check
2. Do

</br>

## Testing

We tested the Data Models that we created, using self-defined tests.

1. Test **Product**
   - It has all keys: name, price, description.
   - Price is a valid number.
   - Database data and API data equality comparison 02.
2. Test **User**
   - User email. Email should be a valid email and is not missing.
   - User Password. Password should not be too short.
   - Delete User.
   - User has all valid keys: name, email, password, role.
   - User Role check.
   - User Registration Check.

We also use the provided Mocha tests to test all the other functionalities of the application accordingly.
Through testing, we did modified the test a little to suit our needs (skipping passed tests so that the tests can run faster), but in the end, we make sure that all tests passed.

</br>

## Finalization

ToDo:

In Addition, I helped to fix setup issues, Like MongoDB connection. npm run test error issues.

......

TODO: list the security threats represented in the course slides.
Document how your application protects against the threats.
You are also free to add more security threats + protection here, if you will.

_Good luck and happy group workin'!_
