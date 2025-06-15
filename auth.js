document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    alert("All fields are required.");
    return;
  }

  // Placeholder for backend integration
  alert(`Registered successfully!\nName: ${name}\nEmail: ${email}`);
});

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  // Placeholder for backend login logic
  alert(`Logged in as: ${email}`);
});
