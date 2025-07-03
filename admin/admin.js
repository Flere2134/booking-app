// Wait for Firebase to load
let db;
let allBookings = [];
let filteredBookings = [];
let currentFilter = 'all';
let currentSort = { by: 'createdAt', order: 'desc' };

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhiU_vFXznLI-dDGIWKXKsJtldxD4z940",
  authDomain: "booking-app-a81ec.firebaseapp.com",
  projectId: "booking-app-a81ec",
  storageBucket: "booking-app-a81ec.firebasestorage.app",
  messagingSenderId: "905587671438",
  appId: "1:905587671438:web:c7ad2eb82f7f5003aee4df"
};

// Check if user is an admin
async function checkAdminStatus(uid) {
  try {
    const adminDoc = await db.collection("admins").doc(uid).get();
    return adminDoc.exists;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Function to add an admin user (call this from console to create admin)
async function addAdminUser(uid, userData = {}) {
  try {
    await db.collection("admins").doc(uid).set({
      uid: uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...userData
    });
    console.log("Admin user added successfully!");
    return true;
  } catch (error) {
    console.error("Error adding admin user:", error);
    return false;
  }
}

// Make addAdminUser available globally for console access
window.addAdminUser = addAdminUser;

// Wait for Firebase to be ready before setting up auth
function initializeAuth() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error('Firebase Auth not loaded');
    return;
  }
  
  firebase.auth().onAuthStateChanged(async (user) => {
  const nav = document.getElementById("navLinks");

  if (user) {
    // Temporarily allow any authenticated user to access admin
    // TODO: Implement proper admin checking after setup
    console.log("Admin access granted for user:", user.uid);
    
    const name = user.displayName || "Admin";
    nav.innerHTML = `
      <a href="../dashboard/dashboard.html" class="nav-text-link">Dashboard</a>
      <a href="../activity/activity.html" class="nav-text-link">Activity</a>
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

    // Load all bookings
    await loadAllBookings();
  } else {
    window.location.href = "../authentication/login.html";
  }
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, checking Firebase...');
  console.log('typeof firebase:', typeof firebase);
  
  // Check if Firebase is loaded
  if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded');
    document.getElementById("bookingsList").innerHTML = "<div class='loading'>Error: Firebase not loaded. Check console for details.</div>";
    return;
  }
  
  console.log('Firebase object:', firebase);
  console.log('Firebase apps:', firebase.apps);
  
  // Initialize Firebase if not already initialized
  if (!firebase.apps.length) {
    console.log('Initializing Firebase...');
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized');
  }
  
  // Initialize Firestore
  console.log('Initializing Firestore...');
  db = firebase.firestore();
  console.log('Firestore initialized:', db);
  
  // Initialize auth
  console.log('Initializing auth...');
  initializeAuth();
  
  // Initialize sorting and filtering controls
  initializeSortingControls();
});

async function loadAllBookings() {
  const list = document.getElementById("bookingsList");
  list.innerHTML = "<div class='loading'>Loading bookings...</div>";

  if (!db) {
    console.error('Database not initialized');
    list.innerHTML = "<div class='loading'>Error: Database not initialized</div>";
    return;
  }

  try {
    console.log("Starting Firebase query for bookings...");
    console.log("Database instance:", db);
    console.log("Current user:", firebase.auth().currentUser);
    console.log("User UID:", firebase.auth().currentUser?.uid);
    
    // Test if we can access the collection first
    console.log("Testing collection access...");
    
    // Try different query approaches
    console.log("Attempt 1: Simple query with limit...");
    try {
      const testSnapshot = await db.collection("bookings").limit(1).get();
      console.log("✅ Limited query successful, found docs:", testSnapshot.size);
    } catch (limitError) {
      console.log("❌ Limited query failed:", limitError.message);
    }
    
    console.log("Attempt 2: Query where userId equals current user...");
    try {
      const userSnapshot = await db.collection("bookings")
        .where("userId", "==", firebase.auth().currentUser.uid)
        .get();
      console.log("✅ User-specific query successful, found docs:", userSnapshot.size);
    } catch (userError) {
      console.log("❌ User-specific query failed:", userError.message);
    }
    
    console.log("Attempt 3: Full collection query...");
    const snapshot = await db.collection("bookings").get();
    
    console.log("Query completed successfully");
    console.log("Snapshot size:", snapshot.size);
    console.log("Snapshot empty:", snapshot.empty);
    console.log("Snapshot docs:", snapshot.docs.length);

    allBookings = [];
    
    if (snapshot.empty) {
      list.innerHTML = "<div class='loading'>No bookings found.</div>";
      updateStats();
      return;
    }

    // Get booking data
    console.log("Processing booking documents...");
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Booking ${index + 1} (ID: ${doc.id}):`, data);
      allBookings.push({ 
        id: doc.id, 
        ...data,
        userInfo: { displayName: "User", uid: data.userId }
      });
    });
    
    console.log("Total bookings loaded:", allBookings.length);

    // Apply initial sorting and filtering
    applyFiltersAndSort();
    updateStats();

  } catch (error) {
    console.error("Error fetching bookings:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
    list.innerHTML = `<div class='loading'>Error loading bookings: ${error.message}</div>`;
  }
}

async function getUserInfo(userId) {
  try {
    // Try to get user info from Firebase Auth
    // Note: This might not work in all cases due to security rules
    // You might want to store user info in Firestore instead
    return { uid: userId, displayName: "User", email: "user@example.com" };
  } catch (error) {
    console.error("Error getting user info:", error);
    return { uid: userId, displayName: "Unknown User", email: "N/A" };
  }
}

// Filtering and sorting functions
function applyFiltersAndSort() {
  console.log("Applying filters and sort...");
  
  // Apply filter
  if (currentFilter === 'all') {
    filteredBookings = [...allBookings];
  } else {
    filteredBookings = allBookings.filter(booking => {
      const status = booking.status || 'pending';
      return status === currentFilter;
    });
  }
  
  // Apply sort
  filteredBookings.sort((a, b) => {
    let aValue, bValue;
    
    switch (currentSort.by) {
      case 'createdAt':
        aValue = a.createdAt ? a.createdAt.seconds : 0;
        bValue = b.createdAt ? b.createdAt.seconds : 0;
        break;
      case 'bookingDate':
        aValue = new Date(`${a.date}T${a.time}`).getTime();
        bValue = new Date(`${b.date}T${b.time}`).getTime();
        break;
      case 'status':
        const statusOrder = { 'pending': 1, 'accepted': 2, 'rejected': 3 };
        aValue = statusOrder[a.status || 'pending'];
        bValue = statusOrder[b.status || 'pending'];
        break;
      case 'userId':
        aValue = a.userId || '';
        bValue = b.userId || '';
        break;
      default:
        aValue = 0;
        bValue = 0;
    }
    
    if (currentSort.order === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });
  
  console.log(`Filtered to ${filteredBookings.length} bookings`);
  updateBookingCount();
  renderBookings();
}

function renderBookings() {
  const list = document.getElementById("bookingsList");
  
  console.log("=== RENDER BOOKINGS ===");
  console.log("Total bookings to render:", filteredBookings.length);
  console.log("Current filter:", currentFilter);
  console.log("Current sort:", currentSort);
  
  if (filteredBookings.length === 0) {
    console.log("No bookings to display");
    list.innerHTML = `<div class='loading'>No ${currentFilter === 'all' ? '' : currentFilter + ' '}bookings found.</div>`;
    return;
  }

  console.log("Clearing list and rendering bookings...");
  list.innerHTML = "";

  filteredBookings.forEach((booking, index) => {
    console.log(`Rendering booking ${index + 1}:`, booking);
    const card = document.createElement("div");
    card.className = "booking-card";
    card.dataset.bookingId = booking.id;

    const statusClass = booking.status === "accepted" ? "accepted" : 
                       booking.status === "rejected" ? "rejected" : "pending";

    card.innerHTML = `
      <span class="booking-status ${statusClass}">
        ${booking.status ? booking.status.toUpperCase() : "PENDING"}
      </span>
      
      <div class="user-info">
        <p><strong>User:</strong> ${booking.userInfo?.displayName || "Unknown"}</p>
        <p><strong>User ID:</strong> ${booking.userId}</p>
        <p><strong>Created:</strong> ${booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}</p>
      </div>
      
      <div class="booking-grid">
        <div class="left-col">
          <p><strong>Pickup:</strong> ${booking.pickup}</p>
          <p><strong>Dropoff:</strong> ${booking.dropoff}</p>
          <p><strong>Price:</strong> ₱${booking.price || 'N/A'}</p>
        </div>
        <div class="right-col">
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Vehicle:</strong> ${booking.vehicle || 'N/A'}</p>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="accept-btn" onclick="acceptBooking('${booking.id}')" 
                ${booking.status === "accepted" ? "disabled" : ""}>
          ${booking.status === "accepted" ? "Accepted" : "Accept"}
        </button>
        <button class="reject-btn" onclick="rejectBooking('${booking.id}')" 
                ${booking.status === "rejected" ? "disabled" : ""}>
          ${booking.status === "rejected" ? "Rejected" : "Reject"}
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

async function acceptBooking(bookingId) {
  // Check if booking is already accepted
  const booking = allBookings.find(b => b.id === bookingId);
  if (!booking) {
    showNotification("Booking not found.", "error");
    return;
  }
  
  if (booking.status === "accepted") {
    showNotification("Booking is already accepted.", "error");
    return;
  }
  
  try {
    await db.collection("bookings").doc(bookingId).update({
      status: "accepted",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      allBookings[bookingIndex].status = "accepted";
    }
    
    applyFiltersAndSort();
    updateStats();
    
    // Show success message
    showNotification("Booking accepted successfully!", "success");
    
  } catch (error) {
    console.error("Error accepting booking:", error);
    showNotification("Error accepting booking. Please try again.", "error");
  }
}

async function rejectBooking(bookingId) {
  // Check if booking is already rejected
  const booking = allBookings.find(b => b.id === bookingId);
  if (!booking) {
    showNotification("Booking not found.", "error");
    return;
  }
  
  if (booking.status === "rejected") {
    showNotification("Booking is already rejected.", "error");
    return;
  }
  
  try {
    await db.collection("bookings").doc(bookingId).update({
      status: "rejected",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      allBookings[bookingIndex].status = "rejected";
    }
    
    applyFiltersAndSort();
    updateStats();
    
    // Show success message
    showNotification("Booking rejected successfully!", "success");
    
  } catch (error) {
    console.error("Error rejecting booking:", error);
    showNotification("Error rejecting booking. Please try again.", "error");
  }
}

function updateStats() {
  const pendingCount = allBookings.filter(b => b.status === "pending" || !b.status).length;
  const acceptedCount = allBookings.filter(b => b.status === "accepted").length;
  const totalCount = allBookings.length;
  
  document.getElementById("pendingCount").textContent = pendingCount;
  document.getElementById("acceptedCount").textContent = acceptedCount;
  document.getElementById("totalCount").textContent = totalCount;
}

function updateBookingCount() {
  const countElement = document.getElementById("bookingCount");
  if (countElement) {
    const showing = filteredBookings.length;
    const total = allBookings.length;
    
    if (currentFilter === 'all') {
      countElement.textContent = `(${showing} of ${total})`;
    } else {
      countElement.textContent = `(${showing} ${currentFilter} of ${total} total)`;
    }
  }
}

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

// Initialize sorting and filtering controls
function initializeSortingControls() {
  // Apply sort button
  const applySortBtn = document.getElementById('applySortBtn');
  if (applySortBtn) {
    applySortBtn.addEventListener('click', () => {
      const sortBy = document.getElementById('sortBy').value;
      const sortOrder = document.getElementById('sortOrder').value;
      
      currentSort = { by: sortBy, order: sortOrder };
      console.log('Sort changed:', currentSort);
      
      if (allBookings.length > 0) {
        applyFiltersAndSort();
      }
    });
  }
  
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Update current filter
      currentFilter = btn.dataset.status;
      console.log('Filter changed:', currentFilter);
      
      if (allBookings.length > 0) {
        applyFiltersAndSort();
      }
    });
  });
  
  console.log('Sorting controls initialized');
}