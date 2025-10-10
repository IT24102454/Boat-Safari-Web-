// Admin Dashboard JavaScript
// This file contains the JavaScript for the admin dashboard

// Global variables
let currentTrips = [];
let currentBookings = [];
let availableStaff = [];
let availableBoats = [];
let upcomingTrips = [];

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'ADMIN') {
        window.location.href = 'login.html';
        return;
    }

    // Load initial data
    loadTrips();
    loadBoats();
    loadGuides();
    loadBookings();
    loadStaff();

    // Show staff management section if coming from direct link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'staff') {
        showSection('staff-management');
        loadStaffMembers(); // Load staff members immediately
    }

    // Set up logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });

    // Set up form submit handlers
    setupFormHandlers();

    // Set year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
});

// Show different sections of the dashboard
function showSection(section) {
    document.getElementById('trips-section').style.display = 'none';
    document.getElementById('bookings-section').style.display = 'none';
    document.getElementById('staff-section').style.display = 'none';
    document.getElementById('staff-management-section').style.display = 'none';

    document.getElementById(section + '-section').style.display = 'block';

    if (section === 'trips') {
        loadTrips();
    } else if (section === 'bookings') {
        loadBookings();
    } else if (section === 'staff') {
        loadStaff();
    } else if (section === 'staff-management') {
        loadStaffManagement();
    }
}

// Setup form submit handlers
function setupFormHandlers() {
    // Add trip form
    document.getElementById('add-trip-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const boatId = document.getElementById('boat').value;
        const guideId = document.getElementById('guide').value;

        const tripData = {
            date: document.getElementById('date').value,
            startTime: document.getElementById('start-time').value,
            endTime: document.getElementById('end-time').value,
            capacity: parseInt(document.getElementById('capacity').value),
            price: parseFloat(document.getElementById('price').value),
            route: document.getElementById('route').value
        };

        // Only add boat and guide if they were selected
        if (boatId) {
            tripData.boat = { boatId: boatId };
        }

        if (guideId) {
            tripData.guide = { userId: guideId };
        }

        try {
            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create trip');
            }

            closeModal('add-trip-modal');
            loadTrips();
            showNotification('Trip created successfully', 'success');
        } catch (error) {
            console.error('Error creating trip:', error);
            showNotification('Failed to create trip: ' + error.message, 'error');
        }
    });

    // Edit trip form
    document.getElementById('edit-trip-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const tripId = document.getElementById('edit-trip-id').value;
        const boatId = document.getElementById('edit-boat').value;
        const guideId = document.getElementById('edit-guide').value;

        const tripData = {
            date: document.getElementById('edit-date').value,
            startTime: document.getElementById('edit-start-time').value,
            endTime: document.getElementById('edit-end-time').value,
            capacity: parseInt(document.getElementById('edit-capacity').value),
            price: parseFloat(document.getElementById('edit-price').value),
            route: document.getElementById('edit-route').value
        };

        // Only add boat and guide if they were selected
        if (boatId) {
            tripData.boat = { boatId: boatId };
        }

        if (guideId) {
            tripData.guide = { userId: guideId };
        }

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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update trip');
            }

            closeModal('edit-trip-modal');
            loadTrips();
            showNotification('Trip updated successfully', 'success');
        } catch (error) {
            console.error('Error updating trip:', error);
            showNotification('Failed to update trip: ' + error.message, 'error');
        }
    });

    // Edit booking form
    document.getElementById('edit-booking-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const bookingId = document.getElementById('edit-booking-id').value;
        const tripId = document.getElementById('edit-booking-trip').value;

        const bookingData = {
            passengers: parseInt(document.getElementById('edit-booking-passengers').value),
            bookingStatus: document.getElementById('edit-booking-status').value,
            paymentStatus: document.getElementById('edit-payment-status').value,
            notes: document.getElementById('edit-booking-notes').value
        };

        // Add trip if selected
        if (tripId) {
            bookingData.trip = { tripId: tripId };
        }

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking');
            }

            closeModal('edit-booking-modal');
            loadBookings();
            showNotification('Booking updated successfully', 'success');
        } catch (error) {
            console.error('Error updating booking:', error);
            showNotification('Failed to update booking: ' + error.message, 'error');
        }
    });

    // Add staff assignment form
    document.getElementById('edit-trip-staff-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const tripId = document.getElementById('edit-staff-trip-id').value;
        const guideId = document.getElementById('edit-staff-guide').value;
        const captainId = document.getElementById('edit-staff-captain').value;

        const staffAssignmentData = {
            tripId: tripId
        };

        if (guideId) {
            staffAssignmentData.guideId = guideId;
        }

        if (captainId) {
            staffAssignmentData.captainId = captainId;
        }

        try {
            const response = await fetch('/api/trips/assign-staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(staffAssignmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to assign staff');
            }

            closeModal('edit-trip-staff-modal');
            loadStaff();
            showNotification('Staff assigned successfully', 'success');
        } catch (error) {
            console.error('Error assigning staff:', error);
            showNotification('Failed to assign staff: ' + error.message, 'error');
        }
    });

    // Create booking form (new functionality)
    document.getElementById('add-booking-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const tripId = document.getElementById('add-booking-trip').value;
        const customerId = document.getElementById('add-booking-customer').value;

        const bookingData = {
            passengers: parseInt(document.getElementById('add-booking-passengers').value),
            bookingStatus: document.getElementById('add-booking-status').value,
            paymentStatus: document.getElementById('add-payment-status').value,
            notes: document.getElementById('add-booking-notes').value
        };

        // Add trip if selected
        if (tripId) {
            bookingData.trip = { tripId: tripId };
        } else {
            showNotification('Please select a trip', 'error');
            return;
        }

        // Add customer if selected
        if (customerId) {
            bookingData.customer = { userId: customerId };
        } else {
            showNotification('Please select a customer', 'error');
            return;
        }

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            closeModal('add-booking-modal');
            loadBookings();
            showNotification('Booking created successfully', 'success');
        } catch (error) {
            console.error('Error creating booking:', error);
            showNotification('Failed to create booking: ' + error.message, 'error');
        }
    });
}

// Load trips
async function loadTrips() {
    try {
        const response = await fetch('/api/trips', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trips');
        }

        currentTrips = await response.json();
        displayTrips(currentTrips);
    } catch (error) {
        console.error('Error loading trips:', error);
        showNotification('Failed to load trips', 'error');
    }
}

// Load boats
async function loadBoats() {
    try {
        const response = await fetch('/api/boats', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch boats');
        }

        availableBoats = await response.json();
        populateBoatDropdowns(availableBoats);
    } catch (error) {
        console.error('Error loading boats:', error);
        // Continue without boat data
    }
}

// Load guides
async function loadGuides() {
    try {
        const response = await fetch('/api/guides', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch guides');
        }

        const guides = await response.json();
        populateGuideDropdowns(guides);
    } catch (error) {
        console.error('Error loading guides:', error);
        // Continue without guide data
    }
}

// Load bookings
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        currentBookings = await response.json();
        displayBookings(currentBookings);

        // Also populate trip dropdown for booking filters
        populateBookingTripDropdown(currentTrips);
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Failed to load bookings', 'error');
    }
}

// Load staff
async function loadStaff() {
    try {
        const response = await fetch('/api/staff', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch staff');
        }

        availableStaff = await response.json();
        displayAvailableStaff(availableStaff);

        // Load upcoming trips that need staff
        loadUpcomingTrips();
    } catch (error) {
        console.error('Error loading staff:', error);
        showNotification('Failed to load staff', 'error');
    }
}

// Load upcoming trips that need staff
async function loadUpcomingTrips() {
    try {
        const response = await fetch('/api/trips/upcoming', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch upcoming trips');
        }

        upcomingTrips = await response.json();
        displayStaffTrips(upcomingTrips);
    } catch (error) {
        console.error('Error loading upcoming trips:', error);
        // Continue without upcoming trips data
    }
}

// Populate trip dropdown for booking filters
function populateBookingTripDropdown(trips) {
    const tripFilter = document.getElementById('booking-trip-filter');
    const addBookingTripSelect = document.getElementById('add-booking-trip');
    const editBookingTripSelect = document.getElementById('edit-booking-trip');

    // Clear existing options
    tripFilter.innerHTML = '<option value="">All Trips</option>';

    if (addBookingTripSelect) {
        addBookingTripSelect.innerHTML = '<option value="">Select a trip</option>';
    }

    if (editBookingTripSelect) {
        editBookingTripSelect.innerHTML = '<option value="">Select a trip</option>';
    }

    // Add trip options
    trips.forEach(trip => {
        const date = new Date(trip.date).toLocaleDateString();
        const option = document.createElement('option');
        option.value = trip.tripId;
        option.textContent = `${trip.route} (${date})`;

        tripFilter.appendChild(option.cloneNode(true));

        if (addBookingTripSelect) {
            addBookingTripSelect.appendChild(option.cloneNode(true));
        }

        if (editBookingTripSelect) {
            editBookingTripSelect.appendChild(option.cloneNode(true));
        }
    });
}

// Apply booking filters
function applyBookingFilters() {
    const statusFilter = document.getElementById('booking-status-filter').value;
    const dateFilter = document.getElementById('booking-date-filter').value;
    const tripFilter = document.getElementById('booking-trip-filter').value;

    let filteredBookings = [...currentBookings];

    // Apply status filter if selected
    if (statusFilter) {
        filteredBookings = filteredBookings.filter(booking => booking.bookingStatus === statusFilter);
    }

    // Apply date filter if selected
    if (dateFilter) {
        const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
        filteredBookings = filteredBookings.filter(booking => {
            if (!booking.date) return false;
            const bookingDate = new Date(booking.date).setHours(0, 0, 0, 0);
            return bookingDate === filterDate;
        });
    }

    // Apply trip filter if selected
    if (tripFilter) {
        filteredBookings = filteredBookings.filter(booking => {
            return booking.trip && booking.trip.tripId == tripFilter;
        });
    }

    // Display filtered bookings
    displayBookings(filteredBookings);
}

// Clear booking filters
function clearBookingFilters() {
    document.getElementById('booking-status-filter').value = '';
    document.getElementById('booking-date-filter').value = '';
    document.getElementById('booking-trip-filter').value = '';

    // Reload all bookings
    displayBookings(currentBookings);
}

// Apply staff filters
function applyStaffFilters() {
    const dateFilter = document.getElementById('staff-date-filter').value;
    const typeFilter = document.getElementById('staff-type-filter').value;

    let filteredStaff = [...availableStaff];

    // Apply type filter if selected
    if (typeFilter) {
        filteredStaff = filteredStaff.filter(staff => staff.roleType === typeFilter);
    }

    // Display filtered staff
    displayAvailableStaff(filteredStaff);

    // Filter upcoming trips by date if selected
    let filteredTrips = [...upcomingTrips];
    if (dateFilter) {
        const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
        filteredTrips = filteredTrips.filter(trip => {
            if (!trip.date) return false;
            const tripDate = new Date(trip.date).setHours(0, 0, 0, 0);
            return tripDate === filterDate;
        });
    }

    // Display filtered upcoming trips
    displayStaffTrips(filteredTrips);
}

// Clear staff filters
function clearStaffFilters() {
    document.getElementById('staff-date-filter').value = '';
    document.getElementById('staff-type-filter').value = '';

    // Reload all staff and upcoming trips
    displayAvailableStaff(availableStaff);
    displayStaffTrips(upcomingTrips);
}

// Open add booking modal
function openAddBookingModal() {
    // Reset form
    document.getElementById('add-booking-form').reset();

    // Load customers for dropdown
    loadCustomers();

    // Set default status values
    document.getElementById('add-booking-status').value = 'PENDING';
    document.getElementById('add-payment-status').value = 'UNPAID';

    // Show modal
    document.getElementById('add-booking-modal').style.display = 'block';
}

// Load customers for dropdown
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch customers');
        }

        const customers = await response.json();
        const customerSelect = document.getElementById('add-booking-customer');

        // Clear existing options
        customerSelect.innerHTML = '<option value="">Select a customer</option>';

        // Add customer options
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.userId;
            option.textContent = `${customer.firstName} ${customer.lastName} (${customer.email})`;
            customerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Failed to load customers', 'error');
    }
}

// Delete trip confirmation
function confirmDeleteTrip() {
    const tripId = document.getElementById('delete-trip-id').value;

    fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Failed to delete trip');
            });
        }
        closeModal('delete-confirmation-modal');
        loadTrips();
        showNotification('Trip deleted successfully', 'success');
    })
    .catch(error => {
        console.error('Error deleting trip:', error);
        showNotification('Failed to delete trip: ' + error.message, 'error');
    });
}

// Delete booking confirmation
function confirmDeleteBooking() {
    const bookingId = document.getElementById('delete-booking-id').value;

    fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Failed to delete booking');
            });
        }
        closeModal('delete-booking-modal');
        loadBookings();
        showNotification('Booking deleted successfully', 'success');
    })
    .catch(error => {
        console.error('Error deleting booking:', error);
        showNotification('Failed to delete booking: ' + error.message, 'error');
    });
}

// Open delete booking confirmation modal
function openDeleteBookingConfirmation(bookingId) {
    document.getElementById('delete-booking-id').value = bookingId;
    document.getElementById('delete-booking-modal').style.display = 'block';
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

        // Populate form fields
        document.getElementById('edit-booking-id').value = booking.bookingId;
        document.getElementById('edit-booking-customer').value = booking.customerName || '';
        document.getElementById('edit-booking-passengers').value = booking.passengers || 1;
        document.getElementById('edit-booking-status').value = booking.bookingStatus || 'PENDING';
        document.getElementById('edit-payment-status').value = booking.paymentStatus || 'UNPAID';
        document.getElementById('edit-booking-notes').value = booking.notes || '';

        if (booking.trip) {
            document.getElementById('edit-booking-trip').value = booking.trip.tripId;
        }

        document.getElementById('edit-booking-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading booking details:', error);
        showNotification('Failed to load booking details', 'error');
    }
}

// Show notification
function showNotification(message, type) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(notification);
    }

    // Set notification type
    if (type === 'success') {
        notification.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else {
        notification.style.backgroundColor = '#3498db';
    }

    // Set message
    notification.textContent = message;

    // Show notification
    notification.style.opacity = '1';

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
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
