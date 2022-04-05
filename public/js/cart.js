
const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  addProductToCart(productId);
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  console.log("removed!");
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  const count = decreaseProductCount(productId);
  updateProductAmount(productId);
  if (count === 0) removeElement('cart-container', productId);
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  const count = getProductCountFromCart(productId);
  const amountShow = document.querySelector(`#amount-${productId}`);
  amountShow.textContent = `${count}x`;
};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  const allProducts = getAllProductsFromCart();
  createNotification("Successfully created an order!", "notifications-container");
  
 // for (const product of allProducts) {
  //   let {name:id} = product;
  //   removeElement('cart-container', id);
  // }

  allProducts.map((product) => {
    let {name:id} = product;
    removeElement('cart-container', id);

  })
 
  clearCart();
};

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to 
  //        enable editing ith 
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used 
  //        to select all elements with each of those classes, then its 
  //        just up to finding the right index.  querySelectorAll() can be 
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of 
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something 
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart 
  const cartContainer = document.querySelector("#cart-container");

  const products = await getJSON("/api/products");
  const productsFromCart = getAllProductsFromCart();

  const itemTemplate = document.querySelector("#cart-item-template");

  document.querySelector('#place-order-button').addEventListener('click', () => placeOrder());

  productsFromCart.map((product) =>  {
    let {name:id, amount} = product;
    if (amount === "NaN") amount = 0;
    const productInfo = products.find(product => product._id == id);
    const {price, name} = productInfo;
    
        const clone = itemTemplate.content.cloneNode(true);

        clone.querySelector('.item-row').id = id;
        clone.querySelector('h3').id = `name-${id}`;
        clone.querySelector('h3').textContent = name;
        clone.querySelector('.product-price').id = `price-${id}`;
        clone.querySelector('.product-price').textContent = price;
        clone.querySelector('.product-amount').id = `amount-${id}`;
        clone.querySelector('.product-amount').textContent = `${amount}x`;

        let buttons = clone.querySelectorAll('button');
        buttons.item(0).id = `plus-${id}`;
        buttons.item(0).addEventListener('click', () => addToCart(id));
        buttons.item(1).id = `minus-${id}`;
        buttons.item(1).addEventListener('click', () => decreaseCount(id));

        cartContainer.appendChild(clone);

  })
  // for (const product of productsFromCart) {
    
  // };
})();