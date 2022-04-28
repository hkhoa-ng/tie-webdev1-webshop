
const addToCart = (productId, productName) => {
  // TODO 9.2
  // you can use addProductToCart(), available already from /public/js/utils.js
  // for showing a notification of the product's creation, /public/js/utils.js  includes createNotification() function
  addProductToCart(productId);
  let message = `Added ${productName} to cart!`;
  // document.querySelector('#notifications-container').innerHTML = "";
  let notificationId = "notifications-container";
  createNotification(message, notificationId);
};

(async() => {
  // DONE 9.2 
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
    console.log("Attempting to get Json products");
    const products = await getJSON("/api/products");
    console.log("Got all the products");
    if (products.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No products';
      baseContainer.append(p);
      return;
    }
    products.forEach(product => {
      const {_id: id, name, description, price} = product;
        const productContainer = productTemplate.content.cloneNode(true);

        productContainer.querySelector('h3').id = `name-${id}`;
        productContainer.querySelector('h3').textContent = name;
        productContainer.querySelector('.product-description').id = `description-${id}`;
        productContainer.querySelector('.product-description').textContent = description;
        productContainer.querySelector('.product-price').id = `price-${id}`;
        productContainer.querySelector('.product-price').textContent = price;

        productContainer.querySelector('button').id = `add-to-cart-${id}`;
        productContainer.querySelector('button').addEventListener('click', () => addToCart(id, name));

        baseContainer.appendChild(productContainer);
    });
    // getJSON("/api/products").then(productsJson => {
    //   productsJson.forEach(product => {
    //     const {_id: id, name, description, price} = product;
    //     const productContainer = productTemplate.content.cloneNode(true);

    //     productContainer.querySelector('h3').id = `name-${id}`;
    //     productContainer.querySelector('h3').textContent = name;
    //     productContainer.querySelector('.product-description').id = `description-${id}`;
    //     productContainer.querySelector('.product-description').textContent = description;
    //     productContainer.querySelector('.product-price').id = `price-${id}`;
    //     productContainer.querySelector('.product-price').textContent = price;

    //     productContainer.querySelector('button').id = `add-to-cart-${id}`;
    //     productContainer.querySelector('button').addEventListener('click', () => addToCart(id, name));

    //     baseContainer.appendChild(productContainer);
    //   });
    // });
    
  } catch (error) {
    console.log(error);
    console.error(error);
    createNotification(
      'There was an error while fetching products',
      'notifications-container',
      false
    );
  }
})();