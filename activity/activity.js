firebase.auth().onAuthStateChanged(async (user) => {
  const nav = document.getElementById("navLinks");

  if (user) {
    const name = user.displayName || "My Account";
    nav.innerHTML = `
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

    loadUserBookings(user.uid);
  } else {
    window.location.href = "../authentication/login.html";
  }
});

const db = firebase.firestore();

async function loadUserBookings(uid) {
  const list = document.getElementById("bookingsList");
  list.innerHTML = "<p>Loading your bookings...</p>";

  try {
    const snapshot = await db.collection("bookings")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      list.innerHTML = "<p style='text-align:center;'>No bookings found.</p>";
      return;
    }

    list.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const isCompleted = data.status === "completed";

      const card = document.createElement("div");
      card.className = "booking-card";

      card.innerHTML = `
        <span class="booking-status ${isCompleted ? 'completed' : 'current'}">
          ${isCompleted ? "COMPLETED" : "CURRENT"}
        </span>
        <p><strong>Pickup:</strong> ${data.pickup}</p>
        <p><strong>Dropoff:</strong> ${data.dropoff}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Vehicle:</strong> ${data.vehicle || 'N/A'}</p>
        <p><strong>Price:</strong> ₱${data.price || 'N/A'}</p>
      `;

      list.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    list.innerHTML = "<p style='text-align:center;'>Error loading bookings.</p>";
  }
}