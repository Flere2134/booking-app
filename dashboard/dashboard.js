window.onload = () => {
  // Initialize Flatpickr date picker
  flatpickr("#booking-date", {
    dateFormat: "m-d-Y",
    minDate: "today"
  });

  // Initialize Flatpickr time picker
  flatpickr("#booking-time", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });
};

// Booking handler
async function seePrices() {
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-time").value;

  if (!pickup || !dropoff || !date || !time) {
    alert("Please fill in all booking details including date and time.");
    return;
  }

  const now = new Date();
  const bookingDateTime = new Date(`${date}T${time}`);
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  if (bookingDateTime < threeHoursFromNow && bookingDateTime.toDateString() === now.toDateString()) {
    alert("Bookings must be at least 3 hours from now.");
    return;
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      alert("Please log in to continue.");
      return;
    }

    const db = firebase.firestore();

    try {
      const docRef = await db.collection("bookings").add({
        userId: user.uid,
        pickup,
        dropoff,
        date,
        time,
        status: "in_progress",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // ✅ Redirect with booking ID
      window.location.href = `../ride-selection/rides.html?bookingId=${docRef.id}`;
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Booking failed. Try again.");
    }
  });
}

// Button enable/disable logic
const pickupInput = document.getElementById("pickup");
const dropoffInput = document.getElementById("dropoff");
const dateInput = document.getElementById("booking-date");
const timeInput = document.getElementById("booking-time");
const seePricesBtn = document.getElementById("seePricesBtn");

function validateFormFields() {
  const isFilled =
    pickupInput.value.trim() !== "" &&
    dropoffInput.value.trim() !== "" &&
    dateInput.value !== "" &&
    timeInput.value !== "";

  seePricesBtn.disabled = !isFilled;
}

// Attach input listeners
[pickupInput, dropoffInput, dateInput, timeInput].forEach((input) =>
  input.addEventListener("input", validateFormFields)
);

// 🔐 Navbar login/logout dropdown
firebase.auth().onAuthStateChanged((user) => {
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

    document.querySelector('.dropdown-toggle')?.addEventListener('click', () => {
      document.querySelector('.dropdown-menu')?.classList.toggle('show');
    });

  } else {
    nav.innerHTML = `
      <a href="../authentication/login.html"><button class="btn">Log in</button></a>
      <a href="../authentication/register.html"><button class="btn">Sign up</button></a>
    `;
  }
});