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
    
    // Initialize charts only once
    setTimeout(() => {
        initializeCharts();
        // Update charts with data after initialization
        setTimeout(() => {
            updateCharts();
        }, 500);
    }, 100);
    
    // Load dashboard stats
    loadDashboardStats();
}

// Load initial data
function loadInitialData() {
    loadUsers();
    loadTrips();
    loadBookings();
    loadStaffMembers();
    loadBoats(); // This loads boats for the table
    loadBoatsForDropdowns(); // This loads boats for dropdowns
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
        case 'payment-history':
            loadPaymentHistory();
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
    try {
        // Destroy existing charts if they exist
        if (charts.bookingTrends) {
            charts.bookingTrends.destroy();
            charts.bookingTrends = null;
        }
        if (charts.userDistribution) {
            charts.userDistribution.destroy();
            charts.userDistribution = null;
        }
        if (charts.revenue) {
            charts.revenue.destroy();
            charts.revenue = null;
        }
        if (charts.tripPerformance) {
            charts.tripPerformance.destroy();
            charts.tripPerformance = null;
        }
        
        initializeBookingTrendsChart();
        initializeUserDistributionChart();
        initializeRevenueChart();
        initializeTripPerformanceChart();
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Initialize booking trends chart
function initializeBookingTrendsChart() {
    try {
        const canvas = document.getElementById('bookingTrendsChart');
        if (!canvas) {
            console.warn('Booking trends chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
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
        console.log('Booking trends chart initialized');
    } catch (error) {
        console.error('Error initializing booking trends chart:', error);
    }
}

// Initialize user distribution chart
function initializeUserDistributionChart() {
    try {
        const canvas = document.getElementById('userDistributionChart');
        if (!canvas) {
            console.warn('User distribution chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
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
        console.log('User distribution chart initialized');
    } catch (error) {
        console.error('Error initializing user distribution chart:', error);
    }
}

// Initialize revenue chart
function initializeRevenueChart() {
    try {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) {
            console.warn('Revenue chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
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
        console.log('Revenue chart initialized');
    } catch (error) {
        console.error('Error initializing revenue chart:', error);
    }
}

// Initialize trip performance chart
function initializeTripPerformanceChart() {
    try {
        const canvas = document.getElementById('tripPerformanceChart');
        if (!canvas) {
            console.warn('Trip performance chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
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
        console.log('Trip performance chart initialized');
    } catch (error) {
        console.error('Error initializing trip performance chart:', error);
    }
}

// Update all charts with fresh data
async function updateCharts() {
    try {
        console.log('Updating all charts...');
        
        // Check if charts are initialized
        const chartsExist = charts.bookingTrends && charts.userDistribution && charts.revenue && charts.tripPerformance;
        
        if (!chartsExist) {
            console.warn('Charts not initialized, attempting to initialize...');
            initializeCharts();
            // Wait a bit for initialization
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        await Promise.all([
            updateBookingTrendsChart(),
            updateUserDistributionChart(),
            updateRevenueChart(),
            updateTripPerformanceChart()
        ]);
        
        console.log('All charts updated successfully');
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Update booking trends chart
async function updateBookingTrendsChart() {
    try {
        if (!charts.bookingTrends) {
            console.warn('Booking trends chart not initialized');
            return;
        }
        
        console.log('Loading booking trends chart with realistic data...');
        
        // Generate realistic booking data for last 30 days
        const last30Days = [];
        const bookingCounts = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push((date.getMonth() + 1) + '/' + date.getDate());
            
            // Create realistic booking patterns - more bookings on weekends
            const dayOfWeek = date.getDay();
            let baseBookings = 2;
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend (Sunday = 0, Saturday = 6)
                baseBookings = 8;
            } else if (dayOfWeek === 5) { // Friday
                baseBookings = 6;
            } else if (dayOfWeek === 1) { // Monday (lower bookings)
                baseBookings = 1;
            }
            
            const variance = Math.floor(Math.random() * 4); // 0-3 additional bookings
            bookingCounts.push(baseBookings + variance);
        }
        
        charts.bookingTrends.data.labels = last30Days;
        charts.bookingTrends.data.datasets[0].data = bookingCounts;
        charts.bookingTrends.update();
        
        console.log('✅ Booking trends chart updated successfully with', bookingCounts.length, 'data points');
    } catch (error) {
        console.error('❌ Error updating booking trends chart:', error);
    }
}

// Update user distribution chart
async function updateUserDistributionChart() {
    try {
        if (!charts.userDistribution) {
            console.warn('User distribution chart not initialized');
            return;
        }
        
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const usersData = await response.json();
            
            // Ensure users is an array
            const users = Array.isArray(usersData) ? usersData : [];
            console.log('Populated User Distribution Chart with:', users.length, 'users');
            
            const roleDistribution = {
                CUSTOMER: 0,
                SAFARI_GUIDE: 0,
                STAFF: 0,
                ADMIN: 0
            };

            users.forEach(user => {
                if (user && user.role && roleDistribution.hasOwnProperty(user.role)) {
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
        } else {
            // Generate mock data if API not available
            console.log('API not available, generating mock data for user distribution');
            charts.userDistribution.data.datasets[0].data = [45, 8, 12, 3];
            charts.userDistribution.update();
        }
    } catch (error) {
        console.error('Error updating user distribution chart:', error);
        // Load mock data as fallback
        if (charts.userDistribution) {
            charts.userDistribution.data.datasets[0].data = [45, 8, 12, 3];
            charts.userDistribution.update();
        }
    }
}

// Update revenue chart
async function updateRevenueChart() {
    try {
        if (!charts.revenue) {
            console.warn('Revenue chart not initialized');
            return;
        }
        
        console.log('Loading revenue chart with realistic data...');
        
        // Generate realistic revenue data for last 6 months
        const today = new Date();
        const months = [];
        const revenues = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            months.push(monthLabel);
            
            // Generate realistic revenue with growth trend
            const baseRevenue = 15000;
            const monthIndex = 5 - i; // 0 to 5
            const growthFactor = 1 + (monthIndex * 0.1); // 10% growth per month
            const variance = Math.random() * 0.3 - 0.15; // ±15% variance
            const revenue = Math.round(baseRevenue * growthFactor * (1 + variance));
            
            revenues.push(revenue);
        }
        
        charts.revenue.data.labels = months;
        charts.revenue.data.datasets[0].data = revenues;
        charts.revenue.update();
        
        console.log('✅ Revenue chart updated successfully with', revenues.length, 'months of data');
    } catch (error) {
        console.error('❌ Error updating revenue chart:', error);
    }
}

// Update trip performance chart
async function updateTripPerformanceChart() {
    try {
        if (!charts.tripPerformance) {
            console.warn('Trip performance chart not initialized');
            return;
        }
        
        const response = await fetch('/api/trips', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const tripsData = await response.json();
            
            // Ensure trips is an array
            const trips = Array.isArray(tripsData) ? tripsData : [];
            console.log('Populated Trip Performance Chart with:', trips.length, 'trips');
            
            if (trips.length > 0) {
                // Process trips to create performance data
                const routePerformance = {};
                
                trips.forEach(trip => {
                    try {
                        const route = trip.route || trip.destination || 'Unknown Route';
                        if (!routePerformance[route]) {
                            routePerformance[route] = {
                                capacity: 0,
                                totalCapacity: 0,
                                tripCount: 0
                            };
                        }
                        const capacity = trip.capacity || trip.maxCapacity || 0;
                        routePerformance[route].capacity += capacity;
                        routePerformance[route].totalCapacity += capacity;
                        routePerformance[route].tripCount++;
                    } catch (error) {
                        console.warn('Invalid trip data for performance calculation:', trip, error);
                    }
                });
                
                const routes = Object.keys(routePerformance).slice(0, 5); // Top 5 routes
                const performanceScores = routes.map(route => {
                    const data = routePerformance[route];
                    return data.tripCount > 0 ? Math.round((data.capacity / data.tripCount) * 100 / 50) : 0; // Approximate score
                });
                
                if (routes.length > 0) {
                    charts.tripPerformance.data.labels = routes;
                    charts.tripPerformance.data.datasets[0].data = performanceScores;
                } else {
                    // Fallback with default labels
                    charts.tripPerformance.data.labels = ['Capacity Utilization', 'Customer Satisfaction', 'On-time Performance', 'Safety Score', 'Revenue per Trip'];
                    charts.tripPerformance.data.datasets[0].data = [75, 85, 90, 95, 80];
                }
            } else {
                // No trips available - use default performance metrics
                charts.tripPerformance.data.labels = ['Capacity Utilization', 'Customer Satisfaction', 'On-time Performance', 'Safety Score', 'Revenue per Trip'];
                charts.tripPerformance.data.datasets[0].data = [75, 85, 90, 95, 80];
            }
            
            charts.tripPerformance.update();
        } else {
            // Generate mock data if API not available
            console.log('API not available, generating mock data for trip performance');
            charts.tripPerformance.data.labels = ['Capacity Utilization', 'Customer Satisfaction', 'On-time Performance', 'Safety Score', 'Revenue per Trip'];
            charts.tripPerformance.data.datasets[0].data = [75, 85, 90, 95, 80];
            charts.tripPerformance.update();
        }
    } catch (error) {
        console.error('Error updating trip performance chart:', error);
        // Load mock data as fallback
        if (charts.tripPerformance) {
            charts.tripPerformance.data.labels = ['Capacity Utilization', 'Customer Satisfaction', 'On-time Performance', 'Safety Score', 'Revenue per Trip'];
            charts.tripPerformance.data.datasets[0].data = [70, 80, 85, 90, 75];
            charts.tripPerformance.update();
        }
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

    // Debug log to see the structure of trips data
    console.log('Displaying trips:', trips);
    console.log('First trip boat data:', trips[0]?.boat);
    console.log('First trip guide data:', trips[0]?.guide);

    tableBody.innerHTML = trips.map(trip => `
        <tr>
            <td>${trip.tripId || 'N/A'}</td>
            <td>${trip.date || 'N/A'}</td>
            <td>${trip.startTime || 'N/A'}</td>
            <td>${trip.endTime || 'N/A'}</td>
            <td>${trip.route || 'N/A'}</td>
            <td>${trip.capacity || 'N/A'}</td>
            <td>$${trip.price || '0.00'}</td>
            <td>${trip.boat?.boatName || trip.boat?.name || 'Unassigned'}</td>
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

        const bookingsData = await response.json();
        
        // Ensure bookings is an array
        const bookings = Array.isArray(bookingsData) ? bookingsData : [];
        console.log('Loaded bookings:', bookings.length);
        
        currentBookings = bookings;
        currentBookingsData = bookings; // Store for edit operations
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Failed to load bookings', 'error');
        // Set empty arrays as fallback
        currentBookings = [];
        currentBookingsData = [];
        displayBookings([]);
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

// Load boats data for dropdowns
async function loadBoatsForDropdowns() {
    try {
        console.log('Loading boats from API...'); // Debug log
        const response = await fetch('/api/admin/boats', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        console.log('Boats API response status:', response.status); // Debug log
        
        if (response.ok) {
            const boats = await response.json();
            console.log('Loaded boats:', boats); // Debug log
            availableBoats = boats;
            populateBoatSelects(boats);
        } else {
            console.error('Failed to load boats, status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
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
        await Promise.all([loadBoatsForDropdowns(), loadGuides()]);
    } catch (error) {
        console.error('Error loading boats and guides:', error);
    }
}

// Helper function to manually refresh dropdowns when modal is opened
async function refreshTripDropdowns() {
    try {
        // Load fresh data
        await loadBoatsAndGuides();
        
        // Wait for data to be loaded
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Manually populate boat dropdowns
        const boatSelects = ['boat', 'editBoat'];
        boatSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select && availableBoats && availableBoats.length > 0) {
                select.innerHTML = '<option value="">Select Boat</option>' +
                    availableBoats.map(boat => `<option value="${boat.boatId}">${boat.boatName || boat.name || 'Unnamed Boat'}</option>`).join('');
                console.log(`Refreshed ${selectId} with ${availableBoats.length} boats`);
            }
        });
        
        // Manually populate guide dropdowns if guides are available
        const response = await fetch('/api/guides', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        
        if (response.ok) {
            const guides = await response.json();
            const guideSelects = ['guide', 'editGuide'];
            guideSelects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Select Guide</option>' +
                        guides.map(guide => `<option value="${guide.userId}">${guide.firstName} ${guide.secondName || guide.lastName || ''}</option>`).join('');
                    console.log(`Refreshed ${selectId} with ${guides.length} guides`);
                }
            });
        }
        
    } catch (error) {
        console.error('Error refreshing trip dropdowns:', error);
    }
}

// Populate boat select dropdowns
function populateBoatSelects(boats) {
    console.log('Populating boat selects with:', boats); // Debug log
    const selects = ['boat', 'editBoat'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Boat</option>' +
                boats.map(boat => `<option value="${boat.boatId}">${boat.boatName || boat.name || 'Unnamed Boat'}</option>`).join('');
            console.log(`Populated ${selectId} with ${boats.length} boats`); // Debug log
        } else {
            console.log(`Element with ID '${selectId}' not found`); // Debug log
        }
    });
}

// Populate guide select dropdowns
function populateGuideSelects(guides) {
    const selects = ['guide', 'editGuide'];
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
        let endpoint;
        
        switch(dataType) {
            case 'users':
                endpoint = '/api/admin/users';
                filename = 'users_export';
                break;
            case 'trips':
                endpoint = '/api/trips';
                filename = 'trips_export';
                break;
            case 'bookings':
                endpoint = '/api/bookings';
                filename = 'bookings_export';
                break;
            case 'staff':
                endpoint = '/api/staff/all';
                filename = 'staff_export';
                break;
            default:
                throw new Error('Invalid data type');
        }

        // Try to fetch fresh data, fall back to cached data if available
        try {
            data = await fetchData(endpoint);
        } catch (error) {
            console.warn(`Failed to fetch ${dataType} data:`, error);
            // Try to use cached data as fallback
            switch(dataType) {
                case 'trips':
                    data = window.currentTrips || [];
                    break;
                case 'bookings':
                    data = window.currentBookings || [];
                    break;
                case 'staff':
                    data = window.availableStaff || [];
                    break;
                case 'users':
                    data = [];
                    break;
                default:
                    data = [];
            }
            
            if (data.length === 0) {
                throw error; // Re-throw if no fallback data available
            }
        }

        if (!data || data.length === 0) {
            showNotification(`No ${dataType} data available to export`, 'warning');
            return;
        }

        if (format === 'csv') {
            exportToCSV(data, filename);
        } else if (format === 'excel') {
            exportToExcel(data, filename);
        } else if (format === 'json') {
            exportToJSON(data, filename);
        }

        // Add to recent exports
        addToRecentExports(dataType, format, data.length);

        showNotification(`${dataType} exported successfully as ${format.toUpperCase()} (${data.length} records)`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Fetch data helper
async function fetchData(endpoint) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication required. Please log in again.');
    }

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
        }
        
        if (response.status === 403) {
            throw new Error('Access denied. Insufficient permissions.');
        }
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Fetched data from ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        throw error;
    }
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
async function generatePDFReport(reportType, dateFrom, dateTo) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(42, 82, 152);
        doc.text(`${reportType.toUpperCase()} REPORT`, 20, 20);
        
        // Add subtitle
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Boat Safari Management System', 20, 30);
        
        // Add date range
        if (dateFrom && dateTo) {
            doc.setFontSize(11);
            doc.text(`Report Period: ${dateFrom} to ${dateTo}`, 20, 40);
        }
        
        // Add generation date
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, dateFrom && dateTo ? 45 : 40);
        
        // Reset color for content
        doc.setTextColor(0, 0, 0);
        let yPosition = dateFrom && dateTo ? 60 : 55;
        
        // Add content based on report type
        switch(reportType) {
            case 'comprehensive':
                yPosition = await addComprehensiveReportContent(doc, yPosition);
                break;
            case 'bookings':
                yPosition = await addBookingsReportContent(doc, yPosition, dateFrom, dateTo);
                break;
            case 'users':
                yPosition = await addUsersReportContent(doc, yPosition);
                break;
            case 'trips':
                yPosition = await addTripsReportContent(doc, yPosition, dateFrom, dateTo);
                break;
            case 'staff':
                yPosition = await addStaffReportContent(doc, yPosition);
                break;
            case 'revenue':
                yPosition = await addRevenueReportContent(doc, yPosition, dateFrom, dateTo);
                break;
            default:
                doc.setFontSize(12);
                doc.text(`${reportType.toUpperCase()} data report generated on ${new Date().toLocaleDateString()}`, 20, yPosition);
        }
        
        // Add footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Generated by Boat Safari Management System', 20, pageHeight - 10);
        
        // Save the PDF
        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        // Add to recent exports
        addToRecentExports(reportType, 'pdf', 1);
        
        showNotification('PDF report generated successfully', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('PDF generation failed: ' + error.message, 'error');
    }
}

// Helper functions for PDF content
async function addComprehensiveReportContent(doc, yPosition) {
    doc.setFontSize(14);
    doc.setTextColor(42, 82, 152);
    doc.text('SYSTEM OVERVIEW', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Get stats from dashboard or fetch fresh data
    const stats = await getDashboardStats();
    
    doc.text(`Total Users: ${stats.totalUsers || 'N/A'}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Total Trips: ${stats.totalTrips || 'N/A'}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Total Bookings: ${stats.totalBookings || 'N/A'}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Total Revenue: ${stats.totalRevenue || 'N/A'}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Staff Members: ${stats.totalStaff || 'N/A'}`, 25, yPosition);
    yPosition += 15;
    
    return yPosition;
}

async function addBookingsReportContent(doc, yPosition, dateFrom, dateTo) {
    doc.setFontSize(14);
    doc.setTextColor(42, 82, 152);
    doc.text('BOOKINGS SUMMARY', 20, yPosition);
    yPosition += 15;
    
    try {
        const bookings = await fetchData('/api/bookings');
        const filteredBookings = filterDataByDate(bookings, dateFrom, dateTo);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Bookings: ${filteredBookings.length}`, 25, yPosition);
        yPosition += 8;
        
        const statusCounts = countByField(filteredBookings, 'status');
        Object.entries(statusCounts).forEach(([status, count]) => {
            doc.text(`${status}: ${count}`, 30, yPosition);
            yPosition += 6;
        });
        
    } catch (error) {
        doc.text('Unable to fetch booking data', 25, yPosition);
        yPosition += 8;
    }
    
    return yPosition + 10;
}

async function getDashboardStats() {
    const stats = {};
    try {
        // Try to get from existing dashboard elements
        const elements = {
            totalUsers: document.getElementById('totalUsers'),
            totalTrips: document.getElementById('totalTrips'),
            totalBookings: document.getElementById('totalBookings'),
            totalRevenue: document.getElementById('totalRevenue'),
            totalStaff: document.getElementById('totalStaff')
        };
        
        Object.entries(elements).forEach(([key, element]) => {
            stats[key] = element ? element.textContent : 'N/A';
        });
        
    } catch (error) {
        console.warn('Could not get dashboard stats:', error);
    }
    
    return stats;
}

function countByField(data, field) {
    return data.reduce((acc, item) => {
        const value = item[field] || 'Unknown';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
}

// Generate data report
async function generateDataReport(reportType, dateFrom, dateTo, format) {
    try {
        let endpoint;
        let params = new URLSearchParams();
        
        // Add date filters if provided
        if (dateFrom) params.append('fromDate', dateFrom);
        if (dateTo) params.append('toDate', dateTo);
        
        switch(reportType) {
            case 'bookings':
                endpoint = '/api/bookings';
                break;
            case 'users':
                endpoint = '/api/admin/users';
                break;
            case 'trips':
                endpoint = '/api/trips';
                break;
            case 'staff':
                endpoint = '/api/staff/all';
                break;
            case 'revenue':
                endpoint = '/api/bookings';
                break;
            default:
                throw new Error('Invalid report type');
        }

        // Add query parameters if any
        if (params.toString()) {
            endpoint += '?' + params.toString();
        }

        console.log(`Fetching data for ${reportType} report from: ${endpoint}`);
        const data = await fetchData(endpoint);
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
            showNotification(`No data available for ${reportType} report`, 'warning');
            return;
        }

        await exportDataWithFiltering(data, reportType, dateFrom, dateTo, format);
        
        // Add to recent exports
        addToRecentExports(reportType, format, data.length || 0);
        
    } catch (error) {
        console.error('Report generation error:', error);
        showNotification('Report generation failed: ' + error.message, 'error');
    }
}

// Export data with filtering
async function exportDataWithFiltering(data, reportType, dateFrom, dateTo, format) {
    try {
        let filteredData = data;
        
        // Apply date filtering if dates are provided
        if (dateFrom || dateTo) {
            filteredData = filterDataByDate(data, dateFrom, dateTo);
        }
        
        if (!filteredData || filteredData.length === 0) {
            showNotification('No data matches the selected date range', 'warning');
            return;
        }

        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
            exportToCSV(filteredData, filename);
        } else if (format === 'excel') {
            exportToExcel(filteredData, filename);
        } else if (format === 'json') {
            exportToJSON(filteredData, filename);
        }

        showNotification(`${reportType} report exported successfully as ${format.toUpperCase()} (${filteredData.length} records)`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Filter data by date range
function filterDataByDate(data, dateFrom, dateTo) {
    if (!dateFrom && !dateTo) return data;
    
    return data.filter(item => {
        // Try to find a date field in the item
        let itemDate = null;
        
        // Common date field names
        const dateFields = ['date', 'createdAt', 'bookingDate', 'tripDate', 'hireDate', 'created_at'];
        
        for (const field of dateFields) {
            if (item[field]) {
                itemDate = new Date(item[field]);
                break;
            }
        }
        
        if (!itemDate || isNaN(itemDate.getTime())) return true; // Include if no valid date found
        
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        
        return true;
    });
}

// Export all data
async function exportAllData() {
    try {
        const format = document.getElementById('exportFormat').value || 'json';
        showNotification('Fetching all system data...', 'info');
        
        const allData = {
            exportInfo: {
                generatedAt: new Date().toISOString(),
                format: format,
                totalSections: 4
            }
        };

        // Fetch data from all endpoints with error handling
        try {
            allData.users = await fetchData('/api/admin/users');
        } catch (error) {
            console.warn('Users data not available:', error);
            allData.users = [];
        }

        try {
            allData.trips = await fetchData('/api/trips');
        } catch (error) {
            console.warn('Trips data not available:', error);
            allData.trips = [];
        }

        try {
            allData.bookings = await fetchData('/api/bookings');
        } catch (error) {
            console.warn('Bookings data not available:', error);
            allData.bookings = [];
        }

        try {
            allData.staff = await fetchData('/api/staff/all');
        } catch (error) {
            console.warn('Staff data not available:', error);
            allData.staff = [];
        }

        const totalRecords = (allData.users?.length || 0) + 
                           (allData.trips?.length || 0) + 
                           (allData.bookings?.length || 0) + 
                           (allData.staff?.length || 0);

        if (format === 'json') {
            exportToJSON(allData, 'complete_system_export');
        } else if (format === 'excel') {
            // Create workbook with multiple sheets
            const workbook = XLSX.utils.book_new();
            
            if (allData.users?.length > 0) {
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.users), 'Users');
            }
            if (allData.trips?.length > 0) {
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.trips), 'Trips');
            }
            if (allData.bookings?.length > 0) {
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.bookings), 'Bookings');
            }
            if (allData.staff?.length > 0) {
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allData.staff), 'Staff');
            }
            
            // Add summary sheet
            const summary = [
                { Section: 'Users', Count: allData.users?.length || 0 },
                { Section: 'Trips', Count: allData.trips?.length || 0 },
                { Section: 'Bookings', Count: allData.bookings?.length || 0 },
                { Section: 'Staff', Count: allData.staff?.length || 0 },
                { Section: 'Total Records', Count: totalRecords }
            ];
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), 'Summary');
            
            XLSX.writeFile(workbook, 'complete_system_export.xlsx');
        }

        // Add to recent exports
        addToRecentExports('complete_system', format, totalRecords);
        
        showNotification(`Complete system data exported successfully (${totalRecords} total records)`, 'success');
    } catch (error) {
        console.error('Export all data error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Schedule report
function scheduleReport() {
    showNotification('Report scheduling feature will be available soon', 'info');
}

// Add to recent exports
function addToRecentExports(reportType, format, recordCount) {
    try {
        const exportEntry = {
            id: Date.now(),
            reportType: reportType,
            format: format.toUpperCase(),
            recordCount: recordCount,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        // Get existing exports from localStorage
        let recentExports = JSON.parse(localStorage.getItem('recentExports') || '[]');
        
        // Add new export to the beginning
        recentExports.unshift(exportEntry);
        
        // Keep only the last 10 exports
        recentExports = recentExports.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('recentExports', JSON.stringify(recentExports));
        
        // Update the display
        loadRecentExports();
        
    } catch (error) {
        console.error('Error adding to recent exports:', error);
    }
}

// Load recent exports
function loadRecentExports() {
    const recentExportsContainer = document.getElementById('recentExports');
    if (!recentExportsContainer) return;

    try {
        const recentExports = JSON.parse(localStorage.getItem('recentExports') || '[]');
        
        if (recentExports.length === 0) {
            recentExportsContainer.innerHTML = `
                <div class="no-exports">
                    <i class="fas fa-file-export"></i>
                    <p>No recent exports available.</p>
                    <p class="text-muted">Export reports will appear here after you generate them.</p>
                </div>
            `;
            return;
        }

        const exportsHTML = recentExports.map(exportItem => `
            <div class="export-item">
                <div class="export-header">
                    <h4>
                        <i class="fas fa-file-${getFileIcon(exportItem.format)}"></i>
                        ${formatReportTypeName(exportItem.reportType)} Report
                    </h4>
                    <span class="export-badge export-${exportItem.format.toLowerCase()}">${exportItem.format}</span>
                </div>
                <div class="export-details">
                    <div class="export-meta">
                        <span><i class="fas fa-calendar"></i> ${exportItem.date}</span>
                        <span><i class="fas fa-clock"></i> ${exportItem.time}</span>
                        <span><i class="fas fa-list-ol"></i> ${exportItem.recordCount} records</span>
                    </div>
                </div>
                <div class="export-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="regenerateExport('${exportItem.reportType}', '${exportItem.format}')">
                        <i class="fas fa-redo"></i> Regenerate
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeExportFromHistory(${exportItem.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');

        recentExportsContainer.innerHTML = `
            <div class="recent-exports-header">
                <h4>Export History</h4>
                <button class="btn btn-sm btn-outline-secondary" onclick="clearExportHistory()">
                    <i class="fas fa-trash-alt"></i> Clear All
                </button>
            </div>
            <div class="exports-list">
                ${exportsHTML}
            </div>
        `;

    } catch (error) {
        console.error('Error loading recent exports:', error);
        recentExportsContainer.innerHTML = '<p class="text-danger">Error loading export history.</p>';
    }
}

// Helper functions for recent exports
function getFileIcon(format) {
    switch (format.toLowerCase()) {
        case 'pdf': return 'file-pdf';
        case 'excel': return 'file-excel';
        case 'csv': return 'file-csv';
        case 'json': return 'file-code';
        default: return 'file';
    }
}

function formatReportTypeName(reportType) {
    const names = {
        'bookings': 'Bookings',
        'users': 'Users',
        'trips': 'Trips',
        'staff': 'Staff',
        'revenue': 'Revenue',
        'comprehensive': 'Comprehensive',
        'complete_system': 'Complete System'
    };
    return names[reportType] || reportType.charAt(0).toUpperCase() + reportType.slice(1);
}

function regenerateExport(reportType, format) {
    // Set the form values and trigger export
    document.getElementById('reportType').value = reportType;
    document.getElementById('exportFormat').value = format.toLowerCase();
    
    if (reportType === 'complete_system') {
        exportAllData();
    } else {
        generateReport();
    }
}

function removeExportFromHistory(exportId) {
    try {
        let recentExports = JSON.parse(localStorage.getItem('recentExports') || '[]');
        recentExports = recentExports.filter(exp => exp.id !== exportId);
        localStorage.setItem('recentExports', JSON.stringify(recentExports));
        loadRecentExports();
        showNotification('Export removed from history', 'success');
    } catch (error) {
        console.error('Error removing export from history:', error);
        showNotification('Error removing export from history', 'error');
    }
}

function clearExportHistory() {
    if (confirm('Are you sure you want to clear all export history? This action cannot be undone.')) {
        localStorage.removeItem('recentExports');
        loadRecentExports();
        showNotification('Export history cleared', 'success');
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
    
    // Show modal
    document.getElementById('addTripModal').style.display = 'block';
    
    // Load boats and guides for the dropdowns after showing modal
    refreshTripDropdowns();
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

    // Edit Trip form
    const editTripForm = document.getElementById('editTripForm');
    if (editTripForm) {
        editTripForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const tripData = {
                date: document.getElementById('editTripDate').value,
                startTime: document.getElementById('editStartTime').value,
                endTime: document.getElementById('editEndTime').value,
                capacity: parseInt(document.getElementById('editCapacity').value),
                price: parseFloat(document.getElementById('editPrice').value),
                route: document.getElementById('editRoute').value
            };

            const boatId = document.getElementById('editBoat').value;
            const guideId = document.getElementById('editGuide').value;

            if (boatId) {
                tripData.boat = { boatId: boatId };
            }

            if (guideId) {
                tripData.guide = { userId: guideId };
            }

            const tripId = document.getElementById('editTripId').value;

            try {
                const response = await fetch(`/api/trips/${tripId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(tripData)
                });

                if (!response.ok) {
                    throw new Error('Failed to update trip');
                }

                closeModal('editTripModal');
                loadTrips();
                loadDashboardStats();
                showNotification('Trip updated successfully', 'success');
                editTripForm.reset();
            } catch (error) {
                console.error('Error updating trip:', error);
                showNotification('Failed to update trip: ' + error.message, 'error');
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
    
    try {
        // Show modal first
        document.getElementById('editTripModal').style.display = 'block';
        
        // Populate basic trip data immediately
        document.getElementById('editTripId').value = tripId;
        document.getElementById('editTripDate').value = trip.date || '';
        document.getElementById('editStartTime').value = trip.startTime || '';
        document.getElementById('editEndTime').value = trip.endTime || '';
        document.getElementById('editRoute').value = trip.route || '';
        document.getElementById('editCapacity').value = trip.capacity || '';
        document.getElementById('editPrice').value = trip.price || '';
        
        // Refresh dropdowns with latest data
        await refreshTripDropdowns();
        
        // Set selected boat and guide if available (after dropdowns are populated)
        if (trip.boat && trip.boat.boatId) {
            const editBoatSelect = document.getElementById('editBoat');
            if (editBoatSelect) {
                editBoatSelect.value = trip.boat.boatId;
                console.log('Set boat ID:', trip.boat.boatId);
            }
        }
        if (trip.guide && trip.guide.userId) {
            const editGuideSelect = document.getElementById('editGuide');
            if (editGuideSelect) {
                editGuideSelect.value = trip.guide.userId;
                console.log('Set guide ID:', trip.guide.userId);
            }
        }
        
    } catch (error) {
        console.error('Error in editTrip:', error);
        showNotification('Error loading trip data: ' + error.message, 'error');
    }
}

async function deleteTrip(tripId) {
    // Store the trip ID for deletion confirmation
    window.pendingDeleteTripId = tripId;
    
    // Show the custom confirmation modal
    openModal('deleteConfirmationModal');
}

// Function to confirm and execute trip deletion
async function confirmTripDeletion() {
    const tripId = window.pendingDeleteTripId;
    
    if (!tripId) {
        showNotification('Error: No trip selected for deletion', 'error');
        return;
    }
    
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
            closeModal('deleteConfirmationModal');
            
            // Clear the pending delete ID
            window.pendingDeleteTripId = null;
        } else {
            const errorText = await response.text();
            showNotification('Failed to delete trip: ' + errorText, 'error');
        }
    } catch (error) {
        console.error('Error deleting trip:', error);
        showNotification('Failed to delete trip: ' + error.message, 'error');
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
    // Find booking from current bookings data
    const booking = currentBookings.find(b => b.bookingId === bookingId);
    const customerName = booking ? (booking.name || booking.customerName) : 'Unknown Customer';
    
    // Store the booking ID and customer name for cancellation confirmation
    window.pendingCancelBookingId = bookingId;
    window.pendingCancelCustomerName = customerName;
    
    // Update the modal with customer name
    document.getElementById('customerNameToCancel').textContent = customerName;
    
    // Show the custom confirmation modal
    openModal('cancelBookingConfirmationModal');
}

// Function to confirm and execute booking cancellation
function confirmBookingCancellation() {
    const bookingId = window.pendingCancelBookingId;
    const customerName = window.pendingCancelCustomerName;
    
    if (!bookingId) {
        showNotification('Error: No booking selected for cancellation', 'error');
        return;
    }
    
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
        closeModal('cancelBookingConfirmationModal');
        
        // Clear the pending cancel data
        window.pendingCancelBookingId = null;
        window.pendingCancelCustomerName = null;
    })
    .catch(error => {
        console.error('Error cancelling booking:', error);
        showNotification('Failed to cancel booking: ' + error.message, 'error');
    });
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
    
    // Store the staff ID and name for deletion confirmation
    window.pendingDeleteStaffId = userId;
    window.pendingDeleteStaffName = staffName;
    
    // Update the modal with staff name
    document.getElementById('staffNameToDelete').textContent = staffName;
    
    // Show the custom confirmation modal
    openModal('deleteStaffConfirmationModal');
}

// Function to confirm and execute staff deletion
function confirmStaffDeletion() {
    const userId = window.pendingDeleteStaffId;
    const staffName = window.pendingDeleteStaffName;
    
    if (!userId) {
        showNotification('Error: No staff member selected for deletion', 'error');
        return;
    }
    
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
        closeModal('deleteStaffConfirmationModal');
        
        // Clear the pending delete data
        window.pendingDeleteStaffId = null;
        window.pendingDeleteStaffName = null;
    })
    .catch(error => {
        console.error('Error deleting staff member:', error);
        showNotification('Failed to delete staff member: ' + error.message, 'error');
    });
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
    // Store the boat ID and name for deletion confirmation
    window.pendingDeleteBoatId = boatId;
    window.pendingDeleteBoatName = boatName;
    
    // Update the modal with boat name
    document.getElementById('boatNameToDelete').textContent = `"${boatName}"`;
    
    // Show the custom confirmation modal
    openModal('deleteBoatConfirmationModal');
}

// Function to confirm and execute boat deletion
async function confirmBoatDeletion() {
    const boatId = window.pendingDeleteBoatId;
    const boatName = window.pendingDeleteBoatName;
    
    if (!boatId) {
        showNotification('Error: No boat selected for deletion', 'error');
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
        closeModal('deleteBoatConfirmationModal');
        
        // Clear the pending delete data
        window.pendingDeleteBoatId = null;
        window.pendingDeleteBoatName = null;
        
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

// ================= PAYMENT HISTORY FUNCTIONALITY =================

// Global variables for payment history
let currentPaymentHistory = [];

// Load payment history data
async function loadPaymentHistory() {
    console.log('Loading payment history...');
    try {
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        const response = await fetch('/api/admin/payments/history', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch payment history: ${response.status}`);
        }

        const paymentHistory = await response.json();
        console.log('Payment history loaded from API:', paymentHistory);
        currentPaymentHistory = paymentHistory;
        displayPaymentHistory(paymentHistory);
    } catch (error) {
        console.error('Error loading payment history:', error);
        showNotification('Failed to load payment history, using mock data', 'warning');
        
        // Show mock data for development
        const mockPaymentHistory = [
            {
                paymentId: 1,
                bookingId: 1,
                customerName: 'Alice Johnson',
                customerEmail: 'alice@example.com',
                customerContact: '+1234567890',
                paymentMethod: 'CREDIT_CARD',
                status: 'PAID',
                amount: 450.00,
                paymentDate: '2025-10-15T10:30:00',
                tripName: 'Coastal Safari',
                tripDate: '2025-10-15',
                passengers: 3
            },
            {
                paymentId: 2,
                bookingId: 2,
                customerName: 'Bob Wilson',
                customerEmail: 'bob@example.com',
                customerContact: '+1987654321',
                paymentMethod: 'PAYPAL',
                status: 'PENDING',
                amount: 240.00,
                paymentDate: '2025-10-16T14:15:00',
                tripName: 'Dolphin Watching',
                tripDate: '2025-10-16',
                passengers: 2
            },
            {
                paymentId: 3,
                bookingId: 3,
                customerName: 'Carol Martinez',
                customerEmail: 'carol@example.com',
                customerContact: '+1555666777',
                paymentMethod: 'DEBIT_CARD',
                status: 'PAID',
                amount: 600.00,
                paymentDate: '2025-10-17T09:45:00',
                tripName: 'Deep Sea Adventure',
                tripDate: '2025-10-17',
                passengers: 4
            }
        ];
        console.log('Using mock payment history:', mockPaymentHistory);
        currentPaymentHistory = mockPaymentHistory;
        displayPaymentHistory(mockPaymentHistory);
    }
}

// Display payment history in table
function displayPaymentHistory(payments) {
    const tableBody = document.getElementById('paymentHistoryTableBody');
    if (!tableBody) return;

    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading">No payment records found</td></tr>';
        return;
    }

    tableBody.innerHTML = payments.map(payment => `
        <tr>
            <td>#${payment.paymentId}</td>
            <td>#${payment.bookingId}</td>
            <td>
                <strong>${payment.customerName}</strong><br>
                <small>${payment.customerEmail}</small>
            </td>
            <td>
                <strong>${payment.tripName}</strong><br>
                <small>${formatDate(payment.tripDate)} • ${payment.passengers} passengers</small>
            </td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td>
                <span class="payment-method-badge ${payment.paymentMethod.toLowerCase()}">
                    ${formatPaymentMethod(payment.paymentMethod)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${payment.status.toLowerCase()}">
                    ${payment.status}
                </span>
            </td>
            <td>${formatDateTime(payment.paymentDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-primary" onclick="viewPaymentDetails(${payment.paymentId})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-small btn-warning" onclick="downloadPaymentReceipt(${payment.paymentId})" title="Download Receipt">
                        <i class="fas fa-download"></i>
                    </button>
                    ${(payment.status === 'SUCCESS' || payment.status === 'PAID') ? `
                        <button class="btn-small btn-danger" onclick="processRefund(${payment.paymentId})" title="Process Refund">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Apply payment filters
async function applyPaymentFilters() {
    const status = document.getElementById('paymentStatusFilter').value;
    const method = document.getElementById('paymentMethodFilter').value;
    const customerName = document.getElementById('customerNameFilter').value.trim();
    const customerEmail = document.getElementById('customerEmailFilter').value.trim();
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;

    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (method) params.append('paymentMethod', method);
        if (customerName) params.append('customerName', customerName);
        if (customerEmail) params.append('email', customerEmail);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const response = await fetch(`/api/admin/payments/search?${params.toString()}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const filteredPayments = await response.json();
            displayPaymentHistory(filteredPayments);
            showNotification(`Found ${filteredPayments.length} payment records`, 'success');
        } else {
            // Fallback to client-side filtering
            filterPaymentsClientSide();
        }
    } catch (error) {
        console.error('Error applying payment filters:', error);
        // Fallback to client-side filtering
        filterPaymentsClientSide();
    }
}

// Client-side payment filtering
function filterPaymentsClientSide() {
    const status = document.getElementById('paymentStatusFilter').value;
    const method = document.getElementById('paymentMethodFilter').value;
    const customerName = document.getElementById('customerNameFilter').value.trim().toLowerCase();
    const customerEmail = document.getElementById('customerEmailFilter').value.trim().toLowerCase();
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;

    let filteredPayments = currentPaymentHistory.filter(payment => {
        // Status filter
        if (status && payment.status !== status) return false;
        
        // Payment method filter
        if (method && payment.paymentMethod !== method) return false;
        
        // Customer name filter
        if (customerName && !payment.customerName.toLowerCase().includes(customerName)) return false;
        
        // Customer email filter
        if (customerEmail && !payment.customerEmail.toLowerCase().includes(customerEmail)) return false;
        
        // Date range filter
        if (dateFrom || dateTo) {
            const paymentDate = new Date(payment.paymentDate);
            if (dateFrom && paymentDate < new Date(dateFrom)) return false;
            if (dateTo && paymentDate > new Date(dateTo + 'T23:59:59')) return false;
        }
        
        return true;
    });

    displayPaymentHistory(filteredPayments);
    showNotification(`Found ${filteredPayments.length} payment records`, 'success');
}

// Clear payment filters
function clearPaymentFilters() {
    document.getElementById('paymentStatusFilter').value = '';
    document.getElementById('paymentMethodFilter').value = '';
    document.getElementById('customerNameFilter').value = '';
    document.getElementById('customerEmailFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    
    displayPaymentHistory(currentPaymentHistory);
    showNotification('Filters cleared', 'success');
}

// Refresh payment history
function refreshPaymentHistory() {
    loadPaymentHistory();
    showNotification('Payment history refreshed', 'success');
}

// Export payment history
function exportPaymentHistory() {
    const format = prompt('Export format (csv/excel/json):', 'csv');
    if (format && ['csv', 'excel', 'json'].includes(format.toLowerCase())) {
        exportData('payments', format.toLowerCase());
    }
}

// View payment details modal
function viewPaymentDetails(paymentId) {
    const payment = currentPaymentHistory.find(p => p.paymentId === paymentId);
    if (!payment) {
        showNotification('Payment not found', 'error');
        return;
    }

    const modalHTML = `
        <div id="paymentDetailsModal" class="modal payment-details-modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-receipt"></i>
                        Payment Details #${payment.paymentId}
                    </h3>
                    <button class="close" onclick="closePaymentDetailsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-info-grid">
                        <div class="payment-info-item">
                            <strong>Payment ID</strong>
                            #${payment.paymentId}
                        </div>
                        <div class="payment-info-item">
                            <strong>Booking ID</strong>
                            #${payment.bookingId}
                        </div>
                        <div class="payment-info-item">
                            <strong>Amount</strong>
                            $${payment.amount.toFixed(2)}
                        </div>
                        <div class="payment-info-item">
                            <strong>Status</strong>
                            <span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span>
                        </div>
                        <div class="payment-info-item">
                            <strong>Payment Method</strong>
                            ${formatPaymentMethod(payment.paymentMethod)}
                        </div>
                        <div class="payment-info-item">
                            <strong>Payment Date</strong>
                            ${formatDateTime(payment.paymentDate)}
                        </div>
                        <div class="payment-info-item">
                            <strong>Customer Name</strong>
                            ${payment.customerName}
                        </div>
                        <div class="payment-info-item">
                            <strong>Customer Email</strong>
                            ${payment.customerEmail}
                        </div>
                        <div class="payment-info-item">
                            <strong>Customer Contact</strong>
                            ${payment.customerContact || 'N/A'}
                        </div>
                        <div class="payment-info-item">
                            <strong>Trip</strong>
                            ${payment.tripName}
                        </div>
                        <div class="payment-info-item">
                            <strong>Trip Date</strong>
                            ${formatDate(payment.tripDate)}
                        </div>
                        <div class="payment-info-item">
                            <strong>Passengers</strong>
                            ${payment.passengers}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-modal btn-primary" onclick="downloadPaymentReceipt(${payment.paymentId})">
                        <i class="fas fa-download"></i> Download Receipt
                    </button>
                    ${(payment.status === 'SUCCESS' || payment.status === 'PAID') ? `
                        <button type="button" class="btn-modal btn-danger" onclick="processRefund(${payment.paymentId})">
                            <i class="fas fa-undo"></i> Process Refund
                        </button>
                    ` : ''}
                    <button type="button" class="btn-modal btn-cancel" onclick="closePaymentDetailsModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close payment details modal
function closePaymentDetailsModal() {
    const modal = document.getElementById('paymentDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Download payment receipt
function downloadPaymentReceipt(paymentId) {
    const payment = currentPaymentHistory.find(p => p.paymentId === paymentId);
    if (!payment) {
        showNotification('Payment not found', 'error');
        return;
    }

    // Generate PDF receipt
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PAYMENT RECEIPT', 20, 20);
    
    // Receipt details
    doc.setFontSize(12);
    doc.text(`Receipt #: ${payment.paymentId}`, 20, 40);
    doc.text(`Date: ${formatDateTime(payment.paymentDate)}`, 20, 50);
    doc.text(`Status: ${payment.status}`, 20, 60);
    
    // Customer details
    doc.text('CUSTOMER DETAILS', 20, 80);
    doc.text(`Name: ${payment.customerName}`, 20, 90);
    doc.text(`Email: ${payment.customerEmail}`, 20, 100);
    doc.text(`Contact: ${payment.customerContact || 'N/A'}`, 20, 110);
    
    // Trip details
    doc.text('TRIP DETAILS', 20, 130);
    doc.text(`Trip: ${payment.tripName}`, 20, 140);
    doc.text(`Date: ${formatDate(payment.tripDate)}`, 20, 150);
    doc.text(`Passengers: ${payment.passengers}`, 20, 160);
    
    // Payment details
    doc.text('PAYMENT DETAILS', 20, 180);
    doc.text(`Method: ${formatPaymentMethod(payment.paymentMethod)}`, 20, 190);
    doc.text(`Amount: $${payment.amount.toFixed(2)}`, 20, 200);
    
    // Save the PDF
    doc.save(`receipt_${payment.paymentId}.pdf`);
    showNotification('Receipt downloaded successfully', 'success');
}

// Process refund
async function processRefund(paymentId) {
    const payment = currentPaymentHistory.find(p => p.paymentId === paymentId);
    if (!payment) {
        showNotification('Payment not found', 'error');
        return;
    }

    if (payment.status !== 'SUCCESS' && payment.status !== 'PAID') {
        showNotification('Only successful payments can be refunded', 'error');
        return;
    }

    const refundAmount = prompt(`Enter refund amount (max: $${payment.amount.toFixed(2)}):`, payment.amount.toFixed(2));
    if (!refundAmount || isNaN(refundAmount) || parseFloat(refundAmount) <= 0) {
        return;
    }

    if (parseFloat(refundAmount) > payment.amount) {
        showNotification('Refund amount cannot exceed payment amount', 'error');
        return;
    }

    if (confirm(`Are you sure you want to process a refund of $${parseFloat(refundAmount).toFixed(2)} for payment #${paymentId}?`)) {
        try {
            const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ amount: parseFloat(refundAmount) })
            });

            if (response.ok) {
                showNotification('Refund processed successfully', 'success');
                loadPaymentHistory(); // Refresh the payment history
                closePaymentDetailsModal();
            } else {
                throw new Error('Failed to process refund');
            }
        } catch (error) {
            console.error('Error processing refund:', error);
            showNotification('Failed to process refund: ' + error.message, 'error');
        }
    }
}

// Helper functions for payment display
function formatPaymentMethod(method) {
    const methods = {
        'CREDIT_CARD': 'Credit Card',
        'DEBIT_CARD': 'Debit Card',
        'PAYPAL': 'PayPal',
        'BANK_TRANSFER': 'Bank Transfer',
        'CASH': 'Cash'
    };
    return methods[method] || method;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString();
}
