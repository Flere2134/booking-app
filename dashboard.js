window.onload = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  document.getElementById("booking-date").setAttribute("min", formattedToday);
};

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

  // Check if booking is for today and less than 3 hours from now
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

// Attach listeners to check every time user types/selects
[pickupInput, dropoffInput, dateInput, timeInput].forEach((input) =>
  input.addEventListener("input", validateFormFields)
);

