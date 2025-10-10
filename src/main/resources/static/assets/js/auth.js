/**
 * Authentication utilities for Boat Safari application
 */

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Check if user is authenticated and has specific role
function isAuthenticated(requiredRole) {
    if (!isLoggedIn()) return false;

    // If no specific role is required, just check if logged in
    if (!requiredRole) return true;

    // Get user role from local storage - check both userRole direct key and inside userDetails
    const userRole = getUserRole();

    // For ADMIN, allow access to everything
    if (userRole === 'ADMIN') return true;

    // Handle guide role variations
    if (requiredRole === 'GUIDE' && (userRole === 'GUIDE' || userRole === 'SAFARI_GUIDE' || userRole === 'SAFARIGUIDE')) return true;

    // Handle staff role variations  
    if (requiredRole === 'STAFF' && (userRole === 'STAFF' || userRole === 'STAFFMEMBER')) return true;

    // Handle IT support variations
    if (requiredRole === 'IT_SUPPORT' && (userRole === 'IT_SUPPORT' || userRole === 'ITSUPPORT')) return true;

    // Handle IT assistant variations
    if (requiredRole === 'IT_ASSISTANT' && (userRole === 'IT_ASSISTANT' || userRole === 'ITASSISTANT')) return true;

    // Otherwise, check if user has the specific required role
    return userRole === requiredRole;
}

// Check if user is any kind of staff member
function isStaffMember() {
    const userRole = getUserRole();
    const staffRoles = ['STAFF', 'STAFFMEMBER', 'SAFARI_GUIDE', 'SAFARIGUIDE', 'IT_SUPPORT', 'ITSUPPORT', 'IT_ASSISTANT', 'ITASSISTANT', 'GUIDE', 'CAPTAIN', 'ADMIN'];
    return staffRoles.includes(userRole);
}

// Get user role
function getUserRole() {
    // Check both places where role might be stored
    const directRole = localStorage.getItem('userRole');
    if (directRole) return directRole;

    const userDetails = getCurrentUser();
    return userDetails ? userDetails.role : null;
}

// Get current user details
function getCurrentUser() {
    const userJSON = localStorage.getItem('userDetails');
    return userJSON ? JSON.parse(userJSON) : null;
}

// Get user token
function getToken() {
    return localStorage.getItem('token');
}

// Store authentication token
function setToken(token) {
    localStorage.setItem('token', token);
}

// Store user details
function setUserDetails(user) {
    localStorage.setItem('userDetails', JSON.stringify(user));
    // Also store role separately for consistency
    if (user && user.role) {
        localStorage.setItem('userRole', user.role);
    }
}

// Sign out function
function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userRole');
    window.location.href = '/login.html';
}

// Remove token and perform logout
function logout() {
    // Clear the authentication token from localStorage
    localStorage.removeItem('token');
    // Also clear cached user details
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userRole');

    // Redirect to login page
    window.location.href = '/login.html';
}

// Check authentication on page load and show/hide appropriate elements
function updateAuthUI() {
    const loggedIn = isLoggedIn();
    const userRole = getUserRole();

    // Get all elements with auth-required class
    const authRequiredElements = document.querySelectorAll('.auth-required');
    // Get all elements with no-auth class (shown only when logged out)
    const noAuthElements = document.querySelectorAll('.no-auth');

    // Role-specific elements
    const adminElements = document.querySelectorAll('.admin-only');
    const guideElements = document.querySelectorAll('.guide-only');
    const customerElements = document.querySelectorAll('.customer-only');
    const staffElements = document.querySelectorAll('.staff-only');

    // Show/hide elements based on login status
    authRequiredElements.forEach(el => {
        el.style.display = loggedIn ? 'block' : 'none';
    });

    noAuthElements.forEach(el => {
        el.style.display = loggedIn ? 'none' : 'block';
    });

    // Show/hide elements based on user role
    adminElements.forEach(el => {
        el.style.display = (userRole === 'ADMIN') ? 'block' : 'none';
    });

    guideElements.forEach(el => {
        el.style.display = (userRole === 'GUIDE' || userRole === 'SAFARI_GUIDE') ? 'block' : 'none';
    });

    customerElements.forEach(el => {
        el.style.display = (userRole === 'CUSTOMER') ? 'block' : 'none';
    });

    staffElements.forEach(el => {
        el.style.display = (userRole === 'STAFF' || userRole === 'STAFFMEMBER') ? 'block' : 'none';
    });

    // Update user name if available
    const userNameElements = document.querySelectorAll('.user-name');
    if (loggedIn) {
        const user = getCurrentUser();
        if (user && userNameElements) {
            userNameElements.forEach(el => {
                el.textContent = `${user.firstName} ${user.lastName || ''}`;
            });
        }
    }

    // Add dashboard link based on role
    const dashboardLink = document.getElementById('dashboard-link');
    if (dashboardLink && loggedIn) {
        switch(userRole) {
            case 'ADMIN':
                dashboardLink.href = '/admin.html';
                dashboardLink.textContent = 'Admin Dashboard';
                dashboardLink.style.display = 'block';
                break;
            case 'GUIDE':
            case 'SAFARI_GUIDE':
            case 'SAFARIGUIDE':
                dashboardLink.href = '/guide.html';
                dashboardLink.textContent = 'Guide Dashboard';
                dashboardLink.style.display = 'block';
                break;
            case 'STAFF':
            case 'STAFFMEMBER':
            case 'IT_SUPPORT':
            case 'ITSUPPORT':
            case 'IT_ASSISTANT':
            case 'ITASSISTANT':
                dashboardLink.href = '/staff.html';
                dashboardLink.textContent = 'Staff Portal';
                dashboardLink.style.display = 'block';
                break;
            default:
                dashboardLink.style.display = 'none';
        }
    }
}

// Initialize auth functionality on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();

    // Add event listeners for logout buttons
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});
