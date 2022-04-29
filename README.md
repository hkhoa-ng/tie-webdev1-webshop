# Web Development 1 - Group 23 - Group Work Repository

This is the main repository of our group work's project. We created a [web shop application](https://webdev1shop.herokuapp.com/) with vanilla JavaScript, run and deploy with MongoDB Atlas and Heroku!

<br/>

---

## Group Information: Member and Work share

Our group has 3 members, and we coordinate our work using Telegram and GitLab.

- **Member 1**: Ahmad Sharif, ahmad.sharif@tuni.fi, `K436765`. Work share:

  1. In part **8.4.1 User Registration**: Handle backend when new user register for the service.
  2. In part **10.2 MVC**: Creating user stories as GitLab issues.
  3. In part **10.2.1 Issues for upcoming MVC features**: We can now test our app based on those!
  4. In part **10.3 MVC**: Creating corresponding Mocha test cases for GitLab issues.
  5. In part **10.3.1 Test case place holders**: Written test cases that reflect the issues.
  6. In part **10.4 MVC** - refactoring application
  7. In part **10.4.1 Split routes.js's handleReques(request, response)**: Split this massiive file into sub-files, modules and functions.
  8. In part **10.5 Setting up and using the GitLab CI pipeline**: Setting up the Gitlab CI Pipeline for automate testing.
  9. In part **10.5.1 Continuous integration with Gitlab**
  10. In part **10.6.1 Functional Programming**: Re-write our code so that it doesn't use any form of `for-` or `while-` loop.
      </br>

- **Member 2**: An Nguyen, an.nguyen@tuni.fi, `50359099`. Work share:
  1. In part **8.6 Modifying and Deleting Users** - Allow us to update user information, and delete users from the database (of course, if the role is Admin).
  2. In part **8.7 Hello ESLint!** - Adding ESLint so that our team can code according to the conventions defined.
  3. Setup MongoDB:
     - In part **9.4 Connect URL and its secure handling**: setup the `.env` file to run MongoDB Connect URL.
     - In part **9.5 Mongoose Schema**: Define the Mongoose Schema `User` for the users of the application.
     - In part **9.6 Modifying Application to Use Database**: together with Khoa, make sure that the app can use the newly created database in MongoDB.
  4. In part **11.2.1 Mocha grader**: Help Khoa fixing `routes.js` so that the Mocha tests pass.
  5. In part **11.2.2 JSDoc Grader**: Commenting the codes with JSDoc, so that the structure is clear.
  6. In part **11.2.3 Going online with MongoDB Atlas and Heroku!**: Setup and deploy the application to Heroku. Now we can use our app on the cloud, hooray!
  7. In part **11.2.4 ESLint Grader** and **11.2.5 ESLint with functional programming grader**: Use ESLint to make sure that our code base meets the coding convention.
- **Member 3**: Khoa Nguyen, khoa.h.nguyen@tuni.fi, `50359141`. Work share: I handle most of the frontend behavior of the server (adding product, deleting users, updating shopping cart, placing orders, etc.). In the 11th round, I fixed most of the Mocha tests.
  1. In part **8.4.1 User Registration**: Frontend. Updating new user registration and update the registration form.
  2. In part **8.5 User Authentication**: Handling the Authentication header from the requests. Server send back correct Basic Authorization Challenge when the Authentication header is incorrect.
  3. In part **9.2 Session storage**: Front to backend communication between client and server. Updating the GUI based on user's action. Saving user's Cart into the SessionStorage.
  4. In part **9.6 Modifying Application to Use Database**: modifying the app so that it can use the newly created Data Model schemas. Now our app has its database in MongoDB!
  5. In part **11.2.1 Mocha grader**: Fixing most of Mocha's tests. Including Auth tests, Controller tests, Routes tests, and UI tests.
  6. In part **11.2.4 ESLint Grader** and **11.2.5 ESLint with functional programming grader**: Help An to format our code according to the coding conventions defined.
  7. Updating the `README.md` to document the project.
  8. Provide help for other team members when needed.

</br>

---

## Node Project Structure

The project's structure consists of 3 main components: the **models** for database handling, the **controller** to control the behavior of components, and the **Views (UI)** to view the data. Together, they formed the _MVC Architecture_ for the project.

### **Models**

Including `User`, `Product`, and `Order` model. These are all work under the MongoDB's database model, the `db` model.

### **Controllers**

The controllers that control the data models including the `User Controller` in `./controllers/users.js` and `Product Controller` in `./controllers/products.js`

Apart from those, we also have the `./routes.js` controller to control the routing and checking the client's request. And the `./auth/auth.js` to authorize user's access to the page.

### **Views**

The UI of the service is control by the files in `./public/js/*.js`, including updating and registering users, updating the shopping cart, and displaying the available products of the service.

The project structure can be presented using the UML diagram as follow.

</br>

---

## Page and Navigation

When user come to the page of [Our Service](https://webdev1shop.herokuapp.com/), they will land on the [Front Page](https://webdev1shop.herokuapp.com/index.html) of our site. From there, the user can use the nav bar at the top of the page to navigate to the other pages of the service. If the user just first came to the site, they can register at our [Register Page](https://webdev1shop.herokuapp.com/register.html). After becoming a user, they can have access to the other pages of the service:

- The [List Users](https://webdev1shop.herokuapp.com/users.html) page, where admin users can view all the registered users in the database of the app. The admin can also update user information from here.
- The [List Products](https://webdev1shop.herokuapp.com/products.html) page, where users can view all the products that the service has to offer. And of course, they can freely add those products to their shopping cart for later purchase!
- The [Shopping Cart](https://webdev1shop.herokuapp.com/cart.html) page, where users can view all the products that they have added to their cart. They can modify the quantity of each product, and make an order from here!

Be mindful that, in order to access those page, the user will be prompted to log in with the login pop-up window. Only then, they can view the content of the 3 aforementioned pages.

The navigation of the page can be present with a diagram below.

  </br>

---

## Data Models

The project uses MongoDB for its database, and we created 3 Data Model Schemas for **User**, **Product**, and **Order**. These models can be manipulated to control the database of the application.

When using the service, these models will be updated accordingly, and as a result, the database in MongoDB will be updated too. Hooray!

### **User**

Data model for all the users of the service. Can be viewed in the [List Users](https://webdev1shop.herokuapp.com/users.html) page of the service. The data model for the user contains these fields:

- `name`: the name of the user. Is of type `String`. Always required for an user.
- `email`: the email of the user. Is of type `String`. Always required for an user. The email will be checked to be a valid email address before creating/updating the user.
- `password`: the password of the user. Is of type `String`. Always required for an user. The password will be hashed before saving into the database to ensure security.
- `role`: the role of the user. Is of type `String`. Always required for an user. There are 2 roles: `customer` (the default role) and `admin` (can modify data in the service).

### **Product**

Data model for all the products listed on the [List Products](https://webdev1shop.herokuapp.com/products.html) page of the service. The data model for the product contains these fields:

- `name`: the name of the product. Is of type `String`. Always required for a product.
- `price`: the price of the product. Is of type `Number`. Always required for a product. Price cannot be 0 or negative values.
- `image`: the image URL of the product. Is of type `String`. Is not required for a product.
- `description`: the description of the product. Is of type `String`. Is not required for a product.

### **Order**

Data model for an order made by an user of the service. The data model for the product contains these fields:

- `customerId`: the ID of the customer that made this order. Is of type `ObjectId`. Always required for an order.
- `items`: the items that order contains. Is of type `Array`. This array will store multiple `Object` that has the following fields:
  - `product`: the `product` that this `Object` represent. The information stored in this object is the same as the corresponding product.
  - `quantity`: the number of this particular product that this user has ordered. Is of type `Number`. Always required for an order.

Using these Data Model, the service can function correctly by manipulating the database with consistent from front to backend and vice-versa.

</br>

---

## Security Concerns

There are several security vulnerabilities that our web application can have:

- Cross-site scripting.
- Injection attacks.
- Directory traversal.

And we did several things to mitigate them:

- Using **HTTP Authentication Header** and **Basic Authentication** to validate a request that is sent to the server.
- Using **HTTP Accept Header** to make sure that the client accept the returned data type `application/json`.
- Using **Form-based login** so that the data of each user is only accessible by that user.
- Using **Session-based authorization**, so that the authorization of our server is stored in our **Session Storage**
- Using **Role-based access control** by assigning each user a role (either `customer` or `admin`, only `admin` users can modify the server database).
- Define **allowed methods** in the request file path, so that no unauthorized methods can be performed.
- Our users' passwords are **hashed** before storing into the service's database to ensure security.

</br>

---

## Testing

We tested the Data Models that we created, using self-defined tests.

1. Test **Product**
   - It has all keys: `name`, `price`, and `description`.
   - `price` is a valid number.
   - Database data and API data equality comparison.
2. Test **User**
   - User `email`. Email should be a valid email and is not missing.
   - User `Password`. Password should not be too short.
   - Delete User.
   - User has all valid keys: `name`, `email`, `password`, and `role`.
   - User `role` check.
   - User Registration Check.

We also use the provided Mocha tests to test all the other functionalities of the application accordingly.
Through testing, we did modified the test a little to suit our needs (skipping passed tests so that the tests can run faster), but in the end, we make sure that all tests passed.

</br>

---

## Finalization

### **What have we achieved?**

Without a doubt, this course is very challenging for us, but we learned a lot throughout the process. We managed to build this web app using only vanilla JavaScript and Node.js! It goes without saying that handle routings, security, data persistent, and UI controlling without any frameworks is very hard. But now we understand, how those process are handled and what to keep in mind when tackling these problems.

With the project completed, we also learned valuable lessons for our programming skills, especially how to debug efficiently. With JavaScript being a dynamic language, debugging is quite tedious. We also learned to utilized JavaScript's Functional Programming `map`, `filter`, and `reduce` in our algorithm. And also, Googling skill! Or how we can find solution to our problems by searching on the net. Those are very helpful skills for our future as developers for sure!

For testing the project, we modified the `package.json` file a bit to fit our need, and to make sure that the tests can be run. We included our self-written tests for the GitLab issues in there, so it should automatically test. To run the test, do the following steps:

1. Make sure that `npm` is install on your machine and your can run:

```
$ npm
```

commands in your bash.

<br/>

2. Navigate to the project's directory, and run:

```
$ npm install
```

to install the dependencies defied in the `package.json` files. This should take no more than a few minutes, depend on your internet connection. Compare to the default `package.json` files provided for us by the course, we added the `lodash.zip` module so that the FP-lint tests can be performed.

<br/>

3. Now, you can run these commands to test our code:

```
$ npm run reset-db			// Reset MongoDB's database
$ npm test							// Run Mocha tests + GitLab issues test
$ npm run eslint				// Test with ESLint to check for coding conventions
$ npm run jsdoc-lint		// Test for JSDoc documentations
$ npm run fp-lint				// Test for functional programming conventions
```

Note, that if you cannot run the last command

```
$ npm run fp-lint			// Test for functional programming conventions
```

you can try

```
$ npm i --save lodash
$ npm i --save lodash.zip
```

to manually install `lodash` and `lodash.zip` modules.
