/**
 * Authentication utilities for Boat Safari application
 */

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Alias for isLoggedIn for better readability in some contexts
function isAuthenticated() {
    return isLoggedIn();
}

// Get user token
function getToken() {
    return localStorage.getItem('token');
}

// Store authentication token
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token and perform logout
function logout() {
    // Clear the authentication token from localStorage
    localStorage.removeItem('token');
    // Also clear cached user details
    localStorage.removeItem('userDetails');

    // Redirect to login page
    window.location.href = '/login.html';
}

// Check authentication on page load and show/hide appropriate elements
function updateAuthUI() {
    const loggedIn = isLoggedIn();

    // Get all elements with auth-required class
    const authRequiredElements = document.querySelectorAll('.auth-required');
    // Get all elements with no-auth class (shown only when logged out)
    const noAuthElements = document.querySelectorAll('.no-auth');

    // Show/hide elements based on login status
    authRequiredElements.forEach(el => {
        el.style.display = loggedIn ? 'block' : 'none';
    });

    noAuthElements.forEach(el => {
        el.style.display = loggedIn ? 'none' : 'block';
    });
}

// Initialize auth functionality on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});
