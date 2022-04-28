const chai = require('chai');
const expect = chai.expect;
const { createResponse } = require('node-mocks-http');

const {
     getAllUsers,
     registerUser,
     deleteUser,
     viewUser,
     updateUser
   } = require('../../controllers/users');


const responseUtils = require('../../utils/responseUtils');
const { getAllProducts } = require('../../controllers/products');
const Product = require('../../models/product');
const User = require('../../models/user');



const users = require('../../setup/users.json').map(user => ({ ...user }));
const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

describe('Test Product', () => {
     
      it('Product should be an object and have all valid property', async () => {
          let single_product = await Product.findOne({});
               single_product = JSON.parse(JSON.stringify(single_product));
               expect(single_product).to.be.an('object');
               expect(single_product).to.include.all.keys('_id', 'name', 'price', 'description');
               expect(single_product.price).to.be.a('number');
        
      });


      it('Product API Checking', async () => {
          let product_list = await Product.find({});
              product_list = JSON.parse(JSON.stringify(product_list));
          const response = createResponse();
          await getAllProducts(response);
          expect(response.getHeader('content-type')).to.equal('application/json');
          expect(response._isJSON()).to.be.true;
          expect(response._getJSONData()).to.be.deep.equal(product_list);


 
     });

      
});



  describe('Test User', () => {

     let response;

     beforeEach(async () => {
          await User.deleteMany({});
          await User.create(users);
      
          currentUser = await User.findOne({ email: adminUser.email }).exec();
          customer = await User.findOne({ email: customerUser.email }).exec();
          response = createResponse();
        });

     it('User should be an object', async () => {


          let single_user = await User.findOne({});
              single_user = JSON.parse(JSON.stringify(single_user));

          expect(single_user).to.be.an('object');
          expect(single_user).to.include.all.keys('_id', 'name', 'email', 'password', 'role');


        
      });

     it('Get current user', async () => {
          const testEmail = `test${adminUser.password}@email.com`;
          const userData = { ...adminUser, email: testEmail };
          await registerUser(response, userData);
          const createdUser = await User.findOne({ email: testEmail });
    
          expect(response.statusCode).to.equal(201);
          expect(response.getHeader('content-type')).to.equal('application/json');
          expect(response._isJSON()).to.be.true;
          expect(response._isEndCalled()).to.be.true;
          expect(createdUser).to.not.be.null;
          expect(createdUser).to.not.be.undefined;
          expect(createdUser).to.be.an('object');
        
      });

      it('Get user role', async () => {
          let single_user = await User.findOne({});
          single_user = JSON.parse(JSON.stringify(single_user));
          expect(single_user.role).to.be.a('string');
        
      });

     it('Delete User', async () => {
          const userId = currentUser.id.split('').reverse().join('');
          await deleteUser(response, userId, currentUser);
          expect(response.statusCode).to.equal(404);
          expect(response._isEndCalled()).to.be.true;
        
     });

     it('Get single user', async () => {
          let single_user = await User.findOne({});
          single_user = JSON.parse(JSON.stringify(single_user));
          expect(single_user).to.be.an('object');
     });

          
     it('Email Test', async () => {

          const testEmail = adminUser.email;
          const userData = { ...adminUser, email: testEmail };
          await registerUser(response, userData);
    
          expect(response.statusCode).to.equal(400);
          expect(response._isEndCalled()).to.be.true;
         
        
     });

     it('Password Test', async () => {
          const testEmail = `test${adminUser.password}@email.com`;
          const testPassword = adminUser.password.substr(0, 9);
          const userData = { ...adminUser, email: testEmail, password: testPassword };
          await registerUser(response, userData);
          const user = await User.findOne({ email: testEmail }).exec();

          expect(response.statusCode).to.equal(400);
          expect(response._isEndCalled()).to.be.true;
          expect(user).to.be.null;
        
     });

  });