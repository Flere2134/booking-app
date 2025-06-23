// 🔧 Helper to get ?bookingId from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const bookingId = getQueryParam("bookingId");
const db = firebase.firestore();

let selectedRide = null;

window.onload = async () => {
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

    // Display booking info in UI
    document.getElementById("pickupDisplay").textContent = data.pickup;
    document.getElementById("dropoffDisplay").textContent = data.dropoff;
    document.getElementById("dateDisplay").textContent = data.date;
    document.getElementById("timeDisplay").textContent = data.time;

  } catch (error) {
    console.error("Error fetching booking:", error);
    alert("Failed to load booking.");
  }
};

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
    window.location.href = "confirmation.html"; // ✅ Add this page if you want a success screen

  } catch (error) {
    console.error("Booking update failed:", error);
    alert("Something went wrong. Please try again.");
  }
});