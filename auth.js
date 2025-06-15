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

function createPasswordToggle(inputId) {
  const passwordInput = document.getElementById(inputId);
  if (!passwordInput) return;

  // Wrap input in a div
  const wrapper = document.createElement('div');
  wrapper.classList.add('password-wrapper');
  passwordInput.parentNode.insertBefore(wrapper, passwordInput);
  wrapper.appendChild(passwordInput);

  // Create icon
  const icon = document.createElement('i');
  icon.classList.add('bx', 'bx-show', 'toggle-password');
  wrapper.appendChild(icon);

  // Toggle logic
  icon.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';

    // Toggle icon class
    icon.classList.toggle('bx-show', !isHidden);
    icon.classList.toggle('bx-hide', isHidden);
  });
}

// Run when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  createPasswordToggle('password');
  createPasswordToggle('loginPassword');
});

// Register
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.updateProfile({
        displayName: name
      }).then(() => {
        console.log("Display name updated:", user.displayName);
      }).catch((error) => {
        console.error("Failed to update display name:", error);
      });
      firebase.firestore().collection("users").doc(user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      console.log("User data saved to Firestore");
    }).catch((error) => {
      console.error("Failed to save user to Firestore:", error);
    });
      console.log("Registered:", user.email);
      alert(`Welcome, ${name}!`);
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Logged in:", user.email);
      alert(`Welcome back, ${user.email}`);
    })
    .catch((error) => {
      alert(error.message);
    });
});



