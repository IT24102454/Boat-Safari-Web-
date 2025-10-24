// Staff Dashboard JavaScript
// Handles all functionality for the staff dashboard including trip management, resource assignment, and real-time updates

// Global variables
let currentTrips = [];
let availableBoats = [];
let availableGuides = [];
let currentAssignments = [];
let realTimeEnabled = false;
let updateInterval = null;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a staff member
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Check if user is a staff member (includes all staff roles)
    if (!isStaffMember()) {
        alert('Access denied. This page is only accessible to staff members.');
        window.location.href = 'login.html';
        return;
    }

    // Set user name in header
    const userName = localStorage.getItem('userName') || 'Staff Member';
    const userRole = localStorage.getItem('userRole');
    document.getElementById('staffName').textContent = userName;

    // Customize dashboard based on user role
    customizeDashboardByRole(userRole);

    // Load initial data
    loadDashboardData();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Set up real-time updates
    setupRealTimeUpdates();

    // Set year in footer (if exists)
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Load all dashboard data
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        await Promise.all([
            loadQuickStats(),
            loadTrips(),
            loadBoats(),
            loadGuides(),
            loadAssignments(),
            loadCapacityData()
        ]);
        console.log('Dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
    
    // Setup modal event listeners
    setupModalEventListeners();
}

// Setup modal event listeners
function setupModalEventListeners() {
    // Close modal when clicking the X button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    closeModal(modal.id);
                }
            });
        }
    });
}

// Load quick statistics
async function loadQuickStats() {
    try {
        const response = await fetch('/api/staff/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const stats = await response.json();

        document.getElementById('totalTrips').textContent = stats.totalTrips;
        document.getElementById('availableBoats').textContent = stats.availableBoats;
        document.getElementById('availableGuides').textContent = stats.availableGuides;
        document.getElementById('capacityUtilization').textContent = stats.capacityUtilization + '%';
    } catch (error) {
        console.error('Error loading quick stats:', error);
        // Use mock data as fallback
        const stats = {
            totalTrips: 12,
            availableBoats: 8,
            availableGuides: 15,
            capacityUtilization: 75
        };

        document.getElementById('totalTrips').textContent = stats.totalTrips;
        document.getElementById('availableBoats').textContent = stats.availableBoats;
        document.getElementById('availableGuides').textContent = stats.availableGuides;
        document.getElementById('capacityUtilization').textContent = stats.capacityUtilization + '%';
    }
}

// Load trips data
async function loadTrips() {
    try {
        console.log('Loading trips...');
        const response = await fetch('/api/trips', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trips');
        }

        currentTrips = await response.json();
        console.log('Trips loaded:', currentTrips);
        displayTrips(currentTrips);
        populateTripSelectors();
    } catch (error) {
        console.error('Error loading trips:', error);
        console.log('Using mock trips data as fallback');
        showMockTrips(); // Show mock data if API fails
    }
}

// Display trips in the schedule table
function displayTrips(trips) {
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';

    if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No trips found</td></tr>';
        return;
    }

    trips.forEach(trip => {
        const row = document.createElement('tr');
        const tripDate = trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A';
        const startTime = trip.startTime || 'N/A';
        const boatName = trip.boat ? trip.boat.boatName : 'Unassigned';
        const guideName = trip.guide ? `${trip.guide.firstName} ${trip.guide.secondName}` : 'Unassigned';
        
        row.innerHTML = `
            <td>${trip.tripId}</td>
            <td>${trip.name || 'Safari Trip'}</td>
            <td>${tripDate}</td>
            <td>${startTime}</td>
            <td>${trip.route || 'N/A'}</td>
            <td>${boatName}</td>
            <td>${guideName}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="editTrip(${trip.tripId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="assignResourcesToTrip(${trip.tripId})">
                    <i class="fas fa-tasks"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTrip(${trip.tripId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show mock trips data when API is not available
function showMockTrips() {
    const mockTrips = [
        {
            tripId: 1,
            name: 'Morning Safari',
            date: new Date().toISOString(),
            startTime: '09:00',
            route: 'Coastal Wildlife',
            boat: { boatName: 'Ocean Explorer' },
            guide: { firstName: 'John', secondName: 'Doe' }
        },
        {
            tripId: 2,
            name: 'Sunset Adventure',
            date: new Date().toISOString(),
            startTime: '17:00',
            route: 'Sunset Bay',
            boat: { boatName: 'Sea Breeze' },
            guide: { firstName: 'Sarah', secondName: 'Wilson' }
        }
    ];
    
    currentTrips = mockTrips;
    displayTrips(mockTrips);
    populateTripSelectors(); // Ensure selectors are populated with mock data
}

// Load boats data
async function loadBoats() {
    try {
        const response = await fetch('/api/boats', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch boats');
        }

        availableBoats = await response.json();
        populateBoatSelector();
    } catch (error) {
        console.error('Error loading boats:', error);
        showMockBoats();
    }
}

// Show mock boats data
function showMockBoats() {
    availableBoats = [
        { boatId: 1, boatName: 'Ocean Explorer', status: 'AVAILABLE' },
        { boatId: 2, boatName: 'Sea Breeze', status: 'AVAILABLE' },
        { boatId: 3, boatName: 'Wave Runner', status: 'MAINTENANCE' }
    ];
    populateBoatSelector();
}

// Load guides data
async function loadGuides() {
    try {
        console.log('Loading guides from dedicated API endpoint...');
        const response = await fetch('/api/staff/guides', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch guides from dedicated endpoint, status:', response.status);
            console.log('Trying fallback method...');
            // Fallback to the general staff endpoint
            return loadGuidesFromAllStaff();
        }

        availableGuides = await response.json();
        console.log('Guides loaded successfully from dedicated endpoint:', availableGuides);
        
        if (availableGuides.length === 0) {
            console.log('No guides found in dedicated API response, using mock data');
            showMockGuides();
        } else {
            populateGuideSelector();
        }
    } catch (error) {
        console.error('Error loading guides from dedicated endpoint:', error);
        console.log('Trying fallback method...');
        loadGuidesFromAllStaff();
    }
}

// Fallback method to load guides from the general staff endpoint
async function loadGuidesFromAllStaff() {
    try {
        console.log('Loading guides from general staff API...');
        const response = await fetch('/api/staff/all', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch staff members, status:', response.status);
            throw new Error('Failed to fetch guides');
        }

        const allStaff = await response.json();
        console.log('All staff loaded:', allStaff);
        
        // Filter only guides (SafariGuide role) - check multiple possible role fields
        availableGuides = allStaff.filter(user => {
            const role = user.role || user.roleType || user.discriminatorValue;
            return role === 'SAFARI_GUIDE' || role === 'SafariGuide' || user.constructor?.name === 'SafariGuide';
        });
        console.log('Available guides after filtering:', availableGuides);
        
        if (availableGuides.length === 0) {
            console.log('No guides found in general API response, using mock data');
            showMockGuides();
        } else {
            populateGuideSelector();
        }
    } catch (error) {
        console.error('Error loading guides from general staff endpoint:', error);
        console.log('Using mock guides due to error');
        showMockGuides();
    }
}

// Show mock guides data
function showMockGuides() {
    console.log('Loading mock guides data...');
    availableGuides = [
        { 
            userId: 1, 
            firstName: 'John', 
            secondName: 'Doe', 
            role: 'SAFARI_GUIDE',
            experience: '5 years'
        },
        { 
            userId: 2, 
            firstName: 'Sarah', 
            secondName: 'Wilson', 
            role: 'SAFARI_GUIDE',
            experience: '3 years'
        },
        { 
            userId: 3, 
            firstName: 'Mike', 
            secondName: 'Johnson', 
            role: 'SAFARI_GUIDE',
            experience: '7 years'
        },
        { 
            userId: 4, 
            firstName: 'Emma', 
            secondName: 'Thompson', 
            role: 'SAFARI_GUIDE',
            experience: '2 years'
        }
    ];
    console.log('Mock guides loaded:', availableGuides);
    populateGuideSelector();
}

// Populate trip selector dropdown
function populateTripSelectors() {
    const selector = document.getElementById('assignTripSelect');
    if (!selector) {
        console.error('Trip selector element not found');
        return;
    }
    
    selector.innerHTML = '<option value="">Select a trip...</option>';
    
    console.log('Populating trip selector with trips:', currentTrips);
    
    if (!currentTrips || currentTrips.length === 0) {
        selector.innerHTML += '<option value="" disabled>No trips available</option>';
        return;
    }
    
    currentTrips.forEach(trip => {
        const option = document.createElement('option');
        option.value = trip.tripId;
        const tripName = trip.name || 'Unnamed Trip';
        const tripDate = trip.date ? new Date(trip.date).toLocaleDateString() : 'No date';
        option.textContent = `${tripName} - ${tripDate}`;
        selector.appendChild(option);
    });
    
    console.log('Trip selector populated with', selector.options.length - 1, 'trips');
}

// Populate boat selector dropdown
function populateBoatSelector() {
    const selector = document.getElementById('assignBoatSelect');
    if (!selector) {
        console.error('Boat selector element not found');
        return;
    }
    
    selector.innerHTML = '<option value="">Select a boat...</option>';
    
    console.log('Populating boat selector with boats:', availableBoats);
    
    if (!availableBoats || availableBoats.length === 0) {
        selector.innerHTML += '<option value="" disabled>No boats available</option>';
        return;
    }
    
    // Show all boats, not just available ones, to allow reassignment
    availableBoats.forEach(boat => {
        const option = document.createElement('option');
        option.value = boat.boatId;
        const boatName = boat.boatName || `Boat ${boat.boatId}`;
        const statusText = boat.status === 'ASSIGNED' ? ' (Currently Assigned)' : '';
        option.textContent = `${boatName}${statusText}`;
        selector.appendChild(option);
    });
    
    console.log('Boat selector populated with', availableBoats.length, 'boats (including assigned ones)');
}

// Populate guide selector dropdown
function populateGuideSelector() {
    const selector = document.getElementById('assignGuideSelect');
    if (!selector) {
        console.error('Guide selector element not found');
        return;
    }
    
    selector.innerHTML = '<option value="">Select a guide...</option>';
    
    console.log('Populating guide selector with guides:', availableGuides);
    
    if (!availableGuides || availableGuides.length === 0) {
        console.log('No guides available for selector');
        selector.innerHTML += '<option value="" disabled>No guides available</option>';
        return;
    }
    
    // For now, show all guides since we don't have status field yet
    availableGuides.forEach(guide => {
        const option = document.createElement('option');
        option.value = guide.userId;
        const firstName = guide.firstName || 'Unknown';
        const lastName = guide.secondName || guide.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const experience = guide.yearsOfExperience ? `${guide.yearsOfExperience} years` : (guide.experience || 'Not specified');
        option.textContent = `${fullName} (${experience})`;
        console.log(`Adding guide option: ${fullName} (ID: ${guide.userId})`);
        selector.appendChild(option);
    });
    
    console.log('Guide selector populated with', availableGuides.length, 'guides');
}

// Populate edit trip modal boat dropdown
function populateEditTripBoatSelector() {
    const selector = document.getElementById('editTripBoat');
    if (!selector) {
        console.error('Edit trip boat selector element not found');
        return;
    }
    
    selector.innerHTML = '<option value="">Select a boat...</option>';
    
    if (!availableBoats || availableBoats.length === 0) {
        selector.innerHTML += '<option value="" disabled>No boats available</option>';
        return;
    }
    
    availableBoats.forEach(boat => {
        const option = document.createElement('option');
        option.value = boat.boatId;
        option.textContent = boat.boatName || `Boat ${boat.boatId}`;
        selector.appendChild(option);
    });
}

// Populate edit trip modal guide dropdown
function populateEditTripGuideSelector() {
    const selector = document.getElementById('editTripGuide');
    if (!selector) {
        console.error('Edit trip guide selector element not found');
        return;
    }
    
    selector.innerHTML = '<option value="">Select a guide...</option>';
    
    if (!availableGuides || availableGuides.length === 0) {
        selector.innerHTML += '<option value="" disabled>No guides available</option>';
        return;
    }
    
    availableGuides.forEach(guide => {
        const option = document.createElement('option');
        option.value = guide.userId;
        const firstName = guide.firstName || 'Unknown';
        const lastName = guide.secondName || guide.lastName || '';
        option.textContent = `${firstName} ${lastName}`.trim();
        selector.appendChild(option);
    });
}

// Load assignments data
async function loadAssignments() {
    try {
        const response = await fetch('/api/staff/assignments', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch assignments');
        }

        currentAssignments = await response.json();
        displayAssignments();
    } catch (error) {
        console.error('Error loading assignments:', error);
        // Mock assignments data for fallback
        currentAssignments = [
            {
                tripId: 1,
                tripName: 'Morning Safari',
                date: new Date().toISOString(),
                boatName: 'Ocean Explorer',
                guideName: 'John Doe',
                status: 'Confirmed'
            }
        ];
        displayAssignments();
    }
}

// Display assignments table
function displayAssignments() {
    const tbody = document.getElementById('assignmentTableBody');
    tbody.innerHTML = '';

    if (currentAssignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No assignments found</td></tr>';
        return;
    }

    currentAssignments.forEach(assignment => {
        const row = document.createElement('tr');
        const assignmentDate = new Date(assignment.date).toLocaleDateString();
        
        row.innerHTML = `
            <td>${assignment.tripName}</td>
            <td>${assignmentDate}</td>
            <td>${assignment.boatName}</td>
            <td>${assignment.guideName}</td>
            <td><span class="status-badge status-assigned">${assignment.status}</span></td>
            <td class="action-buttons">
                <button class="btn btn-info btn-sm" onclick="viewAssignmentDetails(${assignment.tripId})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeAssignment(${assignment.tripId})">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load capacity monitoring data
async function loadCapacityData() {
    try {
        // Mock capacity data for now
        const capacityData = {
            boats: { available: 8, total: 10 },
            guides: { available: 15, total: 20 },
            bookings: { today: 25, capacity: 50 },
            trips: { completed: 8, scheduled: 12 }
        };

        updateCapacityDisplay(capacityData);
    } catch (error) {
        console.error('Error loading capacity data:', error);
    }
}

// Update capacity display
function updateCapacityDisplay(data) {
    // Boat capacity
    const boatPercentage = Math.round((data.boats.available / data.boats.total) * 100);
    document.getElementById('boatCapacity').textContent = boatPercentage + '%';
    document.getElementById('boatCapacityBar').style.width = boatPercentage + '%';
    document.getElementById('boatsAvailable').textContent = data.boats.available;
    document.getElementById('boatsTotal').textContent = data.boats.total;

    // Guide capacity
    const guidePercentage = Math.round((data.guides.available / data.guides.total) * 100);
    document.getElementById('guideCapacity').textContent = guidePercentage + '%';
    document.getElementById('guideCapacityBar').style.width = guidePercentage + '%';
    document.getElementById('guidesAvailable').textContent = data.guides.available;
    document.getElementById('guidesTotal').textContent = data.guides.total;

    // Booking capacity
    const bookingPercentage = Math.round((data.bookings.today / data.bookings.capacity) * 100);
    document.getElementById('bookingCapacity').textContent = bookingPercentage + '%';
    document.getElementById('bookingCapacityBar').style.width = bookingPercentage + '%';
    document.getElementById('bookingsToday').textContent = data.bookings.today;
    document.getElementById('bookingCapacityTotal').textContent = data.bookings.capacity;

    // Trip completion
    const completionPercentage = Math.round((data.trips.completed / data.trips.scheduled) * 100);
    document.getElementById('completionRate').textContent = completionPercentage + '%';
    document.getElementById('completionBar').style.width = completionPercentage + '%';
    document.getElementById('tripsCompleted').textContent = data.trips.completed;
    document.getElementById('tripsScheduled').textContent = data.trips.scheduled;
}

// Tab navigation
function showTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab pane
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load specific data for the tab
    switch(tabName) {
        case 'schedules':
            loadTrips();
            break;
        case 'assignments':
            console.log('Loading assignment tab data...');
            // Refresh all assignment-related data
            Promise.all([
                loadTrips(),
                loadBoats(), 
                loadGuides(),
                loadAssignments()
            ]).then(() => {
                console.log('Assignment tab data loaded successfully');
            }).catch(error => {
                console.error('Error loading assignment tab data:', error);
            });
            break;
        case 'capacity':
            loadCapacityData();
            break;
        case 'realtime':
            loadRealTimeUpdates();
            break;
    }
}

// Setup form handlers
function setupFormHandlers() {
    // Add trip form handler
    const addTripForm = document.getElementById('addTripForm');
    if (addTripForm) {
        addTripForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewTrip();
        });
    }

    // Edit trip form handler
    const editTripForm = document.getElementById('editTripForm');
    if (editTripForm) {
        editTripForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateTrip();
        });
    }
}

// Modal functions
function openAddTripModal() {
    document.getElementById('addTripModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add new trip
async function addNewTrip() {
    try {
        const tripData = {
            name: document.getElementById('tripName').value,
            date: document.getElementById('tripDate').value,
            startTime: document.getElementById('tripStartTime').value,
            endTime: document.getElementById('tripEndTime').value,
            route: document.getElementById('tripRoute').value,
            capacity: parseInt(document.getElementById('tripCapacity').value),
            description: document.getElementById('tripDescription').value
        };

        const response = await fetch('/api/trips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(tripData)
        });

        if (!response.ok) {
            throw new Error('Failed to create trip');
        }

        const newTrip = await response.json();
        showNotification('Trip created successfully!', 'success');
        closeModal('addTripModal');
        document.getElementById('addTripForm').reset();
        loadTrips(); // Reload trips
    } catch (error) {
        console.error('Error creating trip:', error);
        showNotification('Error creating trip: ' + error.message, 'error');
    }
}

// Update existing trip
async function updateTrip() {
    try {
        const tripId = document.getElementById('editTripId').value;
        const boatId = document.getElementById('editTripBoat').value;
        const guideId = document.getElementById('editTripGuide').value;
        
        const tripData = {
            name: document.getElementById('editTripName').value,
            date: document.getElementById('editTripDate').value,
            startTime: document.getElementById('editTripStartTime').value,
            endTime: document.getElementById('editTripEndTime').value,
            route: document.getElementById('editTripRoute').value,
            capacity: parseInt(document.getElementById('editTripCapacity').value),
            price: parseFloat(document.getElementById('editTripPrice').value),
            location: document.getElementById('editTripLocation').value,
            description: document.getElementById('editTripDescription').value,
            boatId: boatId ? parseInt(boatId) : null,
            guideId: guideId ? parseInt(guideId) : null
        };

        console.log('Updating trip with data:', tripData);

        const response = await fetch(`/api/staff/trips/${tripId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(tripData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update trip');
        }

        const result = await response.json();
        showNotification(result.message || 'Trip updated successfully!', 'success');
        closeModal('editTripModal');
        
        // Reload data to reflect changes
        await Promise.all([
            loadTrips(),
            loadAssignments()
        ]);
    } catch (error) {
        console.error('Error updating trip:', error);
        showNotification('Error updating trip: ' + error.message, 'error');
    }
}

// Assign resources to trip
async function assignResources() {
    try {
        const tripSelect = document.getElementById('assignTripSelect');
        const boatSelect = document.getElementById('assignBoatSelect');
        const guideSelect = document.getElementById('assignGuideSelect');
        
        // Check if elements exist
        if (!tripSelect || !boatSelect || !guideSelect) {
            showNotification('Assignment form elements not found. Please refresh the page.', 'error');
            return;
        }

        const tripId = tripSelect.value;
        const boatId = boatSelect.value;
        const guideId = guideSelect.value;

        console.log('Assignment form values:', { tripId, boatId, guideId });

        if (!tripId) {
            showNotification('Please select a trip', 'warning');
            return;
        }

        // Allow clearing assignments - no validation needed for empty selections
        // This allows users to remove boat/guide assignments by selecting empty options

        const assignmentData = {
            tripId: parseInt(tripId),
            boatId: boatId ? parseInt(boatId) : null,
            guideId: guideId ? parseInt(guideId) : null
        };

        console.log('Sending assignment data:', assignmentData);

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication token not found. Please login again.', 'error');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('/api/staff/assign-resources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(assignmentData)
        });

        console.log('Assignment response status:', response.status);

        if (!response.ok) {
            let errorMessage = 'Failed to assign resources';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Assignment result:', result);
        
        showNotification(result.message || 'Resources assigned successfully!', 'success');
        
        // Reload data to reflect changes
        await Promise.all([
            loadTrips(),
            loadAssignments()
        ]);
        
        clearAssignmentForm();
    } catch (error) {
        console.error('Error assigning resources:', error);
        showNotification('Error assigning resources: ' + error.message, 'error');
    }
}

// Clear assignment form
function clearAssignments() {
    document.getElementById('assignTripSelect').value = '';
    document.getElementById('assignBoatSelect').value = '';
    document.getElementById('assignGuideSelect').value = '';
}

// Clear assignments for the selected trip (remove boat/guide assignments)
async function clearTripAssignments() {
    try {
        const tripSelect = document.getElementById('assignTripSelect');
        const tripId = tripSelect.value;

        if (!tripId) {
            showNotification('Please select a trip to clear assignments', 'warning');
            return;
        }

        if (!confirm('Are you sure you want to remove all assignments (boat and guide) from this trip?')) {
            return;
        }

        const assignmentData = {
            tripId: parseInt(tripId),
            boatId: null,
            guideId: null
        };

        console.log('Clearing assignments for trip:', assignmentData);

        const response = await fetch('/api/staff/assign-resources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(assignmentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to clear assignments');
        }

        const result = await response.json();
        showNotification(result.message || 'Assignments cleared successfully!', 'success');
        
        // Reload data to reflect changes
        await Promise.all([
            loadTrips(),
            loadAssignments()
        ]);
        
        clearAssignmentForm();
    } catch (error) {
        console.error('Error clearing assignments:', error);
        showNotification('Error clearing assignments: ' + error.message, 'error');
    }
}

function clearAssignmentForm() {
    clearAssignments();
}

// Refresh assignment data
async function refreshAssignmentData() {
    try {
        showNotification('Refreshing assignment data...', 'info');
        console.log('Refreshing assignment data...');
        
        await Promise.all([
            loadTrips(),
            loadBoats(),
            loadGuides(),
            loadAssignments()
        ]);
        
        showNotification('Assignment data refreshed successfully!', 'success');
        console.log('Assignment data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing assignment data:', error);
        showNotification('Error refreshing assignment data: ' + error.message, 'error');
    }
}

// Refresh functions
async function refreshSchedules() {
    showNotification('Refreshing schedules...', 'info');
    await loadTrips();
    showNotification('Schedules refreshed!', 'success');
}

// Export schedule
function exportSchedule() {
    try {
        const csvData = convertTripsToCSV(currentTrips);
        downloadCSV(csvData, 'trip_schedule.csv');
        showNotification('Schedule exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting schedule:', error);
        showNotification('Error exporting schedule', 'error');
    }
}

// Convert trips to CSV format
function convertTripsToCSV(trips) {
    const headers = ['Trip ID', 'Name', 'Date', 'Start Time', 'Route', 'Boat', 'Guide', 'Status'];
    const csvRows = [headers.join(',')];

    trips.forEach(trip => {
        const row = [
            trip.tripId,
            `"${trip.name || 'Safari Trip'}"`,
            new Date(trip.date).toLocaleDateString(),
            trip.startTime || 'N/A',
            `"${trip.route || 'N/A'}"`,
            `"${trip.boat ? trip.boat.boatName : 'Unassigned'}"`,
            `"${trip.guide ? trip.guide.firstName + ' ' + trip.guide.secondName : 'Unassigned'}"`,
            'Active'
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Real-time updates
function setupRealTimeUpdates() {
    loadRealTimeUpdates();
}

function loadRealTimeUpdates() {
    const feedContainer = document.getElementById('updatesFeed');
    if (!feedContainer) return;

    // Try to load real-time updates from API
    fetch('/api/staff/real-time-updates', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(updates => {
        feedContainer.innerHTML = '';
        updates.forEach(update => {
            const updateDiv = document.createElement('div');
            updateDiv.className = `update-item ${update.type}`;
            updateDiv.innerHTML = `
                <div class="update-time">${update.time}</div>
                <div class="update-message">${update.message}</div>
            `;
            feedContainer.appendChild(updateDiv);
        });
    })
    .catch(error => {
        console.error('Error loading real-time updates:', error);
        // Fallback to mock data
        const updates = [
            {
                time: new Date().toLocaleTimeString(),
                message: 'Trip "Morning Safari" assigned to boat "Ocean Explorer"',
                type: 'info'
            },
            {
                time: new Date(Date.now() - 300000).toLocaleTimeString(),
                message: 'Guide Sarah Wilson confirmed for Sunset Adventure',
                type: 'success'
            },
            {
                time: new Date(Date.now() - 600000).toLocaleTimeString(),
                message: 'Boat "Wave Runner" is under maintenance',
                type: 'warning'
            }
        ];

        feedContainer.innerHTML = '';
        updates.forEach(update => {
            const updateDiv = document.createElement('div');
            updateDiv.className = `update-item ${update.type}`;
            updateDiv.innerHTML = `
                <div class="update-time">${update.time}</div>
                <div class="update-message">${update.message}</div>
            `;
            feedContainer.appendChild(updateDiv);
        });
    });
}

function enableRealTimeUpdates() {
    if (realTimeEnabled) return;
    
    realTimeEnabled = true;
    updateInterval = setInterval(() => {
        loadRealTimeUpdates();
        loadQuickStats();
        loadCapacityData();
    }, 30000); // Update every 30 seconds
    
    showNotification('Real-time updates enabled', 'success');
}

function disableRealTimeUpdates() {
    if (!realTimeEnabled) return;
    
    realTimeEnabled = false;
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    showNotification('Real-time updates disabled', 'info');
}

function sendNotification() {
    const message = prompt('Enter notification message:');
    if (message) {
        showNotification(`Notification sent: ${message}`, 'success');
        // Here you would typically send the notification to other staff members
    }
}

// Trip management functions
function editTrip(tripId) {
    // Fetch trip details and open edit modal
    fetch(`/api/staff/trips/${tripId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Failed to fetch trip details');
            });
        }
        return response.json();
    })
    .then(trip => {
        // Populate dropdowns first
        populateEditTripBoatSelector();
        populateEditTripGuideSelector();
        
        // Populate edit form
        document.getElementById('editTripId').value = trip.tripId;
        document.getElementById('editTripName').value = trip.name || '';
        document.getElementById('editTripDate').value = trip.date || '';
        document.getElementById('editTripStartTime').value = trip.startTime || '';
        document.getElementById('editTripEndTime').value = trip.endTime || '';
        document.getElementById('editTripRoute').value = trip.route || '';
        document.getElementById('editTripCapacity').value = trip.capacity || '';
        document.getElementById('editTripPrice').value = trip.price || '';
        document.getElementById('editTripLocation').value = trip.location || '';
        document.getElementById('editTripDescription').value = trip.description || '';
        
        // Set boat and guide selections
        if (trip.boat && trip.boat.boatId) {
            document.getElementById('editTripBoat').value = trip.boat.boatId;
        }
        if (trip.guide && trip.guide.userId) {
            document.getElementById('editTripGuide').value = trip.guide.userId;
        }
        
        // Open edit modal
        document.getElementById('editTripModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching trip details:', error);
        showNotification('Error loading trip details: ' + error.message, 'error');
    });
}

function assignResourcesToTrip(tripId) {
    // Switch to assignments tab and pre-select the trip
    showTab('assignments');
    document.getElementById('assignTripSelect').value = tripId;
}

function deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
        // Implement trip deletion
        showNotification('Trip deletion feature coming soon', 'info');
    }
}

// Assignment management functions
function viewAssignmentDetails(tripId) {
    // Find the assignment to view
    const assignment = currentAssignments.find(a => a.tripId === tripId);
    
    if (!assignment) {
        showNotification('Assignment not found', 'error');
        return;
    }
    
    // Populate the modal with assignment data
    populateViewAssignmentDetailsModal(assignment);
    
    // Show the modal
    showModal('viewAssignmentDetailsModal');
}

// Populate the view assignment details modal with current data (read-only)
function populateViewAssignmentDetailsModal(assignment) {
    // Set hidden trip ID
    document.getElementById('viewAssignmentTripId').value = assignment.tripId;
    
    // Populate trip information header
    document.getElementById('viewTripInfoName').textContent = assignment.tripName || 'Unknown Trip';
    document.getElementById('viewTripInfoDate').textContent = new Date(assignment.date).toLocaleDateString();
    document.getElementById('viewTripInfoStatus').textContent = assignment.status || 'Unknown';
    document.getElementById('viewTripInfoStatus').className = `status-badge status-${(assignment.status || 'unknown').toLowerCase()}`;
    
    // Populate boat details
    document.getElementById('viewBoatName').textContent = assignment.boatName || 'Not assigned';
    document.getElementById('viewBoatCapacity').textContent = assignment.boatCapacity || 'Unknown';
    document.getElementById('viewBoatType').textContent = assignment.boatType || 'Unknown';
    
    // Populate guide details
    document.getElementById('viewGuideName').textContent = assignment.guideName || 'Not assigned';
    document.getElementById('viewGuideExperience').textContent = assignment.guideExperience || 'Not specified';
    document.getElementById('viewGuideLanguages').textContent = assignment.guideLanguages || 'Not specified';
    
    // Populate assignment notes
    document.getElementById('viewAssignmentNotes').textContent = assignment.notes || 'No notes available';
}

// Show modal function
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal function
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function removeAssignment(tripId) {
    if (confirm('Are you sure you want to remove this assignment?')) {
        // Implement assignment removal
        fetch(`/api/staff/assignments/${tripId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to remove assignment');
                });
            }
            return response.json();
        })
        .then(data => {
            showNotification('Assignment removed successfully!', 'success');
            loadAssignments(); // Reload assignments table
            loadTrips(); // Reload trips to update their status
        })
        .catch(error => {
            console.error('Error removing assignment:', error);
            showNotification('Error removing assignment: ' + error.message, 'error');
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Customize dashboard based on user role
function customizeDashboardByRole(userRole) {
    // All staff members can access the basic dashboard
    // But some features might be restricted based on role

    // IT Support and IT Assistant get additional technical features
    if (userRole === 'IT_SUPPORT' || userRole === 'IT_ASSISTANT') {
        // Add technical management options
        addTechnicalManagementOptions();
    }

    // Safari Guides get guide-specific features
    if (userRole === 'SAFARI_GUIDE' || userRole === 'GUIDE') {
        // Add guide-specific options
        addGuideSpecificOptions();
    }

    // Captains get boat management features
    if (userRole === 'CAPTAIN') {
        // Add captain-specific options
        addCaptainSpecificOptions();
    }

    // Admin gets full access (already handled in backend)
    if (userRole === 'ADMIN') {
        // Add admin link in the interface
        addAdminAccessOption();
    }
}

// Add technical management options for IT staff
function addTechnicalManagementOptions() {
    // Could add system monitoring, technical alerts, etc.
    console.log('IT staff features enabled');
}

// Add guide-specific options
function addGuideSpecificOptions() {
    // Could add guide schedule management, customer feedback, etc.
    console.log('Guide features enabled');
}

// Add captain-specific options  
function addCaptainSpecificOptions() {
    // Could add boat status updates, maintenance logs, etc.
    console.log('Captain features enabled');
}

// Add admin access option
function addAdminAccessOption() {
    // Add a link to admin dashboard if not already present
    const navLinks = document.querySelector('.header-actions');
    if (navLinks && !document.getElementById('adminLink')) {
        const adminLink = document.createElement('a');
        adminLink.id = 'adminLink';
        adminLink.href = '/admin.html';
        adminLink.className = 'btn btn-secondary';
        adminLink.innerHTML = '<i class="fas fa-cog"></i> Admin Panel';
        adminLink.style.marginLeft = '10px';
        navLinks.appendChild(adminLink);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = 'login.html';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Add CSS for notifications and updates
const additionalStyles = `
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .update-item {
        background: white;
        border-left: 4px solid #3498db;
        padding: 1rem;
        margin-bottom: 0.5rem;
        border-radius: 0 8px 8px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .update-item.success {
        border-left-color: #27ae60;
    }
    
    .update-item.warning {
        border-left-color: #f39c12;
    }
    
    .update-item.error {
        border-left-color: #e74c3c;
    }
    
    .update-time {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.25rem;
    }
    
    .update-message {
        font-weight: 500;
        color: #333;
    }
    
    .btn-sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
    }
    
    .action-buttons .btn {
        margin-right: 0.25rem;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);