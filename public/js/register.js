const  comparePasswords = (p1, p2) => {
  return p1 === p2;
};

// DONE: 8.4 Handle user registration UI
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
