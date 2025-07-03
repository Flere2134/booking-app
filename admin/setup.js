const db = firebase.firestore();

// Function to add an admin user
async function addAdminUser(uid, userData = {}) {
  try {
    await db.collection("admins").doc(uid).set({
      uid: uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...userData
    });
    console.log("Admin user added successfully!");
    showNotification("Admin user added successfully!", "success");
    loadAdminsList();
    return true;
  } catch (error) {
    console.error("Error adding admin user:", error);
    showNotification("Error adding admin user: " + error.message, "error");
    return false;
  }
}

// Make function globally available for console access
window.addAdminUser = addAdminUser;

// Load current admins
async function loadAdminsList() {
  const adminsList = document.getElementById("adminsList");
  adminsList.innerHTML = "Loading...";
  
  try {
    const snapshot = await db.collection("admins").get();
    
    if (snapshot.empty) {
      adminsList.innerHTML = "<p>No admins found.</p>";
      return;
    }
    
    adminsList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const adminItem = document.createElement("div");
      adminItem.className = "admin-item";
      adminItem.innerHTML = `
        <p><strong>User ID:</strong> ${data.uid}</p>
        <p><strong>Created:</strong> ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}</p>
        <hr>
      `;
      adminsList.appendChild(adminItem);
    });
    
  } catch (error) {
    console.error("Error loading admins:", error);
    adminsList.innerHTML = "<p>Error loading admins: " + error.message + "</p>";
  }
}

// Auth state change
firebase.auth().onAuthStateChanged(async (user) => {
  const nav = document.getElementById("navLinks");
  const currentUserInfo = document.getElementById("currentUserInfo");
  const makeCurrentUserAdminBtn = document.getElementById("makeCurrentUserAdmin");

  if (user) {
    const name = user.displayName || "User";
    currentUserInfo.innerHTML = `
      <strong>Logged in as:</strong> ${name}<br>
      <strong>Email:</strong> ${user.email}<br>
      <strong>User ID:</strong> ${user.uid}
    `;
    
    makeCurrentUserAdminBtn.disabled = false;
    
    nav.innerHTML = `
      <a href="../dashboard/dashboard.html" class="nav-text-link">Dashboard</a>
      <a href="admin.html" class="nav-text-link">Admin Panel</a>
      <div class="user-dropdown">
        <button class="btn dropdown-toggle">${name} <i class='bx bx-chevron-down'></i></button>
        <div class="dropdown-menu">
          <a href="#" id="logoutBtn">Log out</a>
        </div>
      </div>
    `;
    
    document.getElementById("logoutBtn").addEventListener("click", () => {
      firebase.auth().signOut().then(() => {
        window.location.href = "../dashboard/dashboard.html";
      });
    });
    
    document.querySelector('.dropdown-toggle')?.addEventListener('click', () => {
      document.querySelector('.dropdown-menu')?.classList.toggle('show');
    });
    
    // Load admins list
    loadAdminsList();
    
  } else {
    currentUserInfo.textContent = "Not logged in";
    makeCurrentUserAdminBtn.disabled = true;
    nav.innerHTML = `
      <a href="../authentication/login.html"><button class="btn">Log in</button></a>
      <a href="../authentication/register.html"><button class="btn">Sign up</button></a>
    `;
  }
});

// Event listeners
document.getElementById("makeCurrentUserAdmin").addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (user) {
    await addAdminUser(user.uid, {
      email: user.email,
      displayName: user.displayName
    });
  }
});

document.getElementById("addSpecificAdmin").addEventListener("click", async () => {
  const userIdInput = document.getElementById("userIdInput");
  const userId = userIdInput.value.trim();
  
  if (!userId) {
    showNotification("Please enter a User ID", "error");
    return;
  }
  
  await addAdminUser(userId);
  userIdInput.value = "";
});

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1001;
    animation: slideIn 0.3s ease;
    ${type === "success" ? "background-color: #4CAF50;" : "background-color: #F44336;"}
  `;
  notification.textContent = message;
  
  // Add animation styles
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}