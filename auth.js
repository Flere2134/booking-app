// 🔐 PASSWORD TOGGLE HANDLER
function initPasswordToggles() {
  const toggles = document.querySelectorAll('.toggle-password');

  toggles.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetSelector = icon.getAttribute('toggle');
      const input = document.querySelector(targetSelector);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';

      icon.classList.toggle('bx-show', !isHidden);
      icon.classList.toggle('bx-hide', isHidden);
    });
  });
}

// ✅ REGISTER HANDLER
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    alert("All fields are required.");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user.updateProfile({ displayName: name }).then(() => {
        return firebase.firestore().collection("users").doc(user.uid).set({
          name: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    })
    .then(() => {
      window.location.href = "login.html"; // ✅ Redirect to login
    })
    .catch((error) => {
      alert(error.message);
    });
});

// ✅ LOGIN HANDLER
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html"; // ✅ Redirect to dashboard
    })
    .catch((error) => {
      alert(error.message);
    });
});

// ✅ DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
});