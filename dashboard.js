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
function seePrices() {
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
  const today = new Date();
  today.setHours(0, 0, 0, 0); // midnight today

  if (bookingDateTime < now) {
    alert("Please choose a future date and time for your booking.");
    return;
  }

  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  if (
    bookingDateTime.toDateString() === now.toDateString() &&
    bookingDateTime < threeHoursFromNow
  ) {
    alert("Bookings must be at least 3 hours from now.");
    return;
  }

  alert(`You booked a ride from ${pickup} to ${dropoff} on ${date} at ${time}.`);
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
