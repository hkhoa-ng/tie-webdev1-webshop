
/**
api/register
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

/**
 * Functions for modifying and deleting users.
 */

 (async() => {
  const element = document.querySelector('#btnRegister');
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const passwordConfirmation = document.querySelector('#passwordConfirmation').value;

  console.log(name, '___________ name');

  element.addEventListener('click', (event) => {
      event.preventDefault();

      __user_data = {
          "name": name,
          "email": email,
          "password": password,
          "passwordConfirmation": passwordConfirmation
      }


      try {
        const user = await postOrPutJSON(`/api/register`, 'POST', __user_data);
        return createNotification(`Updated`, 'notifications-container');
      } catch (error) {
        console.error(error);
        return createNotification('Update failed!', 'notifications-container', false);
      }


  });

 
})();
