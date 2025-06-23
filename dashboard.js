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
    alert("Please fill all booking details including date and time.");
    return;
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time to midnight

  if (selectedDate < today) {
    alert("Please choose a valid future date for your booking.");
    return;
  }

  alert(`You booked a ride from ${pickup} to ${dropoff} on ${date} at ${time}.`);
  // In future: Call your backend or pricing API here
}
