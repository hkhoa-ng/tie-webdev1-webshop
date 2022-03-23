const addToCart = (productId, productName) => {
  // TODO 9.2
  // you can use addProductToCart(), available already from /public/js/utils.js
  // for showing a notification of the product's creation, /public/js/utils.js  includes createNotification() function
  addProductToCart(productId);
  let message = "Added ${productName} to cart!";
  let notificationId = "notifications-container";
  createNotification(message, notificationId);
};

(async() => {
  //TODO 9.2 
  // - get the 'products-container' element from the /products.html
  // - get the 'product-template' element from the /products.html
  // - save the response from await getJSON(url) to get all the products. getJSON(url) is available to this script in products.html, as "js/utils.js" script has been added to products.html before this script file 
  // - then, loop throug the products in the response, and for each of the products:
  //    * clone the template
  //    * add product information to the template clone
  //    * remember to add an event listener for the button's 'click' event, and call addToCart() in the event listener's callback
  // - remember to add the products to the the page
  const baseContainer = document.querySelector("#products-container");
  const productTemplate = document.querySelector("#product-template");

  try {
    const products = await getJSON('/api/products');

    // Loop through each product
    products.forEach(product => {
      const {_id: id, name, description, price} = product;
      const productContainer = productTemplate.textContent.cloneNode(true);

      userContainer.querySelector('.product-name').id = `name-${id}`;
      userContainer.querySelector('.product-description').id = `description-${id}`;
      userContainer.querySelector('.product-price').id = `price-${id}`;
      userContainer.querySelector('button').id = `add-to-cart-${id}`;
      userContainer.querySelector('button').addEventListener('click', () => addToCart(id, name));

      baseContainer.append(productContainer);
    });

  } catch (error) {
    console.error(error);
    return createNotification(
      'There was an error while fetching products',
      'notifications-container',
      false
    );
  }

  
})();

