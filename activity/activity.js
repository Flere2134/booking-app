firebase.auth().onAuthStateChanged(async (user) => {
  const nav = document.getElementById("navLinks");

  if (user) {
    const name = user.displayName || "My Account";
    nav.innerHTML = `
      <a href="../dashboard/dashboard.html" class="nav-text-link">Home</a>
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
      
      // Determine status class and text
      let statusClass, statusText;
      switch(data.status) {
        case "accepted":
          statusClass = "accepted";
          statusText = "ACCEPTED";
          break;
        case "rejected":
          statusClass = "rejected";
          statusText = "REJECTED";
          break;
        case "pending":
          statusClass = "pending";
          statusText = "PENDING";
          break;
        default:
          statusClass = "pending";
          statusText = "PENDING";
          break;
      }

      const card = document.createElement("div");
      card.className = "booking-card";

      card.innerHTML = `
        <span class="booking-status ${statusClass}">
          ${statusText}
        </span>
        <div class="booking-grid">
          <div class="left-col">
            <p><strong>Pickup:</strong> ${data.pickup}</p>
            <p><strong>Dropoff:</strong> ${data.dropoff}</p>
            <p><strong>Price:</strong> ₱${data.price || 'N/A'}</p>
          </div>
          <div class="right-col">
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Vehicle:</strong> ${data.vehicle || 'N/A'}</p>
          </div>
        </div>
      `;

      list.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    list.innerHTML = "<p style='text-align:center;'>Error loading bookings.</p>";
  }
}