function seePrices() {
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  
  if (!pickup || !dropoff) {
    alert("Please enter both pickup and dropoff locations.");
    return;
  }

  alert(`Estimated fare from ${pickup} to ${dropoff} is being calculated...`);
  // In future: Call your backend or pricing API here
}
