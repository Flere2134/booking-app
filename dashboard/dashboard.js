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
      window.location.href = `rides.html?bookingId=${docRef.id}`;
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
