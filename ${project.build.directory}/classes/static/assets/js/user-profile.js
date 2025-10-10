/**
 * User profile display functionality for Boat Safari application
 */

// Get user data from localStorage or server
async function getUserData() {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
        return {
            name: 'Guest',
            email: '',
            avatar: 'https://ui-avatars.com/api/?name=Guest&background=0E3A5B&color=fff'
        };
    }

    // Try to get cached user data first for immediate display
    const cachedUserData = localStorage.getItem('userDetails');
    let userData = cachedUserData ? JSON.parse(cachedUserData) : null;

    // Fetch fresh data from server in background
    try {
        const response = await fetch('/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            userData = await response.json();
            // Cache the user data
            localStorage.setItem('userDetails', JSON.stringify(userData));
        } else if (!userData) {
            // If API call failed and we don't have cached data
            // Extract name from token (if possible) or use placeholder
            const role = localStorage.getItem('userRole') || 'user';
            return {
                name: role.charAt(0).toUpperCase() + role.slice(1),
                email: '',
                avatar: `https://ui-avatars.com/api/?name=${role}&background=0E3A5B&color=fff`
            };
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // If there was an error and we don't have cached data
        if (!userData) {
            return {
                name: 'User',
                email: '',
                avatar: 'https://ui-avatars.com/api/?name=User&background=0E3A5B&color=fff'
            };
        }
    }

    // Ensure we have default values if any property is missing
    return {
        name: userData.name || userData.firstName || 'User',
        email: userData.email || '',
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=0E3A5B&color=fff`
    };
}

// Initialize user profile dropdown in the navigation bar
async function initUserProfile() {
    const isUserLoggedIn = isLoggedIn(); // Using the function from auth.js

    // Find the nav-links element to add our profile dropdown
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Create profile dropdown container
    const userProfileContainer = document.createElement('div');
    userProfileContainer.className = 'user-profile-container';

    if (isUserLoggedIn) {
        // First create a placeholder while we load data
        userProfileContainer.innerHTML = `
            <div class="profile-dropdown">
                <div class="profile-dropdown-btn">
                    <div class="profile-img">
                        <img src="https://ui-avatars.com/api/?name=Loading&background=0E3A5B&color=fff" alt="Loading">
                    </div>
                    <span class="profile-name">Loading...</span>
                    <i class="fa fa-angle-down"></i>
                </div>
                <ul class="profile-dropdown-list">
                    <li class="profile-dropdown-list-item">
                        <a href="/profile.html">
                            <i class="fa fa-user"></i>
                            My Profile
                        </a>
                    </li>
                    <li class="profile-dropdown-list-item">
                        <a href="/booking-history.html">
                            <i class="fa fa-history"></i>
                            Booking History
                        </a>
                    </li>
                    <li class="profile-dropdown-list-item">
                        <a href="#" id="logout-btn">
                            <i class="fa fa-sign-out-alt"></i>
                            Log Out
                        </a>
                    </li>
                </ul>
            </div>
        `;

        // Add the profile container to the navigation
        navLinks.appendChild(userProfileContainer);

        // Fetch user data asynchronously
        const userData = await getUserData();

        // Update the profile display with the fetched user data
        const profileBtn = document.querySelector('.profile-dropdown-btn');
        if (profileBtn) {
            profileBtn.querySelector('.profile-img img').src = userData.avatar;
            profileBtn.querySelector('.profile-name').textContent = userData.name;
        }

        // Set up event listeners
        const dropdownBtn = document.querySelector('.profile-dropdown-btn');
        const dropdownList = document.querySelector('.profile-dropdown-list');

        if (dropdownBtn && dropdownList) {
            dropdownBtn.addEventListener('click', function() {
                dropdownList.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.profile-dropdown')) {
                    dropdownList.classList.remove('active');
                }
            });

            // Logout functionality
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Remove stored user details
                    localStorage.removeItem('userDetails');
                    logout(); // Using the function from auth.js
                });
            }
        }
    } else {
        // User is not logged in - show login/register buttons
        userProfileContainer.innerHTML = `
            <div class="auth-buttons">
                <a href="/login.html" class="login-btn">Login</a>
                <a href="/register.html" class="register-btn">Register</a>
            </div>
        `;

        // Add the profile container to the navigation
        navLinks.appendChild(userProfileContainer);
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initUserProfile();
});
