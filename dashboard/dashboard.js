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
  
  // Initialize ride selection functionality on page load
  initializeRideSelection();
};

let selectedRide = null;
let currentBookingId = null;
let currentDistance = 0;
let currentDuration = 0;

// Geocoding function to get coordinates from address
async function geocodeAddress(address) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Calculate distance and route using OpenStreetMap
async function calculateRoute(pickupCoords, dropoffCoords) {
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?overview=false&alternatives=false&steps=false`);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance / 1000, // Convert to kilometers
        duration: route.duration / 60 // Convert to minutes
      };
    }
    throw new Error('Route not found');
  } catch (error) {
    console.error('Route calculation error:', error);
    throw error;
  }
}

// Calculate price based on distance and vehicle type
function calculatePrice(distance, baseRate) {
  const minimumFare = 150; // Minimum fare in PHP
  const baseFare = 100; // Base fare in PHP
  const calculatedFare = baseFare + (distance * baseRate);
  return Math.max(minimumFare, Math.round(calculatedFare));
}

// Update vehicle prices
function updateVehiclePrices(distance) {
  const vehicles = [
    { id: 'sedanPrice', type: 'Sedan', rate: 25 },
    { id: 'suvPrice', type: 'SUV', rate: 35 },
    { id: 'vanPrice', type: 'Van', rate: 45 }
  ];

  vehicles.forEach(vehicle => {
    const price = calculatePrice(distance, vehicle.rate);
    const priceElement = document.getElementById(vehicle.id);
    if (priceElement) {
      priceElement.textContent = `₱${price}`;
    }
    
    // Update data-price attribute for the vehicle option
    const vehicleOption = document.querySelector(`.vehicle-option[data-type="${vehicle.type}"]`);
    if (vehicleOption) {
      vehicleOption.setAttribute('data-price', price);
    }
  });
}

// Show ride selection
async function showRideSelection() {
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

  // Show loading state
  const findRidesBtn = document.getElementById("seePricesBtn");
  const originalText = findRidesBtn.innerHTML;
  findRidesBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Calculating Route...';
  findRidesBtn.disabled = true;

  try {
    // Get coordinates for both addresses
    const pickupCoords = await geocodeAddress(pickup);
    const dropoffCoords = await geocodeAddress(dropoff);
    
    // Calculate route
    const route = await calculateRoute(pickupCoords, dropoffCoords);
    currentDistance = route.distance;
    currentDuration = route.duration;
    
    // Display distance info
    document.getElementById("distanceValue").textContent = `${route.distance.toFixed(1)} km`;
    document.getElementById("durationValue").textContent = `${Math.round(route.duration)} minutes`;
    document.getElementById("distanceInfo").style.display = "block";
    
    // Update vehicle prices based on distance
    updateVehiclePrices(route.distance);
    
    // Reset button
    findRidesBtn.innerHTML = originalText;
    findRidesBtn.disabled = false;
    
  } catch (error) {
    alert("Unable to calculate route. Please check your addresses and try again.");
    findRidesBtn.innerHTML = originalText;
    findRidesBtn.disabled = false;
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
        distance: currentDistance,
        duration: currentDuration,
        status: "in_progress",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      currentBookingId = docRef.id;
      
      // Enable the confirm booking button
      document.getElementById("confirmBooking").disabled = false;
      
      // Show success message
      alert("Trip details saved! Please select your ride and confirm booking.");
      
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Booking failed. Try again.");
    }
  });
}

// Initialize ride selection functionality
function initializeRideSelection() {
  // Remove existing event listeners to prevent duplicates
  document.querySelectorAll(".vehicle-option").forEach(option => {
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);
  });
  
  // Ride selection logic
  document.querySelectorAll(".vehicle-option").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".vehicle-option").forEach(o => o.classList.remove("active"));
      option.classList.add("active");

      selectedRide = {
        type: option.dataset.type,
        price: parseInt(option.dataset.price)
      };
    });
  });

  // Confirm booking button (remove existing listener first)
  const confirmBtn = document.getElementById("confirmBooking");
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
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

    if (!currentBookingId) {
      alert("No booking found to confirm.");
      return;
    }

    try {
      const db = firebase.firestore();
      await db.collection("bookings").doc(currentBookingId).update({
        vehicle: selectedRide.type,
        price: selectedRide.price,
        paymentMethod: document.getElementById("paymentMethod").value,
        status: "pending"
      });
      
      alert("Booking confirmed successfully!");
      window.location.href = "../activity/activity.html";

    } catch (error) {
      console.error("Booking update failed:", error);
      alert("Something went wrong. Please try again.");
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

// Reset prices when inputs change
function resetPrices() {
  document.getElementById("sedanPrice").textContent = "Enter route";
  document.getElementById("suvPrice").textContent = "Enter route";
  document.getElementById("vanPrice").textContent = "Enter route";
  document.getElementById("distanceInfo").style.display = "none";
  currentDistance = 0;
  currentDuration = 0;
}

// Attach input listeners
[pickupInput, dropoffInput, dateInput, timeInput].forEach((input) => {
  input.addEventListener("input", validateFormFields);
  
  // Reset prices when pickup or dropoff changes
  if (input === pickupInput || input === dropoffInput) {
    input.addEventListener("input", resetPrices);
  }
});

// 🔐 Navbar login/logout dropdown
firebase.auth().onAuthStateChanged((user) => {
  const nav = document.getElementById("navLinks");

  if (user) {
    const name = user.displayName || "My Account";

    nav.innerHTML = `
      <a href="../index.html" class="nav-text-link">Back to Home</a>
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
      <a href="../index.html" class="nav-text-link">Back to Home</a>
      <a href="../authentication/login.html"><button class="btn">Log in</button></a>
      <a href="../authentication/register.html"><button class="btn">Sign up</button></a>
    `;
  }
});