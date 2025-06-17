firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = "login.html";
  }
});

// DOM Elements
const elements = {
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    mobileMenuOverlay: document.getElementById('mobileMenuOverlay'),
    mobileMenuClose: document.getElementById('mobileMenuClose'),
    seePricesBtn: document.getElementById('seePricesBtn'),
    priceModalOverlay: document.getElementById('priceModalOverlay'),
    priceModalClose: document.getElementById('priceModalClose'),
    confirmBookingBtn: document.getElementById('confirmBookingBtn'),
    bookingForm: document.getElementById('bookingForm'),
    pickupLocation: document.getElementById('pickupLocation'),
    dropoffLocation: document.getElementById('dropoffLocation'),
    bookingDate: document.getElementById('bookingDate'),
    bookingTime: document.getElementById('bookingTime')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupDateDefault();
    setupLocationAutocomplete();
    setupFormValidation();
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile menu toggle
    elements.mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    elements.mobileMenuClose?.addEventListener('click', closeMobileMenu);
    elements.mobileMenuOverlay?.addEventListener('click', function(e) {
        if (e.target === elements.mobileMenuOverlay) {
            closeMobileMenu();
        }
    });

    // Price modal
    elements.seePricesBtn?.addEventListener('click', handleSeePrices);
    elements.priceModalClose?.addEventListener('click', closePriceModal);
    elements.priceModalOverlay?.addEventListener('click', function(e) {
        if (e.target === elements.priceModalOverlay) {
            closePriceModal();
        }
    });

    // Booking confirmation
    elements.confirmBookingBtn?.addEventListener('click', handleBookingConfirmation);

    // Form submission
    elements.bookingForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSeePrices();
    });

    // Location input interactions
    elements.pickupLocation?.addEventListener('focus', function() {
        this.parentElement.classList.add('input-focused');
    });

    elements.pickupLocation?.addEventListener('blur', function() {
        this.parentElement.classList.remove('input-focused');
    });

    elements.dropoffLocation?.addEventListener('focus', function() {
        this.parentElement.classList.add('input-focused');
    });

    elements.dropoffLocation?.addEventListener('blur', function() {
        this.parentElement.classList.remove('input-focused');
    });

    // Suggestion card clicks
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', handleSuggestionClick);
    });

    // Ride option selection
    setupRideOptionSelection();

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Mobile Menu Functions
function toggleMobileMenu() {
    elements.mobileMenuOverlay?.classList.toggle('active');
    document.body.style.overflow = elements.mobileMenuOverlay?.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    elements.mobileMenuOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}

// Price Modal Functions
function openPriceModal() {
    elements.priceModalOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add animation delay for ride options
    const rideOptions = document.querySelectorAll('.ride-option');
    rideOptions.forEach((option, index) => {
        option.style.opacity = '0';
        option.style.transform = 'translateY(20px)';
        setTimeout(() => {
            option.style.transition = 'all 0.3s ease';
            option.style.opacity = '1';
            option.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function closePriceModal() {
    elements.priceModalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}

// Booking Functions
function handleSeePrices() {
    if (!validateBookingForm()) {
        return;
    }

    // Show loading state
    const originalText = elements.seePricesBtn.textContent;
    elements.seePricesBtn.innerHTML = '<span class="loading"></span> Finding prices...';
    elements.seePricesBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        elements.seePricesBtn.textContent = originalText;
        elements.seePricesBtn.disabled = false;
        openPriceModal();
        updateRidePrices();
    }, 1500);
}

function handleBookingConfirmation() {
    const selectedRide = document.querySelector('.ride-option.selected');
    
    if (!selectedRide) {
        showNotification('Please select a ride option', 'error');
        return;
    }

    // Show loading state
    elements.confirmBookingBtn.innerHTML = '<span class="loading"></span> Booking...';
    elements.confirmBookingBtn.disabled = true;

    // Simulate booking process
    setTimeout(() => {
        closePriceModal();
        showNotification('Booking confirmed! Your driver will arrive shortly.', 'success');
        resetBookingForm();
        elements.confirmBookingBtn.textContent = 'Confirm booking';
        elements.confirmBookingBtn.disabled = false;
    }, 2000);
}

function handleSuggestionClick(e) {
    const suggestionCard = e.target.closest('.suggestion-card');
    const suggestionType = suggestionCard.querySelector('h3').textContent.toLowerCase();
    
    // Animate button
    e.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
        e.target.style.transform = 'scale(1)';
    }, 150);

    // Handle different suggestion types
    switch(suggestionType) {
        case 'ride':
            elements.pickupLocation?.focus();
            break;
        case 'reserve':
            elements.bookingDate?.focus();
            break;
        case 'business':
            showNotification('Business accounts coming soon!', 'info');
            break;
    }
}

// Form Validation
function validateBookingForm() {
    const pickup = elements.pickupLocation?.value.trim();
    const dropoff = elements.dropoffLocation?.value.trim();

    if (!pickup) {
        showNotification('Please enter a pickup location', 'error');
        elements.pickupLocation?.focus();
        return false;
    }

    if (!dropoff) {
        showNotification('Please enter a drop-off location', 'error');
        elements.dropoffLocation?.focus();
        return false;
    }

    if (pickup.toLowerCase() === dropoff.toLowerCase()) {
        showNotification('Pickup and drop-off locations cannot be the same', 'error');
        elements.dropoffLocation?.focus();
        return false;
    }

    return true;
}

function setupFormValidation() {
    // Real-time validation
    elements.pickupLocation?.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
        }
    });

    elements.dropoffLocation?.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
        }
    });
}

function resetBookingForm() {
    elements.bookingForm?.reset();
    setupDateDefault();
}

// Date Setup
function setupDateDefault() {
    if (elements.bookingDate) {
        const today = new Date();
        elements.bookingDate.value = today.toISOString().split('T')[0];
        elements.bookingDate.min = today.toISOString().split('T')[0];
    }
}

// Location Autocomplete Simulation
function setupLocationAutocomplete() {
    const locations = [
        'Airport Terminal 1',
        'Airport Terminal 2',
        'Downtown Business District',
        'Shopping Mall Central',
        'University Campus',
        'Hospital Medical Center',
        'Train Station Main',
        'Bus Terminal',
        'Hotel Grand Plaza',
        'Restaurant District'
    ];

    setupAutocomplete(elements.pickupLocation, locations);
    setupAutocomplete(elements.dropoffLocation, locations);
}

function setupAutocomplete(input, suggestions) {
    if (!input) return;

    let currentFocus = -1;
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        closeAllLists();
        
        if (!value) return;
        
        const matches = suggestions.filter(item => 
            item.toLowerCase().includes(value)
        );
        
        if (matches.length === 0) return;
        
        const listContainer = document.createElement('div');
        listContainer.className = 'autocomplete-list';
        this.parentNode.appendChild(listContainer);
        
        matches.forEach((match, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = match.replace(new RegExp(value, 'gi'), `<strong>function closePriceModal() {
    elements.priceModalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}</strong>`);
            
            item.addEventListener('click', function() {
                input.value = match;
                closeAllLists();
            });
            
            listContainer.appendChild(item);
        });
    });

    input.addEventListener('keydown', function(e) {
        const list = this.parentNode.querySelector('.autocomplete-list');
        if (!list) return;
        
        const items = list.querySelectorAll('.autocomplete-item');
        
        if (e.keyCode === 40) { // Down arrow
            currentFocus++;
            addActive(items);
        } else if (e.keyCode === 38) { // Up arrow
            currentFocus--;
            addActive(items);
        } else if (e.keyCode === 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            }
        }
    });

    function addActive(items) {
        if (!items) return;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus]?.classList.add('active');
    }

    function removeActive(items) {
        items.forEach(item => item.classList.remove('active'));
    }

    function closeAllLists() {
        const lists = document.querySelectorAll('.autocomplete-list');
        lists.forEach(list => list.remove());
        currentFocus = -1;
    }

    // Close lists when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target)) {
            closeAllLists();
        }
    });
}

// Ride Option Selection
function setupRideOptionSelection() {
    const rideOptions = document.querySelectorAll('.ride-option');
    
    rideOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selection from all options
            rideOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            this.classList.add('selected');
            
            // Enable confirm button
            if (elements.confirmBookingBtn) {
                elements.confirmBookingBtn.disabled = false;
                elements.confirmBookingBtn.classList.add('btn-enabled');
            }
        });
    });
}

// Update ride prices with dynamic pricing
function updateRidePrices() {
    const rideOptions = document.querySelectorAll('.ride-option');
    const basePrice = 20;
    const demandMultiplier = 1 + (Math.random() * 0.5); // 1.0 to 1.5x
    
    rideOptions.forEach((option, index) => {
        const priceElement = option.querySelector('.ride-price');
        const multipliers = [1, 1.8, 1.4]; // Different multipliers for different ride types
        const finalPrice = Math.round(basePrice * multipliers[index] * demandMultiplier);
        
        if (priceElement) {
            // Animate price change
            priceElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                priceElement.textContent = `${finalPrice}`;
                priceElement.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 4000);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn?.addEventListener('click', () => hideNotification(notification));
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Keyboard Navigation
function handleKeyboardNavigation(e) {
    // ESC key closes modals
    if (e.key === 'Escape') {
        if (elements.priceModalOverlay?.classList.contains('active')) {
            closePriceModal();
        }
        if (elements.mobileMenuOverlay?.classList.contains('active')) {
            closeMobileMenu();
        }
    }
}

// Utility Functions
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

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function formatTime(time) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(time);
}

// Performance Optimization
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if supported
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', lazyLoadImages);
}

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateBookingForm,
        handleSeePrices,
        showNotification,
        formatDate,
        formatTime
    };
}