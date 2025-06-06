/**
 * PKS & Associates - CA Firm Website JavaScript
 * Main JavaScript file for interactive functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initializeSearch();
    initializeFormValidation();
    initializeAnimations();
    initializeTooltips();
    initializeScrollEffects();
    initializeContactForms();
    initializeNewsletterForm();
    
    console.log('PKS & Associates website initialized successfully');
});

/**
 * Search functionality for services
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) return;
    
    let searchTimeout;
    
    // Search input event listener
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        
        // Debounce search requests
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            }
        });
    }
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            hideSearchResults();
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const activeItems = searchResults.querySelectorAll('.search-result-item');
        const currentActive = searchResults.querySelector('.search-result-item.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateSearchResults(activeItems, currentActive, 'down');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSearchResults(activeItems, currentActive, 'up');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentActive) {
                currentActive.click();
            }
        } else if (e.key === 'Escape') {
            hideSearchResults();
        }
    });
    
    function performSearch(query) {
        // Show loading state
        searchResults.innerHTML = '<div class="search-result-item">Searching...</div>';
        showSearchResults();
        
        // Simulate API call with fetch (in production, this would call the search endpoint)
        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error('Search error:', error);
                searchResults.innerHTML = '<div class="search-result-item">Search failed. Please try again.</div>';
            });
    }
    
    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            showSearchResults();
            return;
        }
        
        const html = results.map(result => `
            <div class="search-result-item" data-url="${result.url}">
                <div class="search-result-type">${result.type}</div>
                <div class="search-result-name">${result.name}</div>
                ${result.category ? `<div class="search-result-category">${result.category}</div>` : ''}
            </div>
        `).join('');
        
        searchResults.innerHTML = html;
        showSearchResults();
        
        // Add click listeners to search results
        searchResults.querySelectorAll('.search-result-item[data-url]').forEach(item => {
            item.addEventListener('click', function() {
                window.location.href = this.dataset.url;
            });
        });
    }
    
    function showSearchResults() {
        searchResults.style.display = 'block';
        setTimeout(() => {
            searchResults.classList.add('show');
        }, 10);
    }
    
    function hideSearchResults() {
        searchResults.classList.remove('show');
        setTimeout(() => {
            searchResults.style.display = 'none';
        }, 200);
    }
    
    function navigateSearchResults(items, currentActive, direction) {
        if (items.length === 0) return;
        
        // Remove current active class
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        
        let nextIndex = 0;
        
        if (currentActive) {
            const currentIndex = Array.from(items).indexOf(currentActive);
            if (direction === 'down') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            }
        }
        
        items[nextIndex].classList.add('active');
        items[nextIndex].scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Form validation and enhancement
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateInput(this);
                }
            });
        });
        
        // Handle form submission
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showFormError('Please fix the errors below and try again.');
                
                // Focus on first invalid input
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    showButtonLoading(submitBtn);
                }
            }
        });
    });
    
    function validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        
        // Remove existing validation classes
        input.classList.remove('is-valid', 'is-invalid');
        
        // Remove existing feedback
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback, .valid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        let isValid = true;
        let message = '';
        
        // Required field validation
        if (required && !value) {
            isValid = false;
            message = 'This field is required.';
        }
        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address.';
            }
        }
        // Phone validation
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                message = 'Please enter a valid phone number.';
            }
        }
        // Name validation
        else if (input.name === 'name' && value) {
            if (value.length < 2) {
                isValid = false;
                message = 'Name must be at least 2 characters long.';
            }
        }
        // Message validation
        else if (input.name === 'message' && required && value.length < 10) {
            isValid = false;
            message = 'Please provide a more detailed message (at least 10 characters).';
        }
        
        // Apply validation result
        if (isValid) {
            input.classList.add('is-valid');
        } else {
            input.classList.add('is-invalid');
            showInputError(input, message);
        }
        
        return isValid;
    }
    
    function showInputError(input, message) {
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        input.parentNode.appendChild(feedback);
    }
    
    function showFormError(message) {
        // Remove existing error alerts
        const existingAlert = document.querySelector('.alert-danger');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create new error alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    function showButtonLoading(button) {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <span class="spinner me-2"></span>
            Submitting...
        `;
        button.disabled = true;
        
        // Store original text for potential restoration
        button.dataset.originalText = originalText;
    }
}

/**
 * Initialize animations and scroll effects
 */
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Add staggered animation for child elements
                const children = entry.target.querySelectorAll('.service-card, .feature-card, .team-card, .achievement-card');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('fade-in');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.services-overview, .why-choose-us, .achievements, .process-section');
    animatedElements.forEach(el => observer.observe(el));
    
    // Counter animation for statistics
    const counters = document.querySelectorAll('.achievement-number, .stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
    
    function animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const suffix = element.textContent.replace(/[0-9]/g, '');
            element.textContent = Math.floor(current) + suffix;
        }, 40);
    }
}

/**
 * Initialize tooltips for better UX
 */
function initializeTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add custom tooltips for service features
    const serviceFeatures = document.querySelectorAll('.service-features li');
    serviceFeatures.forEach(feature => {
        feature.setAttribute('title', 'Professional service included');
    });
}

/**
 * Scroll effects and navbar behavior
 */
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const scrollToTopBtn = createScrollToTopButton();
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navbar scroll effects
        if (navbar) {
            if (scrollTop > 100) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
        
        // Show/hide scroll to top button
        if (scrollTop > 300) {
            scrollToTopBtn.style.display = 'block';
            setTimeout(() => {
                scrollToTopBtn.style.opacity = '1';
            }, 10);
        } else {
            scrollToTopBtn.style.opacity = '0';
            setTimeout(() => {
                scrollToTopBtn.style.display = 'none';
            }, 300);
        }
        
        lastScrollTop = scrollTop;
    });
    
    function createScrollToTopButton() {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.className = 'scroll-to-top';
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            display: none;
            opacity: 0;
        `;
        
        button.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        document.body.appendChild(button);
        return button;
    }
}

/**
 * Contact form enhancements
 */
function initializeContactForms() {
    const contactForms = document.querySelectorAll('form[action], form[method="POST"]');
    
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Add form submission tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'form_name': form.id || 'contact_form',
                    'form_location': window.location.pathname
                });
            }
        });
    });
    
    // Auto-resize textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    // Format phone number inputs
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else if (value.length <= 10) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
                } else {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 10);
                }
            }
            this.value = value;
        });
    });
}

/**
 * Newsletter form functionality
 */
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Please enter your email address.', 'error');
                return;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            // Simulate API call (replace with actual newsletter subscription)
            setTimeout(() => {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Track subscription
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_signup', {
                        'method': 'website_form'
                    });
                }
            }, 1500);
        });
    }
}

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        max-width: 500px;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Lazy loading for images and SVGs
 */
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src], svg[data-src]');
    
    if ('IntersectionObserver' in window) {
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
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

/**
 * Smooth scroll for anchor links
 */
function initializeSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 100; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#main-content') || document.querySelector('main');
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }
    
    // Enhance keyboard navigation
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    // Add visible focus indicators
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('keyboard-focus');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('keyboard-focus');
        });
        
        element.addEventListener('mousedown', function() {
            this.classList.add('mouse-focus');
        });
        
        element.addEventListener('mouseup', function() {
            this.classList.remove('mouse-focus');
        });
    });
    
    // Announce dynamic content changes to screen readers
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.setAttribute('role', 'alert');
        alert.setAttribute('aria-live', 'polite');
    });
}

/**
 * Error handling and fallbacks
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Show user-friendly error message for critical failures
    if (e.error && e.error.message) {
        showNotification('Something went wrong. Please refresh the page and try again.', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// Initialize remaining features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeLazyLoading();
    initializeSmoothScroll();
    initializeAccessibility();
});

// Export functions for potential external use
window.PKSWebsite = {
    showNotification,
    initializeSearch,
    initializeFormValidation
};
