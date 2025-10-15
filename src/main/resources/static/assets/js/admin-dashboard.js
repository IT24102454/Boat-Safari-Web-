// Enhanced Admin Dashboard JavaScript
// This file contains the JavaScript for the modern admin dashboard with charts and export functionality

// Global variables
let currentTrips = [];
let currentBookings = [];
let availableStaff = [];
let availableBoats = [];
let upcomingTrips = [];
let charts = {};
let currentUsersData = [];
let currentTripsData = [];
let currentStaffData = [];
let currentBookingsData = [];

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'ADMIN') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    loadInitialData();

    // Set up logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });

    // Set up form submit handlers
    setupFormHandlers();
});

// Initialize dashboard
function initializeDashboard() {
    // Show analytics tab by default
    showTab('analytics');
    
    // Initialize charts
    initializeCharts();
    
    // Load dashboard stats
    loadDashboardStats();
}

// Load initial data
function loadInitialData() {
    loadUsers();
    loadTrips();
    loadBookings();
    loadStaffMembers();
    loadBoats();
    loadGuides();
}

// Show different tabs of the dashboard
function showTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab pane
    const selectedPane = document.getElementById(tabName);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }

    // Add active class to clicked button
    const clickedButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Load tab-specific data
    switch(tabName) {
        case 'analytics':
            updateCharts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'trips':
            loadTrips();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'boats':
            loadBoats();
            break;
        case 'staff-management':
            loadStaffMembers();
            break;
        case 'reports':
            loadRecentExports();
            break;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const [usersResponse, tripsResponse, bookingsResponse, staffResponse, boatsResponse] = await Promise.all([
            fetch('/api/admin/users', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }),
            fetch('/api/trips', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }),
            fetch('/api/bookings', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }),
            fetch('/api/staff/all', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }),
            fetch('/api/admin/boats', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
        ]);

        const users = usersResponse.ok ? await usersResponse.json() : [];
        const trips = tripsResponse.ok ? await tripsResponse.json() : [];
        const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];
        const staff = staffResponse.ok ? await staffResponse.json() : [];
        const boats = boatsResponse.ok ? await boatsResponse.json() : [];

        // Calculate revenue - fix field name
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalCost || booking.totalAmount || 0), 0);

        // Update stat cards
        document.getElementById('totalUsers').textContent = users.length || 0;
        document.getElementById('totalTrips').textContent = trips.length || 0;
        document.getElementById('totalBookings').textContent = bookings.length || 0;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        const totalBoatsElement = document.getElementById('totalBoats');
        if (totalBoatsElement) {
            totalBoatsElement.textContent = boats.length || 0;
        }
        document.getElementById('totalStaff').textContent = staff.length || 0;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Initialize charts
function initializeCharts() {
    initializeBookingTrendsChart();
    initializeUserDistributionChart();
    initializeRevenueChart();
    initializeTripPerformanceChart();
}

// Initialize booking trends chart
function initializeBookingTrendsChart() {
    const ctx = document.getElementById('bookingTrendsChart').getContext('2d');
    charts.bookingTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Bookings',
                data: [],
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize user distribution chart
function initializeUserDistributionChart() {
    const ctx = document.getElementById('userDistributionChart').getContext('2d');
    charts.userDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Customers', 'Guides', 'Staff', 'Admins'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize revenue chart
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue ($)',
                data: [],
                backgroundColor: '#27ae60',
                borderColor: '#229954',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize trip performance chart
function initializeTripPerformanceChart() {
    const ctx = document.getElementById('tripPerformanceChart').getContext('2d');
    charts.tripPerformance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Capacity Utilization', 'Customer Satisfaction', 'On-time Performance', 'Safety Score', 'Revenue per Trip'],
            datasets: [{
                label: 'Performance Metrics',
                data: [0, 0, 0, 0, 0],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                pointBackgroundColor: '#9b59b6'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Update all charts with fresh data
async function updateCharts() {
    try {
        await Promise.all([
            updateBookingTrendsChart(),
            updateUserDistributionChart(),
            updateRevenueChart(),
            updateTripPerformanceChart()
        ]);
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Update booking trends chart
async function updateBookingTrendsChart() {
    try {
        const response = await fetch('/api/bookings', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const bookings = await response.json();
            
            // Process bookings to create trend data
            const last30Days = [];
            const bookingCounts = [];
            const today = new Date();
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last30Days.push(dateStr);
                
                const dayBookings = bookings.filter(booking => {
                    const bookingDate = new Date(booking.bookingDate || booking.createdAt);
                    return bookingDate.toISOString().split('T')[0] === dateStr;
                });
                bookingCounts.push(dayBookings.length);
            }
            
            charts.bookingTrends.data.labels = last30Days.map(date => {
                const d = new Date(date);
                return (d.getMonth() + 1) + '/' + d.getDate();
            });
            charts.bookingTrends.data.datasets[0].data = bookingCounts;
            charts.bookingTrends.update();
        } else {
            // Generate mock data if API not available
            const last30Days = [];
            const bookingCounts = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last30Days.push(date.toLocaleDateString());
                bookingCounts.push(Math.floor(Math.random() * 20));
            }
            charts.bookingTrends.data.labels = last30Days;
            charts.bookingTrends.data.datasets[0].data = bookingCounts;
            charts.bookingTrends.update();
        }
    } catch (error) {
        console.error('Error updating booking trends chart:', error);
    }
}

// Update user distribution chart
async function updateUserDistributionChart() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const users = await response.json();
            const roleDistribution = {
                CUSTOMER: 0,
                SAFARI_GUIDE: 0,
                STAFF: 0,
                ADMIN: 0
            };

            users.forEach(user => {
                if (roleDistribution.hasOwnProperty(user.role)) {
                    roleDistribution[user.role]++;
                }
            });

            charts.userDistribution.data.datasets[0].data = [
                roleDistribution.CUSTOMER,
                roleDistribution.SAFARI_GUIDE,
                roleDistribution.STAFF,
                roleDistribution.ADMIN
            ];
            charts.userDistribution.update();
        }
    } catch (error) {
        console.error('Error updating user distribution chart:', error);
    }
}

// Update revenue chart
async function updateRevenueChart() {
    try {
        const response = await fetch('/api/bookings', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const bookings = await response.json();
            
            // Process bookings to create monthly revenue data
            const monthlyRevenue = {};
            const months = [];
            const today = new Date();
            
            // Generate last 6 months
            for (let i = 5; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
                const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
                months.push(monthLabel);
                monthlyRevenue[monthKey] = 0;
            }
            
            // Calculate revenue for each month - fix field name
            bookings.forEach(booking => {
                if ((booking.totalCost || booking.totalAmount) && (booking.holdTimer || booking.bookingDate)) {
                    const bookingMonth = (booking.holdTimer || booking.bookingDate).slice(0, 7);
                    if (monthlyRevenue.hasOwnProperty(bookingMonth)) {
                        monthlyRevenue[bookingMonth] += (booking.totalCost || booking.totalAmount);
                    }
                }
            });
            
            const revenueValues = Object.values(monthlyRevenue);
            charts.revenue.data.labels = months;
            charts.revenue.data.datasets[0].data = revenueValues;
            charts.revenue.update();
        } else {
            // Generate mock data if API not available
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const revenues = months.map(() => Math.floor(Math.random() * 50000));
            charts.revenue.data.labels = months;
            charts.revenue.data.datasets[0].data = revenues;
            charts.revenue.update();
        }
    } catch (error) {
        console.error('Error updating revenue chart:', error);
    }
}

// Update trip performance chart
async function updateTripPerformanceChart() {
    try {
        const response = await fetch('/api/trips', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const trips = await response.json();
            
            // Process trips to create performance data
            const routePerformance = {};
            
            trips.forEach(trip => {
                const route = trip.route || 'Unknown Route';
                if (!routePerformance[route]) {
                    routePerformance[route] = {
                        capacity: 0,
                        totalCapacity: 0,
                        tripCount: 0
                    };
                }
                routePerformance[route].capacity += trip.capacity || 0;
                routePerformance[route].totalCapacity += trip.capacity || 0;
                routePerformance[route].tripCount++;
            });
            
            const routes = Object.keys(routePerformance).slice(0, 5); // Top 5 routes
            const performanceScores = routes.map(route => {
                const data = routePerformance[route];
                return Math.round((data.capacity / data.tripCount) * 100 / 50); // Approximate score
            });
            
            charts.tripPerformance.data.labels = routes;
            charts.tripPerformance.data.datasets[0].data = performanceScores;
            charts.tripPerformance.update();
        } else {
            // Generate mock data if API not available
            const mockData = [85, 92, 78, 95, 88]; // Mock performance scores
            charts.tripPerformance.data.datasets[0].data = mockData;
            charts.tripPerformance.update();
        }
    } catch (error) {
        console.error('Error updating trip performance chart:', error);
    }
}

// Load users data
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        currentUsersData = users; // Store for edit operations
        
        // Check if any filters are active and apply them
        const searchInput = document.getElementById('userSearchInput');
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput && (searchInput.value || roleFilter.value || statusFilter.value)) {
            filterUsers(); // Apply existing filters
        } else {
            displayUsers(users); // Show all users
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
    }
}

// Display users in table
function displayUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.userId || 'N/A'}</td>
            <td>${user.firstName || ''} ${user.secondName || ''}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.role || 'N/A'}</td>
            <td><span class="status-badge status-${(user.status || 'active').toLowerCase()}">${user.status || 'Active'}</span></td>
            <td>${user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editUser(${user.userId})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.userId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter users based on search criteria
function filterUsers() {
    if (!currentUsersData || currentUsersData.length === 0) {
        console.warn('No user data available for filtering');
        return;
    }

    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (!searchInput || !roleFilter || !statusFilter) {
        console.error('Filter elements not found');
        return;
    }

    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRole = roleFilter.value;
    const selectedStatus = statusFilter.value;

    console.log('Filtering users with:', { searchTerm, selectedRole, selectedStatus });

    let filteredUsers = currentUsersData.filter(user => {
        // Search filter (name or email)
        const matchesSearch = !searchTerm || 
            (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
            (user.secondName && user.secondName.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));

        // Role filter
        const matchesRole = !selectedRole || user.role === selectedRole;

        // Status filter
        const userStatus = user.status || 'ACTIVE';
        const matchesStatus = !selectedStatus || userStatus.toUpperCase() === selectedStatus.toUpperCase();

        return matchesSearch && matchesRole && matchesStatus;
    });

    console.log(`Filtered ${filteredUsers.length} users from ${currentUsersData.length} total`);
    displayUsers(filteredUsers);

    // Update filter results info
    updateFilterResults(filteredUsers.length, currentUsersData.length);
}

// Clear all filters
function clearUserFilters() {
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = '';
    if (statusFilter) statusFilter.value = '';

    // Show all users
    if (currentUsersData) {
        displayUsers(currentUsersData);
        updateFilterResults(currentUsersData.length, currentUsersData.length);
    }
}

// Update filter results information
function updateFilterResults(filtered, total) {
    // Remove existing results info if any
    const existingInfo = document.querySelector('.filter-results-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    // Add filter results info
    const filterSection = document.querySelector('.filter-section');
    if (filterSection && filtered !== total) {
        const resultsInfo = document.createElement('div');
        resultsInfo.className = 'filter-results-info';
        resultsInfo.style.cssText = 'margin-top: 10px; padding: 8px 12px; background: #e8f4fd; color: #2980b9; border-radius: 5px; font-size: 14px; border-left: 4px solid #3498db;';
        resultsInfo.innerHTML = `<i class="fas fa-info-circle"></i> Showing ${filtered} of ${total} users`;
        filterSection.appendChild(resultsInfo);
    }
}

// Load trips data
async function loadTrips() {
    try {
        const response = await fetch('/api/trips', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trips');
        }

        const trips = await response.json();
        currentTrips = trips;
        currentTripsData = trips; // Store for edit operations
        displayTrips(trips);
    } catch (error) {
        console.error('Error loading trips:', error);
        showNotification('Failed to load trips', 'error');
    }
}

// Display trips in table
function displayTrips(trips) {
    const tableBody = document.getElementById('tripsTableBody');
    if (!tableBody) return;

    if (trips.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="11" class="loading">No trips found</td></tr>';
        return;
    }

    tableBody.innerHTML = trips.map(trip => `
        <tr>
            <td>${trip.tripId || 'N/A'}</td>
            <td>${trip.date || 'N/A'}</td>
            <td>${trip.startTime || 'N/A'}</td>
            <td>${trip.endTime || 'N/A'}</td>
            <td>${trip.route || 'N/A'}</td>
            <td>${trip.capacity || 'N/A'}</td>
            <td>$${trip.price || '0.00'}</td>
            <td>${trip.boat?.name || 'Unassigned'}</td>
            <td>${trip.guide?.firstName || 'Unassigned'} ${trip.guide?.secondName || ''}</td>
            <td><span class="status-badge status-${(trip.status || 'active').toLowerCase()}">${trip.status || 'Active'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editTrip(${trip.tripId})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTrip(${trip.tripId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load bookings data
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        currentBookings = bookings;
        currentBookingsData = bookings; // Store for edit operations
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Failed to load bookings', 'error');
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody) return;

    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading">No bookings found</td></tr>';
        return;
    }

    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.bookingId || 'N/A'}</td>
            <td>${booking.name || booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}</td>
            <td>${booking.trip?.route || booking.trip?.name || 'N/A'}</td>
            <td>${booking.trip?.date || 'N/A'}</td>
            <td>${booking.passengers || 'N/A'}</td>
            <td>$${(booking.totalCost || booking.totalAmount || 0).toFixed(2)}</td>
            <td><span class="status-badge status-${(booking.status || booking.bookingStatus || 'confirmed').toLowerCase()}">${booking.status || booking.bookingStatus || 'Confirmed'}</span></td>
            <td>${booking.holdTimer ? new Date(booking.holdTimer).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editBooking(${booking.bookingId})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="cancelBooking(${booking.bookingId})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Open edit booking modal
async function openEditBookingModal(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch booking details');
        }

        const booking = await response.json();

        // Create modal HTML with enhanced styling
        const modalHTML = `
            <div id="editBookingModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-edit"></i>
                            Edit Booking #${booking.bookingId}
                        </h3>
                        <button class="close" onclick="closeEditBookingModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editBookingForm">
                            <div class="form-group">
                                <label class="form-label" for="edit-customer-name">Customer Name:</label>
                                <input type="text" class="form-control" id="edit-customer-name" value="${booking.name || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-contact">Contact:</label>
                                <input type="text" class="form-control" id="edit-contact" value="${booking.contact || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-email">Email:</label>
                                <input type="email" class="form-control" id="edit-email" value="${booking.email || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-passengers">Number of Passengers:</label>
                                <input type="number" class="form-control" id="edit-passengers" value="${booking.passengers || 1}" min="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-booking-status">Booking Status:</label>
                                <select class="form-control" id="edit-booking-status" required>
                                    <option value="PROVISIONAL" ${booking.status === 'PROVISIONAL' ? 'selected' : ''}>Provisional</option>
                                    <option value="CONFIRMED" ${booking.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                                    <option value="CANCELLED" ${booking.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                                    <option value="COMPLETED" ${booking.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-total-cost">Total Cost:</label>
                                <input type="number" class="form-control" id="edit-total-cost" value="${booking.totalCost || 0}" step="0.01" min="0" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-modal btn-cancel" onclick="closeEditBookingModal()">Cancel</button>
                        <button type="button" class="btn-modal btn-primary" onclick="saveBookingChanges(${bookingId})">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

    } catch (error) {
        console.error('Error opening edit booking modal:', error);
        showNotification('Failed to open booking details: ' + error.message, 'error');
    }
}

// Close edit booking modal
function closeEditBookingModal() {
    const modal = document.getElementById('editBookingModal');
    if (modal) {
        modal.remove();
    }
}

// Save booking changes
async function saveBookingChanges(bookingId) {
    try {
        const bookingData = {
            name: document.getElementById('edit-customer-name').value,
            contact: document.getElementById('edit-contact').value,
            email: document.getElementById('edit-email').value,
            passengers: parseInt(document.getElementById('edit-passengers').value),
            status: document.getElementById('edit-booking-status').value,
            totalCost: parseFloat(document.getElementById('edit-total-cost').value)
        };

        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error('Failed to update booking');
        }

        closeEditBookingModal();
        loadBookings();
        loadDashboardStats();
        showNotification('Booking updated successfully', 'success');

    } catch (error) {
        console.error('Error saving booking changes:', error);
        showNotification('Failed to update booking: ' + error.message, 'error');
    }
}

// Load staff members data
async function loadStaffMembers() {
    try {
        const response = await fetch('/api/staff/all', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch staff members');
        }

        const staff = await response.json();
        availableStaff = staff;
        currentStaffData = staff; // Store for edit operations
        displayStaffMembers(staff);
    } catch (error) {
        console.error('Error loading staff members:', error);
        showNotification('Failed to load staff members', 'error');
    }
}

// Display staff members in table
function displayStaffMembers(staff) {
    const tableBody = document.getElementById('staffTableBody');
    if (!tableBody) return;

    if (staff.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="loading">No staff members found</td></tr>';
        return;
    }

    tableBody.innerHTML = staff.map(member => `
        <tr>
            <td>${member.userId || 'N/A'}</td>
            <td>${member.firstName || ''} ${member.secondName || ''}</td>
            <td>${member.email || 'N/A'}</td>
            <td>${member.role || 'N/A'}</td>
            <td>${member.phone || 'N/A'}</td>
            <td><span class="status-badge status-${(member.status || 'active').toLowerCase()}">${member.status || 'Active'}</span></td>
            <td>${member.hireDate ? new Date(member.hireDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editStaffMember(${member.userId})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStaffMember(${member.userId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load boats data
async function loadBoats() {
    try {
        const response = await fetch('/api/boats', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const boats = await response.json();
            availableBoats = boats;
            populateBoatSelects(boats);
        }
    } catch (error) {
        console.error('Error loading boats:', error);
    }
}

// Load guides data
async function loadGuides() {
    try {
        const response = await fetch('/api/guides', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const guides = await response.json();
            console.log('Loaded guides:', guides); // Debug log
            console.log('Guide count:', guides.length); // Debug log
            populateGuideSelects(guides);
        }
    } catch (error) {
        console.error('Error loading guides:', error);
    }
}

// Load both boats and guides for trip forms
async function loadBoatsAndGuides() {
    try {
        await Promise.all([loadBoats(), loadGuides()]);
    } catch (error) {
        console.error('Error loading boats and guides:', error);
    }
}

// Populate boat select dropdowns
function populateBoatSelects(boats) {
    const selects = ['boat', 'edit-boat'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Boat</option>' +
                boats.map(boat => `<option value="${boat.boatId}">${boat.name}</option>`).join('');
        }
    });
}

// Populate guide select dropdowns
function populateGuideSelects(guides) {
    const selects = ['guide', 'edit-guide'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Guide</option>' +
                guides.map(guide => `<option value="${guide.userId}">${guide.firstName} ${guide.secondName || guide.lastName || ''}</option>`).join('');
        }
    });
}

// Export functionality
function exportUsers() {
    const format = prompt('Export format (csv/excel/json):', 'csv');
    if (format) {
        exportData('users', format);
    }
}

function exportTrips() {
    const format = prompt('Export format (csv/excel/json):', 'csv');
    if (format) {
        exportData('trips', format);
    }
}

function exportBookings() {
    const format = prompt('Export format (csv/excel/json):', 'csv');
    if (format) {
        exportData('bookings', format);
    }
}

function exportStaff() {
    const format = prompt('Export format (csv/excel/json):', 'csv');
    if (format) {
        exportData('staff', format);
    }
}

// General export function
async function exportData(dataType, format) {
    try {
        let data;
        let filename;
        
        switch(dataType) {
            case 'users':
                data = await fetchData('/api/users');
                filename = 'users_export';
                break;
            case 'trips':
                data = currentTrips.length > 0 ? currentTrips : await fetchData('/api/trips');
                filename = 'trips_export';
                break;
            case 'bookings':
                data = currentBookings.length > 0 ? currentBookings : await fetchData('/api/bookings');
                filename = 'bookings_export';
                break;
            case 'staff':
                data = availableStaff.length > 0 ? availableStaff : await fetchData('/api/staff');
                filename = 'staff_export';
                break;
            default:
                throw new Error('Invalid data type');
        }

        if (format === 'csv') {
            exportToCSV(data, filename);
        } else if (format === 'excel') {
            exportToExcel(data, filename);
        } else if (format === 'json') {
            exportToJSON(data, filename);
        }

        showNotification(`${dataType} exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Fetch data helper
async function fetchData(endpoint) {
    const response = await fetch(endpoint, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    
    return await response.json();
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

// Export to Excel
function exportToExcel(data, filename) {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Export to JSON
function exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Generate comprehensive report
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const exportFormat = document.getElementById('exportFormat').value;

    if (!reportType) {
        showNotification('Please select a report type', 'error');
        return;
    }

    if (exportFormat === 'pdf') {
        generatePDFReport(reportType, dateFrom, dateTo);
    } else {
        generateDataReport(reportType, dateFrom, dateTo, exportFormat);
    }
}

// Generate PDF report
function generatePDFReport(reportType, dateFrom, dateTo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${reportType.toUpperCase()} REPORT`, 20, 20);
    
    // Add date range
    if (dateFrom && dateTo) {
        doc.setFontSize(12);
        doc.text(`Period: ${dateFrom} to ${dateTo}`, 20, 30);
    }
    
    // Add content based on report type
    let yPosition = 50;
    
    switch(reportType) {
        case 'comprehensive':
            doc.text('SYSTEM OVERVIEW', 20, yPosition);
            yPosition += 20;
            doc.text(`Total Users: ${document.getElementById('totalUsers').textContent}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Total Trips: ${document.getElementById('totalTrips').textContent}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Total Bookings: ${document.getElementById('totalBookings').textContent}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Total Revenue: ${document.getElementById('totalRevenue').textContent}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Staff Members: ${document.getElementById('totalStaff').textContent}`, 20, yPosition);
            break;
        default:
            doc.text(`${reportType.toUpperCase()} data report generated on ${new Date().toLocaleDateString()}`, 20, yPosition);
    }
    
    // Save the PDF
    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('PDF report generated successfully', 'success');
}

// Generate data report
async function generateDataReport(reportType, dateFrom, dateTo, format) {
    try {
        let endpoint;
        switch(reportType) {
            case 'bookings':
                endpoint = '/api/bookings';
                break;
            case 'users':
                endpoint = '/api/users';
                break;
            case 'trips':
                endpoint = '/api/trips';
                break;
            case 'staff':
                endpoint = '/api/staff';
                break;
            case 'revenue':
                endpoint = '/api/bookings';
                break;
            default:
                throw new Error('Invalid report type');
        }

        const data = await fetchData(endpoint);
        exportData(reportType, format);
    } catch (error) {
        console.error('Report generation error:', error);
        showNotification('Report generation failed: ' + error.message, 'error');
    }
}

// Export all data
async function exportAllData() {
    try {
        const format = document.getElementById('exportFormat').value || 'json';
        const allData = {
            users: await fetchData('/api/users'),
            trips: await fetchData('/api/trips'),
            bookings: await fetchData('/api/bookings'),
            staff: await fetchData('/api/staff'),
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            exportToJSON(allData, 'complete_system_export');
        } else if (format === 'excel') {
            // Create workbook with multiple sheets
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.users), 'Users');
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.trips), 'Trips');
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.bookings), 'Bookings');
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.staff), 'Staff');
            XLSX.writeFile(workbook, 'complete_system_export.xlsx');
        }

        showNotification('Complete system data exported successfully', 'success');
    } catch (error) {
        console.error('Export all data error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Schedule report
function scheduleReport() {
    showNotification('Report scheduling feature will be available soon', 'info');
}

// Load recent exports
function loadRecentExports() {
    const recentExportsContainer = document.getElementById('recentExports');
    if (recentExportsContainer) {
        recentExportsContainer.innerHTML = '<p>Recent export history will be displayed here when available.</p>';
    }
}

// Modal functions
function openAddUserModal() {
    // Reset form
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
        delete form.dataset.mode;
        delete form.dataset.userId;
    }
    
    // Reset the password field to required for new users
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.setAttribute('required', 'required');
        passwordField.placeholder = '';
        passwordField.value = '';
    }
    
    // Reset modal title and button text
    const modalTitle = document.querySelector('#addUserModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
    }
    
    const submitButton = document.querySelector('#addUserForm button[type="submit"], button[form="addUserForm"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save"></i> Save User';
    }
    
    document.getElementById('addUserModal').style.display = 'block';
}

function openAddTripModal() {
    // Reset form and modal state
    const form = document.getElementById('addTripForm');
    if (form) {
        form.reset();
        delete form.dataset.mode;
        delete form.dataset.tripId;
    }
    
    // Reset modal title and button text
    const modalTitle = document.querySelector('#addTripModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-route"></i> Add New Trip';
    }
    
    const submitButton = document.querySelector('#addTripForm button[type="submit"], button[form="addTripForm"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save"></i> Save Trip';
    }
    
    // Load boats and guides for the dropdowns
    loadBoatsAndGuides();
    
    document.getElementById('addTripModal').style.display = 'block';
}

function openAddStaffModal() {
    document.getElementById('addStaffModal').style.display = 'block';
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Setup form submit handlers
function setupFormHandlers() {
    // Add User form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                firstName: document.getElementById('firstName').value,
                secondName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                contactNo: document.getElementById('phone').value,
                role: document.getElementById('role').value
            };

            // Add password only if creating new user
            const isEditMode = addUserForm.dataset.mode === 'edit';
            if (!isEditMode) {
                userData.password = document.getElementById('password').value;
            }

            try {
                const isEditMode = addUserForm.dataset.mode === 'edit';
                
                if (isEditMode) {
                    const userId = addUserForm.dataset.userId;
                    const currentUser = currentUsersData.find(u => u.userId == userId);
                    const newRole = userData.role;
                    const currentRole = currentUser ? currentUser.role : null;
                    const newPassword = document.getElementById('password').value.trim();
                    
                    let finalUserId = userId;
                    let roleChanged = false;
                    
                    // Check if role needs to be changed
                    if (currentRole && newRole !== currentRole) {
                        console.log(`Changing role from ${currentRole} to ${newRole}`);
                        roleChanged = true;
                        
                        // First update the role - this creates a new user entity
                        const roleResponse = await fetch(`/api/admin/users/${userId}/role`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ role: newRole })
                        });
                        
                        if (!roleResponse.ok) {
                            const errorData = await roleResponse.json();
                            throw new Error(`Failed to update user role: ${errorData.error || 'Unknown error'}`);
                        }
                        
                        // Get the new user ID from the response
                        const newUserData = await roleResponse.json();
                        finalUserId = newUserData.userId;
                        console.log(`Role changed successfully, new user ID: ${finalUserId}`);
                    }
                    
                    // Update password if provided
                    if (newPassword) {
                        console.log('Updating password...');
                        const passwordResponse = await fetch(`/api/admin/users/${finalUserId}/password`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ password: newPassword })
                        });
                        
                        if (!passwordResponse.ok) {
                            const errorData = await passwordResponse.json();
                            throw new Error(`Failed to update password: ${errorData.error || 'Unknown error'}`);
                        }
                        console.log('Password updated successfully');
                    }
                    
                    // Update the user's other details using the (possibly new) user ID
                    // But skip this step if we only changed the role and other fields are the same
                    const needsFieldUpdate = userData.firstName !== currentUser.firstName ||
                                           userData.secondName !== currentUser.secondName ||
                                           userData.email !== currentUser.email ||
                                           userData.contactNo !== currentUser.contactNo;
                    
                    if (needsFieldUpdate || (!roleChanged && !newPassword)) {
                        const updateData = {
                            firstName: userData.firstName,
                            secondName: userData.secondName,
                            email: userData.email,
                            contactNo: userData.contactNo
                        };
                        
                        const updateResponse = await fetch(`/api/admin/users/${finalUserId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify(updateData)
                        });

                        if (!updateResponse.ok) {
                            // If role was changed but field update failed, that's still partially successful
                            if (roleChanged || newPassword) {
                                console.warn('Role/password updated but field update failed');
                                // Don't throw error, just proceed with success message
                            } else {
                                const errorData = await updateResponse.json();
                                throw new Error(`Failed to update user details: ${errorData.error || 'Unknown error'}`);
                            }
                        }
                    }
                } else {
                    // Create new user
                    userData.password = document.getElementById('password').value;
                    const response = await fetch('/api/admin/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify(userData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to create user: ${errorData.error || 'Unknown error'}`);
                    }
                }

                closeModal('addUserModal');
                loadUsers();
                loadDashboardStats();
                showNotification(`User ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
                addUserForm.reset();
                
                // Reset form mode
                delete addUserForm.dataset.mode;
                delete addUserForm.dataset.userId;
                
                // Reset modal title and button text
                const modalTitle = document.querySelector('#addUserModal .modal-title');
                if (modalTitle) {
                    modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
                }
                
                const submitButton = document.querySelector('#addUserForm button[type="submit"], button[form="addUserForm"]');
                if (submitButton) {
                    submitButton.innerHTML = '<i class="fas fa-save"></i> Save User';
                }
                
                // Reset password field to required
                const passwordField = document.getElementById('password');
                if (passwordField) {
                    passwordField.setAttribute('required', 'required');
                    passwordField.placeholder = '';
                }
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
                showNotification(`Failed to ${isEditMode ? 'update' : 'create'} user: ` + error.message, 'error');
            }
        });
    }

    // Add Trip form
    const addTripForm = document.getElementById('addTripForm');
    if (addTripForm) {
        addTripForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const tripData = {
                date: document.getElementById('tripDate').value,
                startTime: document.getElementById('startTime').value,
                endTime: document.getElementById('endTime').value,
                capacity: parseInt(document.getElementById('capacity').value),
                price: parseFloat(document.getElementById('price').value),
                route: document.getElementById('route').value
            };

            const boatId = document.getElementById('boat').value;
            const guideId = document.getElementById('guide').value;

            if (boatId) {
                tripData.boat = { boatId: boatId };
            }

            if (guideId) {
                tripData.guide = { userId: guideId };
            }

            const isEditMode = addTripForm.dataset.mode === 'edit';

            try {
                const url = isEditMode ? 
                    `/api/trips/${addTripForm.dataset.tripId}` : 
                    '/api/trips';
                const method = isEditMode ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(tripData)
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} trip`);
                }

                closeModal('addTripModal');
                loadTrips();
                loadDashboardStats();
                showNotification(`Trip ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
                addTripForm.reset();
                
                // Reset form mode
                delete addTripForm.dataset.mode;
                delete addTripForm.dataset.tripId;
                
                // Reset modal title and button text
                const modalTitle = document.querySelector('#addTripModal .modal-title');
                if (modalTitle) {
                    modalTitle.innerHTML = '<i class="fas fa-route"></i> Add New Trip';
                }
                
                const submitButton = document.querySelector('#addTripForm button[type="submit"], button[form="addTripForm"]');
                if (submitButton) {
                    submitButton.innerHTML = '<i class="fas fa-save"></i> Save Trip';
                }
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} trip:`, error);
                showNotification(`Failed to ${isEditMode ? 'update' : 'create'} trip: ` + error.message, 'error');
            }
        });
    }

    // Add Staff form
    const addStaffForm = document.getElementById('addStaffForm');
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const staffData = {
                firstName: document.getElementById('staffFirstName').value,
                lastName: document.getElementById('staffLastName').value,
                email: document.getElementById('staffEmail').value,
                phone: document.getElementById('staffPhone').value,
                role: document.getElementById('staffRole').value,
                password: document.getElementById('staffPassword').value,
                hireDate: document.getElementById('hireDate').value,
                salary: parseFloat(document.getElementById('salary').value) || 0
            };

            const isEditMode = addStaffForm.dataset.mode === 'edit';

            try {
                const url = isEditMode ? 
                    `/api/staff/${addStaffForm.dataset.staffId}` : 
                    '/api/staff';
                const method = isEditMode ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(staffData)
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} staff member`);
                }

                closeModal('addStaffModal');
                loadStaffMembers();
                loadDashboardStats();
                showNotification(`Staff member ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
                addStaffForm.reset();
                
                // Reset form mode
                delete addStaffForm.dataset.mode;
                delete addStaffForm.dataset.staffId;
                const modalTitle = document.querySelector('#addStaffModal .modal-title');
                if (modalTitle) {
                    modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New Staff Member';
                }
                const submitButton = document.querySelector('#addStaffForm button[type="submit"], button[form="addStaffForm"]');
                if (submitButton) {
                    submitButton.textContent = 'Save Staff Member';
                }
            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'creating'} staff member:`, error);
                showNotification(`Failed to ${isEditMode ? 'update' : 'create'} staff member: ` + error.message, 'error');
            }
        });
    }
    
    // Setup boat form handlers
    setupBoatFormHandlers();
}

// CRUD operation functions
async function editUser(userId) {
    console.log('Editing user:', userId);
    console.log('Available users:', currentUsersData);
    
    // Find user in the currently loaded data
    const user = currentUsersData.find(u => u.userId === userId);
    if (!user) {
        console.error('User not found with ID:', userId);
        showNotification('User not found', 'error');
        return;
    }
    
    console.log('Found user:', user);
    
    // Populate edit modal with user data
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.secondName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.contactNo || '';
    document.getElementById('role').value = user.role || '';
    
    // Clear password field and make it optional for editing
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.value = '';
        passwordField.removeAttribute('required');
        passwordField.placeholder = 'Leave blank to keep current password';
    }
    
    // Set form to edit mode
    const form = document.getElementById('addUserForm');
    form.dataset.mode = 'edit';
    form.dataset.userId = userId;
    
    // Change modal title and button text
    const modalTitle = document.querySelector('#addUserModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit User';
    }
    
    const submitButton = document.querySelector('#addUserForm button[type="submit"], button[form="addUserForm"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update User';
    }
    
    // Show modal
    document.getElementById('addUserModal').style.display = 'block';
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if (response.ok) {
                showNotification('User deleted successfully', 'success');
                loadUsers(); // Reload users list
                loadDashboardStats(); // Update stats
            } else {
                const errorText = await response.text();
                showNotification('Failed to delete user: ' + errorText, 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user: ' + error.message, 'error');
        }
    }
}

async function editTrip(tripId) {
    console.log('Editing trip:', tripId);
    console.log('Available trips:', currentTripsData);
    
    // Find trip in the currently loaded data
    const trip = currentTripsData.find(t => t.tripId === tripId);
    if (!trip) {
        console.error('Trip not found with ID:', tripId);
        showNotification('Trip not found', 'error');
        return;
    }
    
    console.log('Found trip:', trip);
    
    // Populate edit modal with trip data
    document.getElementById('tripDate').value = trip.date || '';
    document.getElementById('startTime').value = trip.startTime || '';
    document.getElementById('endTime').value = trip.endTime || '';
    document.getElementById('route').value = trip.route || '';
    document.getElementById('capacity').value = trip.capacity || '';
    document.getElementById('price').value = trip.price || '';
    
    // Load boats and guides for the dropdowns
    await loadBoatsAndGuides();
    
    // Set selected boat and guide if available
    if (trip.boat && trip.boat.boatId) {
        document.getElementById('boat').value = trip.boat.boatId;
        console.log('Set boat ID:', trip.boat.boatId);
    }
    if (trip.guide && trip.guide.userId) {
        document.getElementById('guide').value = trip.guide.userId;
        console.log('Set guide ID:', trip.guide.userId);
    }
    
    // Set form to edit mode
    const form = document.getElementById('addTripForm');
    form.dataset.mode = 'edit';
    form.dataset.tripId = tripId;
    
    // Change modal title and button text
    const modalTitle = document.querySelector('#addTripModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Trip';
    }
    
    const submitButton = document.querySelector('#addTripForm button[type="submit"], button[form="addTripForm"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Trip';
    }
    
    // Show modal
    document.getElementById('addTripModal').style.display = 'block';
}

async function deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
        try {
            const response = await fetch(`/api/trips/${tripId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if (response.ok) {
                showNotification('Trip deleted successfully', 'success');
                loadTrips(); // Reload trips list
                loadDashboardStats(); // Update stats
            } else {
                const errorText = await response.text();
                showNotification('Failed to delete trip: ' + errorText, 'error');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            showNotification('Failed to delete trip: ' + error.message, 'error');
        }
    }
}

function editBooking(bookingId) {
    // Find booking from current bookings data (fix variable name)
    const booking = currentBookings.find(b => b.bookingId === bookingId);
    if (!booking) {
        showNotification('Booking not found', 'error');
        return;
    }

    // Open edit booking modal 
    openEditBookingModal(bookingId);
}

function cancelBooking(bookingId) {
    // Find booking from current bookings data (fix variable name)
    const booking = currentBookings.find(b => b.bookingId === bookingId);
    const customerName = booking ? (booking.name || booking.customerName) : 'Unknown Customer';
    
    if (confirm(`Are you sure you want to cancel the booking for ${customerName}? This action cannot be undone.`)) {
        fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ status: 'CANCELLED' })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }
            loadBookings();
            loadDashboardStats();
            showNotification('Booking cancelled successfully', 'success');
        })
        .catch(error => {
            console.error('Error cancelling booking:', error);
            showNotification('Failed to cancel booking: ' + error.message, 'error');
        });
    }
}

function editStaffMember(userId) {
    const staffMember = currentStaffData.find(staff => staff.userId === userId);
    if (!staffMember) {
        showNotification('Staff member not found', 'error');
        return;
    }

    // Check if we have a dedicated staff form, otherwise use user form
    const staffForm = document.getElementById('addStaffForm');
    if (staffForm) {
        // Use dedicated staff form
        staffForm.querySelector('#staffFirstName').value = staffMember.firstName || '';
        staffForm.querySelector('#staffLastName').value = staffMember.secondName || '';
        staffForm.querySelector('#staffEmail').value = staffMember.email || '';
        staffForm.querySelector('#staffPhone').value = staffMember.phone || staffMember.contactNo || '';
        staffForm.querySelector('#staffRole').value = staffMember.role || '';
        staffForm.querySelector('#hireDate').value = staffMember.hireDate || '';
        staffForm.querySelector('#salary').value = staffMember.salary || '';
        
        // Set form to edit mode
        staffForm.dataset.mode = 'edit';
        staffForm.dataset.staffId = userId;
        
        // Update modal title and button text
        const modalTitle = document.querySelector('#addStaffModal .modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Staff Member';
        }
        const submitButton = document.querySelector('#addStaffForm button[type="submit"], button[form="addStaffForm"]');
        if (submitButton) {
            submitButton.textContent = 'Update Staff Member';
        }
        
        openModal('addStaffModal');
    } else {
        // Fall back to user form
        const form = document.getElementById('addUserForm');
        form.querySelector('#firstName').value = staffMember.firstName || '';
        form.querySelector('#lastName').value = staffMember.secondName || '';
        form.querySelector('#email').value = staffMember.email || '';
        form.querySelector('#phone').value = staffMember.contactNo || '';
        form.querySelector('#role').value = staffMember.role || '';
        
        // Set form to edit mode
        form.dataset.mode = 'edit';
        form.dataset.userId = userId;
        
        // Update modal title and button text
        const modalTitle = document.querySelector('#addUserModal .modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Staff Member';
        }
        const submitButton = document.querySelector('#addUserForm button[type="submit"], button[form="addUserForm"]');
        if (submitButton) {
            submitButton.textContent = 'Update Staff';
        }
        
        openModal('addUserModal');
    }
    
    openModal('addStaffModal');
}

function deleteStaffMember(userId) {
    const staffMember = currentStaffData.find(staff => staff.userId === userId);
    const staffName = staffMember ? (staffMember.firstName + ' ' + staffMember.secondName) : 'Unknown Staff';
    
    if (confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
        fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete staff member');
            }
            loadStaffMembers();
            loadUsers();
            loadDashboardStats();
            showNotification('Staff member deleted successfully', 'success');
        })
        .catch(error => {
            console.error('Error deleting staff member:', error);
            showNotification('Failed to delete staff member: ' + error.message, 'error');
        });
    }
}

function generateBookingReport() {
    showNotification('Booking report generation will be implemented soon', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Window click event to close modal when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            modals[i].style.display = 'none';
        }
    }
}

// ========================
// BOAT MANAGEMENT FUNCTIONS
// ========================

let currentBoatsData = [];
let selectedBoatId = null;

// Load boats data
async function loadBoats() {
    try {
        const tableBody = document.getElementById('boatTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="loading"><i class="fas fa-spinner"></i><div>Loading boats...</div></td></tr>';
        }
        
        const response = await fetch('/api/admin/boats', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch boats');
        }

        const boats = await response.json();
        currentBoatsData = boats;
        displayBoats(boats);
        
        console.log('Loaded boats:', boats);
    } catch (error) {
        console.error('Error loading boats:', error);
        const tableBody = document.getElementById('boatTableBody');
        if (tableBody) {
            tableBody.innerHTML = 
                '<tr><td colspan="8" style="text-align: center; color: #e74c3c;">Error loading boats</td></tr>';
        }
        showNotification('Failed to load boats: ' + error.message, 'error');
    }
}

// Display boats in table
function displayBoats(boats) {
    const tbody = document.getElementById('boatTableBody');
    
    if (!boats || boats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No boats found</td></tr>';
        return;
    }

    tbody.innerHTML = boats.map(boat => `
        <tr>
            <td>${boat.boatId || 'N/A'}</td>
            <td>${boat.boatName || 'N/A'}</td>
            <td>${boat.model || 'N/A'}</td>
            <td>${boat.type || 'N/A'}</td>
            <td>${boat.capacity || 'N/A'}</td>
            <td>${boat.registrationNumber || 'N/A'}</td>
            <td>
                <span class="status-badge status-${getStatusClass(boat.status)}">
                    ${formatStatus(boat.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-primary" onclick="openEditBoatModal(${boat.boatId})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-warning" onclick="openStatusModal(${boat.boatId}, '${boat.boatName}', '${boat.status}')" title="Change Status">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteBoat(${boat.boatId}, '${boat.boatName}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get status class for styling
function getStatusClass(status) {
    switch(status) {
        case 'AVAILABLE': return 'available';
        case 'MAINTENANCE': return 'maintenance';
        case 'OUT_OF_SERVICE': return 'out-of-service';
        default: return 'unknown';
    }
}

// Format status for display
function formatStatus(status) {
    switch(status) {
        case 'AVAILABLE': return 'Available';
        case 'MAINTENANCE': return 'Maintenance';
        case 'OUT_OF_SERVICE': return 'Out of Service';
        default: return status || 'Unknown';
    }
}

// Open add boat modal
function openAddBoatModal() {
    document.getElementById('addBoatForm').reset();
    document.getElementById('addBoatModal').style.display = 'block';
}

// Open edit boat modal
async function openEditBoatModal(boatId) {
    try {
        const response = await fetch(`/api/admin/boats/${boatId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch boat details');
        }

        const boat = await response.json();
        
        // Populate edit form
        document.getElementById('editBoatId').value = boat.boatId;
        document.getElementById('editBoatName').value = boat.boatName || '';
        document.getElementById('editBoatModel').value = boat.model || '';
        document.getElementById('editBoatType').value = boat.type || '';
        document.getElementById('editBoatCapacity').value = boat.capacity || '';
        document.getElementById('editRegistrationNumber').value = boat.registrationNumber || '';
        document.getElementById('editBoatStatus').value = boat.status || '';
        document.getElementById('editBoatFeatures').value = boat.features || '';
        document.getElementById('editBoatDescription').value = boat.description || '';
        
        document.getElementById('editBoatModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading boat details:', error);
        showNotification('Failed to load boat details: ' + error.message, 'error');
    }
}

// Open status update modal
function openStatusModal(boatId, boatName, currentStatus) {
    selectedBoatId = boatId;
    document.getElementById('statusBoatName').textContent = boatName;
    document.getElementById('newStatus').value = currentStatus;
    openModal('statusModal');
}

// Confirm status update
async function confirmStatusUpdate() {
    if (!selectedBoatId) return;
    
    const newStatus = document.getElementById('newStatus').value;
    if (!newStatus) {
        showNotification('Please select a status', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/admin/boats/${selectedBoatId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update boat status');
        }

        const result = await response.json();
        showNotification('Boat status updated successfully', 'success');
        closeModal('statusModal');
        loadBoats(); // Refresh the boats list
        
    } catch (error) {
        console.error('Error updating boat status:', error);
        showNotification('Failed to update boat status: ' + error.message, 'error');
    }
}

// Delete boat
async function deleteBoat(boatId, boatName) {
    if (!confirm(`Are you sure you want to delete boat "${boatName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/boats/${boatId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete boat');
        }

        showNotification('Boat deleted successfully', 'success');
        loadBoats(); // Refresh the boats list
        loadDashboardStats(); // Update stats
        
    } catch (error) {
        console.error('Error deleting boat:', error);
        showNotification('Failed to delete boat: ' + error.message, 'error');
    }
}

// Filter boats
function filterBoats() {
    const searchTerm = document.getElementById('boatSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('boatStatusFilter').value;
    const typeFilter = document.getElementById('boatTypeFilter').value;

    const filteredBoats = currentBoatsData.filter(boat => {
        const matchesSearch = !searchTerm || 
            (boat.boatName && boat.boatName.toLowerCase().includes(searchTerm)) ||
            (boat.model && boat.model.toLowerCase().includes(searchTerm)) ||
            (boat.registrationNumber && boat.registrationNumber.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || boat.status === statusFilter;
        const matchesType = !typeFilter || boat.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    displayBoats(filteredBoats);
}

// Clear boat filters
function clearBoatFilters() {
    document.getElementById('boatSearchInput').value = '';
    document.getElementById('boatStatusFilter').value = '';
    document.getElementById('boatTypeFilter').value = '';
    displayBoats(currentBoatsData);
}

// Export boats
function exportBoats() {
    try {
        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(currentBoatsData.map(boat => ({
            'Boat ID': boat.boatId,
            'Boat Name': boat.boatName,
            'Model': boat.model,
            'Type': boat.type,
            'Capacity': boat.capacity,
            'Registration Number': boat.registrationNumber,
            'Status': boat.status,
            'Features': boat.features,
            'Description': boat.description
        })));
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Boats');
        
        // Save file
        XLSX.writeFile(wb, `boats_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        showNotification('Boats exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting boats:', error);
        showNotification('Failed to export boats: ' + error.message, 'error');
    }
}

// Setup boat form handlers
function setupBoatFormHandlers() {
    // Add boat form
    document.getElementById('addBoatForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            boatName: document.getElementById('boatName').value,
            model: document.getElementById('boatModel').value,
            type: document.getElementById('boatType').value,
            capacity: parseInt(document.getElementById('boatCapacity').value),
            registrationNumber: document.getElementById('registrationNumber').value,
            status: document.getElementById('boatStatus').value,
            features: document.getElementById('boatFeatures').value,
            description: document.getElementById('boatDescription').value
        };

        try {
            const response = await fetch('/api/admin/boats', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create boat');
            }

            const result = await response.json();
            showNotification('Boat created successfully', 'success');
            closeModal('addBoatModal');
            loadBoats(); // Refresh the boats list
            loadDashboardStats(); // Update stats
            
        } catch (error) {
            console.error('Error creating boat:', error);
            showNotification('Failed to create boat: ' + error.message, 'error');
        }
    });

    // Edit boat form
    document.getElementById('editBoatForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const boatId = document.getElementById('editBoatId').value;
        const formData = {
            boatName: document.getElementById('editBoatName').value,
            model: document.getElementById('editBoatModel').value,
            type: document.getElementById('editBoatType').value,
            capacity: parseInt(document.getElementById('editBoatCapacity').value),
            registrationNumber: document.getElementById('editRegistrationNumber').value,
            status: document.getElementById('editBoatStatus').value,
            features: document.getElementById('editBoatFeatures').value,
            description: document.getElementById('editBoatDescription').value
        };

        try {
            const response = await fetch(`/api/admin/boats/${boatId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update boat');
            }

            const result = await response.json();
            showNotification('Boat updated successfully', 'success');
            closeModal('editBoatModal');
            loadBoats(); // Refresh the boats list
            loadDashboardStats(); // Update stats
            
        } catch (error) {
            console.error('Error updating boat:', error);
            showNotification('Failed to update boat: ' + error.message, 'error');
        }
    });
}
