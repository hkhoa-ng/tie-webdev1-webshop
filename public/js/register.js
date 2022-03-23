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
const  comparePasswords = (p1, p2) => {
  return p1 === p2;
};

document.querySelector('#btnRegister').addEventListener('click', (event) => {
  event.preventDefault();

  // Validate password
  const password = document.querySelector('#password')
  const passwordConfirmation = document.querySelector('#passwordConfirmation')
  if (!comparePasswords(password.value, passwordConfirmation.value)) {
      const container = passwordConfirmation.parentNode;
      container.id = "pswd-confirmation-container";
      createNotification('Passwords do not match', container.id, false);
  } else {
    // Same passwords => create new user
    const form = document.querySelector('#register-form');
    const formData = new FormData(form);
    const data = {};
    formData.forEach(function(value, key) {
        data[key] = value;
    })
    postOrPutJSON('/api/register','POST', data);
  }

});
