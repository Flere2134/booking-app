// 🔧 Helper to get ?bookingId from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const bookingId = getQueryParam("bookingId");
const db = firebase.firestore();
let selectedRide = null;

// ✅ Ensure user is logged in before fetching booking
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "../dashboard/dashboard.html";
    return;
  }

  if (!bookingId) {
    alert("Missing booking ID.");
    return;
  }

  try {
    const doc = await db.collection("bookings").doc(bookingId).get();
    if (!doc.exists) {
      alert("Booking not found.");
      return;
    }

    const data = doc.data();

    // ✅ Display booking info in UI
    document.getElementById("pickupDisplay").textContent = data.pickup;
    document.getElementById("dropoffDisplay").textContent = data.dropoff;
    document.getElementById("dateDisplay").textContent = data.date;
    document.getElementById("timeDisplay").textContent = data.time;

  } catch (error) {
    console.error("Error fetching booking:", error);
    alert("Failed to load booking.");
  }
});

// 🚘 Ride selection UI logic
document.querySelectorAll(".ride-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".ride-option").forEach(o => o.classList.remove("active"));
    option.classList.add("active");

    selectedRide = {
      type: option.dataset.type,
      price: parseInt(option.dataset.price)
    };
  });
});

// ✅ Confirm Booking Button
document.getElementById("confirmBooking").addEventListener("click", async () => {
  if (!selectedRide) {
    alert("Please select a ride option.");
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    alert("You must be logged in to confirm booking.");
    return;
  }

  try {
    await db.collection("bookings").doc(bookingId).update({
      vehicle: selectedRide.type,
      price: selectedRide.price,
      paymentMethod: document.getElementById("paymentMethod").value,
      status: "pending"
    });

    alert("Your booking has been confirmed!");
    window.location.href = "confirmation.html"; // 🎉 Your success screen

  } catch (error) {
    console.error("Booking update failed:", error);
    alert("Something went wrong. Please try again.");
  }
});

// 🧑‍💼 User dropdown and logout
firebase.auth().onAuthStateChanged((user) => {
  const nav = document.getElementById("navLinks");

  if (user) {
    const name = user.displayName || "My Account";

    nav.innerHTML = `
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

  } else {
    nav.innerHTML = `
      <a href="../authentication/login.html"><button class="btn">Log in</button></a>
      <a href="../authentication/register.html"><button class="btn">Sign up</button></a>
    `;
  }
});