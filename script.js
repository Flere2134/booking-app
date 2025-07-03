const modals = {
    login: document.getElementById('loginModal'),
    register: document.getElementById('registerModal'),
    quote: document.getElementById('quoteModal')
};

function openModal(modalType) {
    if (modals[modalType]) {
        modals[modalType].style.display = 'block';
        document.body.style.overflow = 'hidden'; 
        
        const modalContent = modals[modalType].querySelector('.modal-content');
        modalContent.style.transform = 'translateY(-50px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.opacity = '1';
        }, 10);
    }
}

function closeModal(modalType) {
    if (modals[modalType]) {
        const modalContent = modals[modalType].querySelector('.modal-content');
        
        modalContent.style.transform = 'translateY(-50px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modals[modalType].style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function switchModal(currentModal, targetModal) {
    closeModal(currentModal);
    setTimeout(() => {
        openModal(targetModal);
    }, 350);
}


window.onclick = function(event) {
    Object.keys(modals).forEach(modalType => {
        if (event.target === modals[modalType]) {
            closeModal(modalType);
        }
    });
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        Object.keys(modals).forEach(modalType => {
            if (modals[modalType].style.display === 'block') {
                closeModal(modalType);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// validation 
class FormHandler {
    constructor() {
        this.initializeForms();
    }
    
    initializeForms() {
        // Login Form
        const loginForm = document.querySelector('#loginModal .auth-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Register Form
        const registerForm = document.querySelector('#registerModal .auth-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Quote Form
        const quoteForm = document.querySelector('.quote-form');
        if (quoteForm) {
            quoteForm.addEventListener('submit', (e) => this.handleQuote(e));
        }
    }
    
    handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Basic validation
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }
        
        // Simulate login process
        this.showMessage('Logging in...', 'info');
        
        setTimeout(() => {
            // Here you would typically send data to your server
            this.showMessage('Login successful! Welcome back.', 'success');
            closeModal('login');
            
            // Update UI for logged-in user
            this.updateAuthButtons(true);
        }, 1500);
    }
    
    handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validation
        if (name.length < 2) {
            this.showMessage('Please enter your full name.', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        if (!this.validatePhone(phone)) {
            this.showMessage('Please enter a valid phone number.', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }
        
        // Simulate registration process
        this.showMessage('Creating your account...', 'info');
        
        setTimeout(() => {
            // Here you would typically send data to your server
            this.showMessage('Registration successful! Welcome to Lazcis Transport.', 'success');
            closeModal('register');
            
            // Update UI for logged-in user
            this.updateAuthButtons(true);
        }, 2000);
    }
    
    handleQuote(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const pickup = formData.get('pickup');
        const delivery = formData.get('delivery');
        const serviceType = formData.get('serviceType');
        const description = formData.get('description');
        
        // Validation
        if (!name || !phone || !email || !pickup || !delivery || !serviceType) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        if (!this.validatePhone(phone)) {
            this.showMessage('Please enter a valid phone number.', 'error');
            return;
        }
        
        // Simulate quote submission
        this.showMessage('Submitting your quote request...', 'info');
        
        setTimeout(() => {
            // Here you would typically send data to your server
            this.showMessage('Quote request submitted! We\'ll contact you within 24 hours.', 'success');
            closeModal('quote');
            
            // Reset form
            event.target.reset();
        }, 2000);
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        
        // Style the message
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '3000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        switch(type) {
            case 'success':
                messageDiv.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                break;
            case 'error':
                messageDiv.style.background = 'linear-gradient(45deg, #dc3545, #fd7e14)';
                break;
            case 'info':
                messageDiv.style.background = 'linear-gradient(45deg, #007bff, #6f42c1)';
                break;
        }
        
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 4000);
    }
    
    updateAuthButtons(isLoggedIn) {
        const authButtons = document.querySelector('.auth-buttons');
        if (isLoggedIn) {
            authButtons.innerHTML = `
                <button class="login-btn" onclick="logout()">Logout</button>
                <button class="register-btn" onclick="openModal('quote')">Get Quote</button>
            `;
        }
    }
}

// Logout function
function logout() {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button class="login-btn" onclick="openModal('login')">Login</button>
        <button class="register-btn" onclick="openModal('register')">Register</button>
    `;
    
    // Show logout message
    const formHandler = new FormHandler();
    formHandler.showMessage('Logged out successfully.', 'info');
}

// Scroll Effects
class ScrollEffects {
    constructor() {
        this.initializeScrollEffects();
    }
    
    initializeScrollEffects() {
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
                header.style.backdropFilter = 'none';
            }
        });
        
        // Animate elements on scroll
        this.observeElements();
    }
    
    observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.feature-card, .service-card, .stat-item');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// Counter Animation for Stats
class CounterAnimation {
    constructor() {
        this.initializeCounters();
    }
    
    initializeCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    animateCounter(element) {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasPercent = text.includes('%');
        const hasStar = text.includes('★');
        const hasSlash = text.includes('/');
        
        let finalValue;
        if (hasSlash) {
            // Handle "24/7" case
            element.textContent = '24/7';
            return;
        } else if (hasStar) {
            finalValue = 5;
        } else {
            finalValue = parseInt(text.replace(/[+%★]/g, ''));
        }
        
        let currentValue = 0;
        const increment = finalValue / 100;
        const duration = 2000; // 2 seconds
        const stepTime = duration / 100;
        
        const timer = setInterval(() => {
            currentValue += increment;
            
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(currentValue);
            if (hasStar) {
                element.textContent = displayValue + '★';
            } else if (hasPercent) {
                element.textContent = displayValue + '%';
            } else if (hasPlus) {
                element.textContent = displayValue + '+';
            } else {
                element.textContent = displayValue;
            }
        }, stepTime);
    }
}

// Contact Functions
function callNow() {
    window.location.href = 'tel:+1234567890';
}

function sendEmail() {
    window.location.href = 'mailto:info@lazcistransport.com?subject=Service Inquiry';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form handler
    new FormHandler();
    
    // Initialize scroll effects
    new ScrollEffects();
    
    // Initialize counter animations
    new CounterAnimation();
    
    // Add loading animation to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.type !== 'submit') return;
            
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 2000);
        });
    });
});

// Service Worker Registration (for better performance)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Preload critical resources
function preloadResources() {
    const criticalResources = [
        'styles.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// Call preload on page load
document.addEventListener('DOMContentLoaded', preloadResources);

// Export functions for global access
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;
window.logout = logout;
window.callNow = callNow;
window.sendEmail = sendEmail;