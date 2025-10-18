// IT Support Dashboard JavaScript
const API_BASE = '/api/itsupport';
let currentBookings = [];
let currentCustomers = [];
let currentFeedback = [];
let currentFeedbackId = null;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboardStats();
    loadBookings();
    initializeEventListeners();
});

// Check authentication and authorization
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const user = localStorage.getItem('userName') || 'IT Support';
    
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    if (role !== 'IT_SUPPORT' && role !== 'IT_ASSISTANT') {
        alert('Access denied. This page is only for IT Support and IT Assistant roles.');
        window.location.href = '/trips.html';
        return;
    }

    // Display current user
    const currentUserElement = document.getElementById('currentUser');
    if (currentUserElement) {
        currentUserElement.textContent = user;
    }
}

// Refresh entire dashboard
function refreshDashboard() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalHTML = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.innerHTML = '<div class="loading-spinner"></div><span>Refreshing...</span>';
    refreshBtn.disabled = true;
    
    // Refresh all data
    Promise.all([
        loadDashboardStats(),
        loadBookings(),
        loadCustomers(),
        loadFeedback()
    ]).then(() => {
        // Success feedback
        showAlert('Dashboard refreshed successfully!', 'success');
        
        // Reset button
        setTimeout(() => {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
        }, 1000);
    }).catch(error => {
        console.error('Error refreshing dashboard:', error);
        showAlert('Error refreshing dashboard. Please try again.', 'error');
        
        // Reset button
        refreshBtn.innerHTML = originalHTML;
        refreshBtn.disabled = false;
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter input change listeners
    const filterInputs = [
        'bookingStatusFilter', 'bookingEmailFilter', 'bookingNameFilter', 
        'bookingTripFilter', 'bookingFromDate', 'bookingToDate',
        'customerSearchFilter',
        'feedbackStatusFilter', 'feedbackCategoryFilter', 'feedbackMinRating', 'feedbackMaxRating'
    ];
    
    filterInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                if (id.startsWith('booking')) applyBookingFilters();
                else if (id.startsWith('customer')) applyCustomerFilters();
                else if (id.startsWith('feedback')) applyFeedbackFilters();
            });
        }
    });

    // Modal close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/dashboard-stats`);
        if (response.ok) {
            const stats = await response.json();
            renderDashboardStats(stats);
        } else {
            console.error('Failed to load dashboard stats');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Render dashboard statistics
function renderDashboardStats(stats) {
    // Update individual stat cards by ID
    updateStatCard('totalBookings', stats.totalBookings || 0);
    updateStatCard('totalCustomers', stats.totalCustomers || 0);
    updateStatCard('totalFeedback', stats.totalFeedbacks || 0);
    updateStatCard('pendingFeedback', stats.pendingFeedbacks || 0);
    updateStatCard('repliedFeedback', stats.repliedFeedbacks || 0);
    updateStatCard('confirmedBookings', stats.confirmedBookings || 0);
}

// Helper function to update individual stat cards
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        // Add animation effect
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
}

// Show alert messages
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of main container
    const mainContainer = document.querySelector('.main-container');
    mainContainer.insertBefore(alertDiv, mainContainer.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and button
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data for the selected tab
    switch (tabName) {
        case 'bookings':
            loadBookings();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'feedback':
            loadFeedback();
            break;
    }
}

// ================= BOOKINGS FUNCTIONALITY =================

// Load all bookings
async function loadBookings() {
    try {
        showLoading('bookingsTableContainer');
        const response = await fetchWithAuth(`${API_BASE}/bookings`);
        if (response.ok) {
            currentBookings = await response.json();
            renderBookingsTable(currentBookings);
        } else {
            showError('bookingsTableContainer', 'Failed to load bookings');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('bookingsTableContainer', 'Error loading bookings');
    }
}

// Apply booking filters
async function applyBookingFilters() {
    const filters = {
        status: document.getElementById('bookingStatusFilter').value,
        customerEmail: document.getElementById('bookingEmailFilter').value,
        customerName: document.getElementById('bookingNameFilter').value,
        tripId: document.getElementById('bookingTripFilter').value,
        fromDate: document.getElementById('bookingFromDate').value,
        toDate: document.getElementById('bookingToDate').value
    };

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });

    try {
        showLoading('bookingsTableContainer');
        const response = await fetchWithAuth(`${API_BASE}/bookings?${queryParams}`);
        if (response.ok) {
            currentBookings = await response.json();
            renderBookingsTable(currentBookings);
        } else {
            showError('bookingsTableContainer', 'Failed to filter bookings');
        }
    } catch (error) {
        console.error('Error filtering bookings:', error);
        showError('bookingsTableContainer', 'Error filtering bookings');
    }
}

// Clear booking filters
function clearBookingFilters() {
    document.getElementById('bookingStatusFilter').value = '';
    document.getElementById('bookingEmailFilter').value = '';
    document.getElementById('bookingNameFilter').value = '';
    document.getElementById('bookingTripFilter').value = '';
    document.getElementById('bookingFromDate').value = '';
    document.getElementById('bookingToDate').value = '';
    loadBookings();
}

// Render bookings table
function renderBookingsTable(bookings) {
    const container = document.getElementById('bookingsTableContainer');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-calendar-times"></i>
                <p>No bookings found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Trip</th>
                    <th>Date</th>
                    <th>Passengers</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>#${booking.bookingId}</td>
                        <td>
                            <strong>${booking.customerName || 'N/A'}</strong><br>
                            <small>${booking.customerEmail || 'N/A'}</small>
                        </td>
                        <td>
                            <strong>${booking.tripName || 'N/A'}</strong><br>
                            <small>Trip ID: ${booking.tripId || 'N/A'}</small>
                        </td>
                        <td>${formatDate(booking.tripDate) || 'N/A'}</td>
                        <td>${booking.numberOfPassengers}</td>
                        <td>
                            <span class="status-badge status-${booking.status ? booking.status.toLowerCase() : 'unknown'}">
                                ${booking.status || 'Unknown'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="viewBookingDetails(${booking.bookingId})">
                                <i class="fas fa-eye"></i>
                                View
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// View booking details
async function viewBookingDetails(bookingId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/bookings/${bookingId}`);
        if (response.ok) {
            const booking = await response.json();
            renderBookingModal(booking);
        } else {
            alert('Failed to load booking details');
        }
    } catch (error) {
        console.error('Error loading booking details:', error);
        alert('Error loading booking details');
    }
}

// Render booking details modal
function renderBookingModal(booking) {
    const modalBody = document.getElementById('bookingModalBody');
    modalBody.innerHTML = `
        <div class="detail-section">
            <h4>Booking Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Booking ID</span>
                    <span class="detail-value">#${booking.bookingId}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">
                        <span class="status-badge status-${booking.status ? booking.status.toLowerCase() : 'unknown'}">
                            ${booking.status || 'Unknown'}
                        </span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Passengers</span>
                    <span class="detail-value">${booking.numberOfPassengers}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Booking Date</span>
                    <span class="detail-value">${formatDateTime(booking.bookingDate) || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${booking.customerName || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${booking.customerEmail || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${booking.customerPhone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Customer ID</span>
                    <span class="detail-value">${booking.customerId || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>Trip Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Trip Name</span>
                    <span class="detail-value">${booking.tripName || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Trip Date</span>
                    <span class="detail-value">${formatDate(booking.tripDate) || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${booking.tripLocation || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Price</span>
                    <span class="detail-value">${booking.tripPrice ? '$' + booking.tripPrice : 'N/A'}</span>
                </div>
            </div>
        </div>

        ${booking.boatName || booking.guideName ? `
        <div class="detail-section">
            <h4>Assignment Information</h4>
            <div class="detail-grid">
                ${booking.boatName ? `
                <div class="detail-item">
                    <span class="detail-label">Boat</span>
                    <span class="detail-value">${booking.boatName} (Capacity: ${booking.boatCapacity || 'N/A'})</span>
                </div>
                ` : ''}
                ${booking.guideName ? `
                <div class="detail-item">
                    <span class="detail-label">Guide</span>
                    <span class="detail-value">${booking.guideName}</span>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('bookingModal').style.display = 'block';
}

// Refresh bookings
function refreshBookings() {
    loadBookings();
}

// ================= CUSTOMERS FUNCTIONALITY =================

// Load all customers
async function loadCustomers() {
    try {
        showLoading('customersTableContainer');
        const response = await fetchWithAuth(`${API_BASE}/customers`);
        if (response.ok) {
            currentCustomers = await response.json();
            renderCustomersTable(currentCustomers);
        } else {
            showError('customersTableContainer', 'Failed to load customers');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showError('customersTableContainer', 'Error loading customers');
    }
}

// Apply customer filters
async function applyCustomerFilters() {
    const search = document.getElementById('customerSearchFilter').value;
    
    try {
        showLoading('customersTableContainer');
        const url = search ? `${API_BASE}/customers?search=${encodeURIComponent(search)}` : `${API_BASE}/customers`;
        const response = await fetchWithAuth(url);
        if (response.ok) {
            currentCustomers = await response.json();
            renderCustomersTable(currentCustomers);
        } else {
            showError('customersTableContainer', 'Failed to filter customers');
        }
    } catch (error) {
        console.error('Error filtering customers:', error);
        showError('customersTableContainer', 'Error filtering customers');
    }
}

// Clear customer filters
function clearCustomerFilters() {
    document.getElementById('customerSearchFilter').value = '';
    loadCustomers();
}

// Render customers table
function renderCustomersTable(customers) {
    const container = document.getElementById('customersTableContainer');
    
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-users"></i>
                <p>No customers found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registration</th>
                    <th>Bookings</th>
                    <th>Feedback</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(customer => `
                    <tr>
                        <td>#${customer.customerId}</td>
                        <td>
                            <strong>${customer.firstName} ${customer.lastName}</strong>
                        </td>
                        <td>${customer.email}</td>
                        <td>${customer.phone || 'N/A'}</td>
                        <td>${formatDate(customer.registrationDate) || 'N/A'}</td>
                        <td>
                            <span class="status-badge status-confirmed">${customer.totalBookings}</span>
                        </td>
                        <td>
                            <span class="status-badge status-replied">${customer.totalFeedbacks}</span>
                        </td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="viewCustomerDetails(${customer.customerId})">
                                <i class="fas fa-eye"></i>
                                View
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// View customer details
async function viewCustomerDetails(customerId) {
    try {
        const [customerResponse, bookingsResponse, feedbackResponse] = await Promise.all([
            fetchWithAuth(`${API_BASE}/customers/${customerId}`),
            fetchWithAuth(`${API_BASE}/customers/${customerId}/bookings`),
            fetchWithAuth(`${API_BASE}/customers/${customerId}/feedback`)
        ]);

        if (customerResponse.ok) {
            const customer = await customerResponse.json();
            const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];
            const feedback = feedbackResponse.ok ? await feedbackResponse.json() : [];
            
            renderCustomerModal(customer, bookings, feedback);
        } else {
            alert('Failed to load customer details');
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        alert('Error loading customer details');
    }
}

// Render customer details modal
function renderCustomerModal(customer, bookings, feedback) {
    const modalBody = document.getElementById('customerModalBody');
    modalBody.innerHTML = `
        <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Customer ID</span>
                    <span class="detail-value">#${customer.customerId}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${customer.firstName} ${customer.lastName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${customer.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${customer.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registration Date</span>
                    <span class="detail-value">${formatDateTime(customer.registrationDate) || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Bookings</span>
                    <span class="detail-value">${customer.totalBookings}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Feedback</span>
                    <span class="detail-value">${customer.totalFeedbacks}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>Recent Bookings</h4>
            ${bookings && bookings.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Trip</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Passengers</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.slice(0, 5).map(booking => `
                            <tr>
                                <td>#${booking.bookingId}</td>
                                <td>${booking.tripName || 'N/A'}</td>
                                <td>${formatDate(booking.tripDate) || 'N/A'}</td>
                                <td>
                                    <span class="status-badge status-${booking.status ? booking.status.toLowerCase() : 'unknown'}">
                                        ${booking.status || 'Unknown'}
                                    </span>
                                </td>
                                <td>${booking.numberOfPassengers}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${bookings.length > 5 ? '<p><small>Showing latest 5 bookings</small></p>' : ''}
            ` : '<p>No bookings found</p>'}
        </div>

        <div class="detail-section">
            <h4>Recent Feedback</h4>
            ${feedback && feedback.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Rating</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${feedback.slice(0, 5).map(fb => `
                            <tr>
                                <td>${fb.title}</td>
                                <td>${fb.category}</td>
                                <td>
                                    <span class="rating-stars">
                                        ${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}
                                    </span>
                                </td>
                                <td>${formatDate(fb.createdAt) || 'N/A'}</td>
                                <td>
                                    <span class="status-badge status-${fb.reply ? 'replied' : 'pending'}">
                                        ${fb.reply ? 'Replied' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${feedback.length > 5 ? '<p><small>Showing latest 5 feedback</small></p>' : ''}
            ` : '<p>No feedback found</p>'}
        </div>
    `;
    
    document.getElementById('customerModal').style.display = 'block';
}

// Refresh customers
function refreshCustomers() {
    loadCustomers();
}

// ================= FEEDBACK FUNCTIONALITY =================

// Load all feedback
async function loadFeedback() {
    try {
        showLoading('feedbackTableContainer');
        const response = await fetchWithAuth(`${API_BASE}/feedback`);
        if (response.ok) {
            currentFeedback = await response.json();
            renderFeedbackTable(currentFeedback);
        } else {
            showError('feedbackTableContainer', 'Failed to load feedback');
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        showError('feedbackTableContainer', 'Error loading feedback');
    }
}

// Apply feedback filters
async function applyFeedbackFilters() {
    const filters = {
        status: document.getElementById('feedbackStatusFilter').value,
        category: document.getElementById('feedbackCategoryFilter').value,
        minRating: document.getElementById('feedbackMinRating').value,
        maxRating: document.getElementById('feedbackMaxRating').value
    };

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });

    try {
        showLoading('feedbackTableContainer');
        const response = await fetchWithAuth(`${API_BASE}/feedback?${queryParams}`);
        if (response.ok) {
            currentFeedback = await response.json();
            renderFeedbackTable(currentFeedback);
        } else {
            showError('feedbackTableContainer', 'Failed to filter feedback');
        }
    } catch (error) {
        console.error('Error filtering feedback:', error);
        showError('feedbackTableContainer', 'Error filtering feedback');
    }
}

// Clear feedback filters
function clearFeedbackFilters() {
    document.getElementById('feedbackStatusFilter').value = '';
    document.getElementById('feedbackCategoryFilter').value = '';
    document.getElementById('feedbackMinRating').value = '';
    document.getElementById('feedbackMaxRating').value = '';
    loadFeedback();
}

// Render feedback table
function renderFeedbackTable(feedback) {
    const container = document.getElementById('feedbackTableContainer');
    
    if (!feedback || feedback.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-comments"></i>
                <p>No feedback found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${feedback.map(fb => `
                    <tr>
                        <td>#${fb.feedbackId}</td>
                        <td>
                            <strong>${fb.customerName || 'Anonymous'}</strong><br>
                            <small>${fb.customerEmail || 'N/A'}</small>
                        </td>
                        <td>${fb.title}</td>
                        <td>${fb.category}</td>
                        <td>
                            <span class="rating-stars">
                                ${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}
                            </span>
                        </td>
                        <td>${formatDate(fb.createdAt) || 'N/A'}</td>
                        <td>
                            <span class="status-badge status-${fb.reply ? 'replied' : 'pending'}">
                                ${fb.reply ? 'Replied' : 'Pending'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="viewFeedbackDetails(${fb.feedbackId})">
                                <i class="fas fa-eye"></i>
                                ${fb.reply ? 'View' : 'Reply'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// View feedback details
async function viewFeedbackDetails(feedbackId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/feedback/${feedbackId}`);
        if (response.ok) {
            const feedback = await response.json();
            currentFeedbackId = feedbackId;
            renderFeedbackModal(feedback);
        } else {
            alert('Failed to load feedback details');
        }
    } catch (error) {
        console.error('Error loading feedback details:', error);
        alert('Error loading feedback details');
    }
}

// Render feedback details modal
function renderFeedbackModal(feedback) {
    const modalBody = document.getElementById('feedbackModalBody');
    modalBody.innerHTML = `
        <div class="detail-section">
            <h4>Feedback Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Feedback ID</span>
                    <span class="detail-value">#${feedback.feedbackId}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Customer</span>
                    <span class="detail-value">${feedback.customerName || 'Anonymous'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${feedback.customerEmail || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">${feedback.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Rating</span>
                    <span class="detail-value">
                        <span class="rating-stars">
                            ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
                        </span>
                        (${feedback.rating}/5)
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${formatDateTime(feedback.createdAt) || 'N/A'}</span>
                </div>
                ${feedback.relatedBookingId ? `
                <div class="detail-item">
                    <span class="detail-label">Related Booking</span>
                    <span class="detail-value">#${feedback.relatedBookingId}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="detail-section">
            <h4>Feedback Content</h4>
            <div class="detail-item">
                <span class="detail-label">Title</span>
                <span class="detail-value">${feedback.title}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Comments</span>
                <div class="detail-value" style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    ${feedback.comments}
                </div>
            </div>
            ${feedback.experience ? `
            <div class="detail-item">
                <span class="detail-label">Experience Details</span>
                <div class="detail-value" style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    ${feedback.experience}
                </div>
            </div>
            ` : ''}
        </div>

        ${feedback.reply ? `
        <div class="detail-section">
            <h4>IT Support Reply</h4>
            <div class="detail-item">
                <span class="detail-label">Replied by</span>
                <span class="detail-value">${feedback.repliedByName || 'IT Support'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Reply</span>
                <div class="detail-value" style="white-space: pre-wrap; background: #e8f4f8; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #0077b6;">
                    ${feedback.reply}
                </div>
            </div>
        </div>
        ` : `
        <div class="reply-section">
            <h4>Reply to Feedback</h4>
            <form class="reply-form" onsubmit="submitFeedbackReply(event)">
                <textarea id="replyText" placeholder="Enter your reply to this feedback..." required></textarea>
                <div class="reply-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeFeedbackModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-reply"></i>
                        Send Reply
                    </button>
                </div>
            </form>
        </div>
        `}
    `;
    
    document.getElementById('feedbackModal').style.display = 'block';
}

// Submit feedback reply
async function submitFeedbackReply(event) {
    event.preventDefault();
    
    const replyText = document.getElementById('replyText').value.trim();
    if (!replyText) {
        alert('Please enter a reply');
        return;
    }
    
    if (!currentFeedbackId) {
        alert('Error: No feedback selected');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}/feedback/${currentFeedbackId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply: replyText })
        });

        if (response.ok) {
            const result = await response.json();
            showAlert('Reply sent successfully!', 'success');
            closeFeedbackModal();
            loadFeedback();
            loadDashboardStats();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send reply');
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        showAlert('Error sending reply: ' + error.message, 'error');
    }
}

// Close feedback modal
function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
    currentFeedbackId = null;
}

// Refresh feedback
function refreshFeedback() {
    loadFeedback();
}

// ================= UTILITY FUNCTIONS =================

// Make authenticated API requests
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading spinner
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="no-data">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

// Show error message
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="no-data">
            <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
            <p style="color: #dc3545;">${message}</p>
        </div>
    `;
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/login.html';
}