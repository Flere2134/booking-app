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
    dateFormat: "h:i K",
    time_24hr: false
  });
  
  // Initialize ride selection functionality on page load
  initializeRideSelection();
  
  // Initialize autocomplete for both inputs
  initializeAutocomplete('pickup', 'pickupDropdown');
  initializeAutocomplete('dropoff', 'dropoffDropdown');
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
      document.getElementById('pickupDropdown').classList.remove('show');
      document.getElementById('dropoffDropdown').classList.remove('show');
    }
  });
};

// Toast notification system
function showToast(message, type = 'info', title = '', duration = 4000) {
  const toastContainer = document.getElementById('toastContainer');
  const toastId = 'toast-' + Date.now();
  
  const iconMap = {
    success: 'bx-check-circle',
    error: 'bx-x-circle',
    warning: 'bx-error-circle',
    info: 'bx-info-circle'
  };
  
  const titleMap = {
    success: title || 'Success',
    error: title || 'Error',
    warning: title || 'Warning',
    info: title || 'Info'
  };
  
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="bx ${iconMap[type]}"></i>
    <div class="toast-content">
      <div class="toast-title">${titleMap[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="closeToast('${toastId}')">
      <i class="bx bx-x"></i>
    </button>
    <div class="toast-progress"></div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    closeToast(toastId);
  }, duration);
}

function closeToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

let selectedRide = null;
let currentBookingId = null;
let currentDistance = 0;
let currentDuration = 0;

// Store selected coordinates for each input
let pickupCoords = null;
let dropoffCoords = null;

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search locations using Nominatim
async function searchLocations(query, limit = 5) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`);
    const data = await response.json();
    return data.map(item => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      address: item.address
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Initialize autocomplete for an input
function initializeAutocomplete(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  let currentSearchTimeout;
  let selectedIndex = -1;

  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      hideDropdown();
      return;
    }

    showLoading();
    const results = await searchLocations(query);
    displayResults(results);
  }, 300);

  function showLoading() {
    dropdown.innerHTML = '<div class="autocomplete-loading"><i class="bx bx-loader-alt bx-spin"></i> Searching...</div>';
    dropdown.classList.add('show');
  }

  function hideDropdown() {
    dropdown.classList.remove('show');
    selectedIndex = -1;
  }

  function displayResults(results) {
    if (results.length === 0) {
      dropdown.innerHTML = '<div class="autocomplete-no-results">No locations found</div>';
      return;
    }

    dropdown.innerHTML = results.map((result, index) => {
      const title = result.address?.city || result.address?.town || result.address?.village || result.display_name.split(',')[0];
      const subtitle = result.display_name;
      
      return `
        <div class="autocomplete-item" data-index="${index}" data-lat="${result.lat}" data-lng="${result.lng}" data-display="${result.display_name}">
          <i class="bx bx-map-pin"></i>
          <div class="autocomplete-item-content">
            <div class="autocomplete-item-title">${title}</div>
            <div class="autocomplete-item-subtitle">${subtitle}</div>
          </div>
        </div>
      `;
    }).join('');

    dropdown.classList.add('show');
    attachItemListeners();
  }

  function attachItemListeners() {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
      item.addEventListener('click', () => selectItem(item));
      item.addEventListener('mouseenter', () => highlightItem(index));
    });
  }

  function selectItem(item) {
    const display = item.dataset.display;
    const lat = parseFloat(item.dataset.lat);
    const lng = parseFloat(item.dataset.lng);

    input.value = display;
    
    // Store coordinates based on input type
    if (inputId === 'pickup') {
      pickupCoords = { lat, lng };
    } else {
      dropoffCoords = { lat, lng };
    }

    hideDropdown();
    validateFormFields();
    
    // Auto-calculate prices when dropoff is selected
    if (inputId === 'dropoff') {
      autoCalculatePrices();
    } else {
      resetPrices();
    }
  }

  function highlightItem(index) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === index);
    });
    selectedIndex = index;
  }

  // Input event listeners
  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear stored coordinates when input changes
    if (inputId === 'pickup') {
      pickupCoords = null;
    } else {
      dropoffCoords = null;
    }
    
    debouncedSearch(query);
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        highlightItem(selectedIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        if (selectedIndex >= 0) {
          highlightItem(selectedIndex);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          selectItem(items[selectedIndex]);
        }
        break;
      case 'Escape':
        hideDropdown();
        break;
    }
  });

  input.addEventListener('blur', (e) => {
    // Delay hiding to allow click events on dropdown items
    setTimeout(() => {
      if (!dropdown.contains(document.activeElement)) {
        hideDropdown();
      }
    }, 200);
  });

  input.addEventListener('focus', () => {
    if (input.value.length >= 2) {
      debouncedSearch(input.value);
    }
  });
}

// Geocoding function to get coordinates from address (fallback)
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

// Province-based pricing configuration
const provincePricing = {
  'L300': {
    'metro manila': 3000,
    'cavite': 3200,
    'rizal': 3200,
    'laguna': 3500,
    'batangas': 3500,
    'bulacan': 3500,
    'pampanga': 4500,
    'quezon': 4500,
    'bataan': 5500,
    'pangasinan': 5500,
    'zambales': 5500,
    'tarlac': 5500,
    'nueva ecija': 5500,
    'baguio': 7000,
    'la union': 7000,
    'bicol': 8500,
    'ilocos': 8500,
    'tuguegarao': 8500,
    'isabela': 8500
  },
  'Grandia Van': {
    'metro manila': 4000,
    'cavite': 4200,
    'rizal': 4200,
    'laguna': 4500,
    'batangas': 4500,
    'bulacan': 4500,
    'pampanga': 5500,
    'quezon': 5500,
    'bataan': 6500,
    'pangasinan': 6500,
    'zambales': 6500,
    'tarlac': 6500,
    'nueva ecija': 6500,
    'baguio': 8000,
    'la union': 8000,
    'bicol': 9500,
    'ilocos': 9500,
    'tuguegarao': 9500,
    'isabela': 9500
  },
  '10-Wheeler Truck': {
    'metro manila': 5000,
    'cavite': 7000,
    'rizal': 7000,
    'laguna': 8000,
    'batangas': 8000,
    'bulacan': 8000,
    'pampanga': 9500,
    'quezon': 9500,
    'bataan': 12000,
    'pangasinan': 12000,
    'zambales': 12000,
    'tarlac': 12000,
    'nueva ecija': 12000,
    'baguio': 17000,
    'la union': 17000,
    'bicol': 20500,
    'ilocos': 20500,
    'tuguegarao': 20500,
    'isabela': 20500
  }
};

// Metro Manila cities/areas
const metroManilaCities = [
  'manila', 'quezon city', 'makati', 'pasig', 'taguig', 'parañaque', 'las piñas',
  'muntinlupa', 'marikina', 'pasay', 'caloocan', 'malabon', 'navotas', 'valenzuela',
  'san juan', 'mandaluyong', 'pateros'
];

// Extract province from location address
function extractProvince(locationAddress) {
  const address = locationAddress.toLowerCase();
  
  // Check for Metro Manila cities first
  for (const city of metroManilaCities) {
    if (address.includes(city)) {
      return 'metro manila';
    }
  }
  
  // Special case for Quezon - check if it's Quezon City (Metro Manila) or Quezon Province
  if (address.includes('quezon')) {
    if (address.includes('quezon city') || address.includes('qc')) {
      return 'metro manila';
    }
    return 'quezon';
  }
  
  // Check for other provinces
  const provinces = [
    'cavite', 'rizal', 'laguna', 'batangas', 'bulacan', 'pampanga',
    'bataan', 'pangasinan', 'zambales', 'tarlac', 'nueva ecija',
    'baguio', 'la union', 'bicol', 'ilocos', 'tuguegarao', 'isabela'
  ];
  
  for (const province of provinces) {
    if (address.includes(province)) {
      return province;
    }
  }
  
  // Default to Metro Manila if province not found
  return 'metro manila';
}

// Calculate price based on province and vehicle type
function calculatePrice(vehicleType, province) {
  const baseRate = provincePricing[vehicleType][province] || provincePricing[vehicleType]['metro manila'];
  const additionalHourlyRate = 250; // ₱250 per hour after 10 hours
  
  // Base price for first 10 hours
  return {
    basePrice: baseRate,
    additionalHourlyRate: additionalHourlyRate,
    note: 'First 10 hours. ₱250/hour thereafter. Gas and toll fees not included.'
  };
}

// Auto-calculate prices when dropoff is selected
async function autoCalculatePrices() {
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  
  if (!pickup || !dropoff) {
    return;
  }

  try {
    // Use stored coordinates if available, otherwise geocode
    let finalPickupCoords = pickupCoords;
    let finalDropoffCoords = dropoffCoords;
    
    if (!finalPickupCoords && pickup) {
      finalPickupCoords = await geocodeAddress(pickup);
    }
    
    if (!finalDropoffCoords && dropoff) {
      finalDropoffCoords = await geocodeAddress(dropoff);
    }
    
    if (finalPickupCoords && finalDropoffCoords) {
      // Calculate route
      const route = await calculateRoute(finalPickupCoords, finalDropoffCoords);
      currentDistance = route.distance;
      currentDuration = route.duration;
      
      // Display distance info
      document.getElementById("distanceValue").textContent = `${route.distance.toFixed(1)} km`;
      document.getElementById("distanceInfo").style.display = "block";
      
      // Update vehicle prices based on destination province
      updateVehiclePrices(dropoff);
    }
    
  } catch (error) {
    console.error('Auto-calculation error:', error);
    // Fallback to province-based pricing only
    updateVehiclePrices(dropoff);
  }
}

// Update vehicle prices based on destination province
function updateVehiclePrices(dropoffAddress) {
  const province = extractProvince(dropoffAddress);
  const vehicles = [
    { id: 'l300Price', type: 'L300' },
    { id: 'grandiaPrice', type: 'Grandia Van' },
    { id: 'truckPrice', type: '10-Wheeler Truck' }
  ];

  vehicles.forEach(vehicle => {
    const priceInfo = calculatePrice(vehicle.type, province);
    const priceElement = document.getElementById(vehicle.id);
    if (priceElement) {
      priceElement.innerHTML = `₱${priceInfo.basePrice.toLocaleString()}<br><small style="font-size: 0.7rem; color: #666;">${priceInfo.note}</small>`;
    }
    
    // Update data-price attribute for the vehicle option
    const vehicleOption = document.querySelector(`.vehicle-option[data-type="${vehicle.type}"]`);
    if (vehicleOption) {
      vehicleOption.setAttribute('data-price', priceInfo.basePrice);
      vehicleOption.setAttribute('data-province', province);
    }
  });
}

// Create booking when confirm button is clicked
async function createBooking() {
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-time").value;
  const contactPerson = document.getElementById("contact-person").value.trim();
  const phoneNumber = document.getElementById("phone-number").value.trim();

  if (!pickup || !dropoff || !date || !time || !contactPerson || !phoneNumber) {
    showToast("Please fill in all booking details including contact information.", "warning", "Missing Information");
    return false;
  }

  // Validate phone number format (basic validation)
  const phonePattern = /^[\+]?[0-9\s\-\(\)]+$/;
  if (!phonePattern.test(phoneNumber)) {
    showToast("Please enter a valid phone number.", "error", "Invalid Phone Number");
    return false;
  }

  const now = new Date();
  const bookingDateTime = new Date(`${date}T${time}`);
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  if (bookingDateTime < threeHoursFromNow && bookingDateTime.toDateString() === now.toDateString()) {
    showToast("Bookings must be at least 3 hours from now.", "warning", "Invalid Time");
    return false;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    showToast("Please log in to continue.", "warning", "Authentication Required");
    return false;
  }

  const db = firebase.firestore();

  try {
    const province = extractProvince(dropoff);
    const docRef = await db.collection("bookings").add({
      userId: user.uid,
      pickup,
      dropoff,
      date,
      time,
      contactPerson,
      phoneNumber,
      distance: currentDistance,
      duration: currentDuration,
      province: province,
      status: "in_progress",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    currentBookingId = docRef.id;
    return true;
    
  } catch (error) {
    console.error("Error creating booking:", error);
    showToast("Booking failed. Please try again.", "error", "Booking Error");
    return false;
  }
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
      showToast("Please select a ride option.", "warning", "No Vehicle Selected");
      return;
    }

    // First create the booking if it doesn't exist
    if (!currentBookingId) {
      const bookingCreated = await createBooking();
      if (!bookingCreated) {
        return;
      }
    }

    try {
      const db = firebase.firestore();
      await db.collection("bookings").doc(currentBookingId).update({
        vehicle: selectedRide.type,
        price: selectedRide.price,
        paymentMethod: document.getElementById("paymentMethod").value,
        status: "pending"
      });
      
      showToast("Booking confirmed successfully! Redirecting to activity page...", "success", "Booking Confirmed");
      setTimeout(() => {
        window.location.href = "../activity/activity.html";
      }, 2000);

    } catch (error) {
      console.error("Booking update failed:", error);
      showToast("Something went wrong. Please try again.", "error", "Update Failed");
    }
  });
}

// Button enable/disable logic
const pickupInput = document.getElementById("pickup");
const dropoffInput = document.getElementById("dropoff");
const dateInput = document.getElementById("booking-date");
const timeInput = document.getElementById("booking-time");
const contactPersonInput = document.getElementById("contact-person");
const phoneNumberInput = document.getElementById("phone-number");

function validateFormFields() {
  const isFilled =
    pickupInput.value.trim() !== "" &&
    dropoffInput.value.trim() !== "" &&
    dateInput.value !== "" &&
    timeInput.value !== "" &&
    contactPersonInput.value.trim() !== "" &&
    phoneNumberInput.value.trim() !== "";

  // Enable confirm booking button when all fields are filled
  const confirmBtn = document.getElementById("confirmBooking");
  if (confirmBtn) {
    confirmBtn.disabled = !isFilled;
  }
}

// Reset prices when inputs change
function resetPrices() {
  document.getElementById("l300Price").innerHTML = "Select destination";
  document.getElementById("grandiaPrice").innerHTML = "Select destination";
  document.getElementById("truckPrice").innerHTML = "Select destination";
  document.getElementById("distanceInfo").style.display = "none";
  currentDistance = 0;
  currentDuration = 0;
}

// Phone number formatting
function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, ''); // Remove non-digits
  
  // Add formatting for Philippine numbers
  if (value.startsWith('63')) {
    // International format: +63 XXX XXX XXXX
    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  } else if (value.startsWith('09')) {
    // Local format: 09XX XXX XXXX
    value = value.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (value.length >= 10) {
    // General format: XXX XXX XXXX
    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  input.value = value;
}

// Attach input listeners
[pickupInput, dropoffInput, dateInput, timeInput, contactPersonInput, phoneNumberInput].forEach((input) => {
  input.addEventListener("input", validateFormFields);
  
  // Reset prices when pickup or dropoff changes
  if (input === pickupInput || input === dropoffInput) {
    input.addEventListener("input", resetPrices);
  }
  
  // Format phone number as user types
  if (input === phoneNumberInput) {
    input.addEventListener("input", () => formatPhoneNumber(input));
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