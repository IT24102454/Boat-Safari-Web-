/**
 * Guide Dashboard JavaScript
 * Handles functionality for Safari Guide dashboard
 */

// Display current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Global variables
let currentTripId = null;
let currentTrip = null;
let upcomingTrips = [];
let pastTrips = [];

// Check if user is authenticated and has guide role
document.addEventListener('DOMContentLoaded', function() {
    // Check token exists
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || (userRole !== 'GUIDE' && userRole !== 'SAFARI_GUIDE')) {
        // Redirect to login if not authenticated or not a guide
        console.log('Not authenticated as guide. Redirecting to login.');
        window.location.href = 'login.html?redirect=guide.html';
        return;
    }

    // Display guide name if available from localStorage
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    if (userDetails && userDetails.firstName) {
        document.getElementById('guide-name').textContent = `${userDetails.firstName} ${userDetails.secondName || ''}`;
    }

    // Setup event listeners
    document.getElementById('back-to-trips').addEventListener('click', showTripsList);
    document.getElementById('logout-link').addEventListener('click', logout);
    document.getElementById('confirm-check-in').addEventListener('click', confirmCheckIn);

    // Load initial data
    loadUpcomingTrips();

    // Tab change handlers
    const upcomingTab = document.querySelector('a[href="#upcoming-trips"]');
    const pastTab = document.querySelector('a[href="#past-trips"]');

    upcomingTab.addEventListener('click', function() {
        upcomingTab.classList.add('active');
        pastTab.classList.remove('active');
        document.getElementById('upcoming-trips').classList.add('show', 'active');
        document.getElementById('past-trips').classList.remove('show', 'active');
        document.getElementById('trip-details').style.display = 'none';
        loadUpcomingTrips();
    });

    pastTab.addEventListener('click', function() {
        pastTab.classList.add('active');
        upcomingTab.classList.remove('active');
        document.getElementById('past-trips').classList.add('show', 'active');
        document.getElementById('upcoming-trips').classList.remove('show', 'active');
        document.getElementById('trip-details').style.display = 'none';
        loadPastTrips();
    });
});

// Load upcoming trips for the guide
function loadUpcomingTrips() {
    fetch('/api/guide/trips/upcoming')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load upcoming trips');
            }
            return response.json();
        })
        .then(trips => {
            upcomingTrips = trips;
            renderTrips(trips, 'upcoming-trips-container');
        })
        .catch(error => {
            console.error('Error loading upcoming trips:', error);
            document.getElementById('upcoming-trips-container').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Failed to load trips. Please try again later.
                    </div>
                </div>
            `;
        });
}

// Load past trips for the guide
function loadPastTrips() {
    fetch('/api/guide/trips/past')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load past trips');
            }
            return response.json();
        })
        .then(trips => {
            pastTrips = trips;
            renderTrips(trips, 'past-trips-container', true);
        })
        .catch(error => {
            console.error('Error loading past trips:', error);
            document.getElementById('past-trips-container').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Failed to load trips. Please try again later.
                    </div>
                </div>
            `;
        });
}

// Render trips to the specified container
function renderTrips(trips, containerId, isPast = false) {
    const container = document.getElementById(containerId);

    if (trips.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    ${isPast ? 'No past trips found.' : 'No upcoming trips scheduled.'}
                </div>
            </div>
        `;
        return;
    }

    let html = '';
    trips.forEach(trip => {
        // Format date and time
        const tripDate = new Date(trip.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        const startTime = formatTime(trip.startTime);
        const endTime = formatTime(trip.endTime);

        // Calculate check-in percentage
        const checkinPercentage = trip.bookedPassengers > 0
            ? Math.round((trip.checkedInPassengers / trip.bookedPassengers) * 100)
            : 0;

        // Determine badge color based on date and check-in status
        let badgeClass = 'bg-primary';
        let badgeText = 'Upcoming';

        if (isPast) {
            badgeClass = 'bg-secondary';
            badgeText = 'Completed';
        } else {
            // Check if the trip is today
            const today = new Date().toDateString();
            const tripDateStr = new Date(trip.date).toDateString();

            if (today === tripDateStr) {
                badgeClass = 'bg-success';
                badgeText = 'Today';
            }
        }

        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card trip-card h-100" data-trip-id="${trip.tripId}">
                    <div class="badge ${badgeClass} badge-corner">${badgeText}</div>
                    <div class="card-body">
                        <h5 class="card-title">${trip.name}</h5>
                        <div class="d-flex justify-content-between mb-3">
                            <span><i class="fas fa-calendar-day me-1"></i> ${tripDate}</span>
                            <span><i class="far fa-clock me-1"></i> ${startTime} - ${endTime}</span>
                        </div>
                        <p class="card-text text-truncate">${trip.description || 'No description available.'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-map-marker-alt me-1"></i> ${trip.location}</span>
                            <span><i class="fas fa-ship me-1"></i> ${trip.boatName}</span>
                        </div>
                        <hr>
                        <div>
                            <div class="d-flex justify-content-between mb-1">
                                <span>Passenger Check-ins:</span>
                                <span>${trip.checkedInPassengers} of ${trip.bookedPassengers}</span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar ${getProgressBarClass(checkinPercentage)}" role="progressbar" 
                                    style="width: ${checkinPercentage}%" aria-valuenow="${checkinPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-outline-primary btn-sm w-100 view-trip-btn">
                            ${isPast ? 'View Details' : 'Manage Check-ins'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add click event listeners to trip cards
    const tripCards = container.querySelectorAll('.trip-card');
    tripCards.forEach(card => {
        card.addEventListener('click', function() {
            const tripId = this.getAttribute('data-trip-id');
            showTripDetails(tripId, isPast);
        });
    });
}

// Show trip details and passenger list
function showTripDetails(tripId, isPast = false) {
    currentTripId = tripId;

    // Find the trip from our cached arrays
    currentTrip = [...upcomingTrips, ...pastTrips].find(trip => trip.tripId == tripId);

    if (!currentTrip) {
        console.error('Trip not found:', tripId);
        return;
    }

    // Hide trip lists and show details
    document.getElementById('upcoming-trips').classList.remove('show', 'active');
    document.getElementById('past-trips').classList.remove('show', 'active');
    document.getElementById('trip-details').style.display = 'block';

    // Update trip details
    document.getElementById('trip-detail-title').textContent = currentTrip.name;

    const tripDate = new Date(currentTrip.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    const startTime = formatTime(currentTrip.startTime);
    const endTime = formatTime(currentTrip.endTime);
    document.getElementById('trip-date-time').textContent = `${tripDate}, ${startTime} - ${endTime}`;

    document.getElementById('trip-location').textContent = currentTrip.location;
    document.getElementById('trip-route').textContent = currentTrip.route || 'Not specified';
    document.getElementById('trip-boat').textContent = currentTrip.boatName;
    document.getElementById('trip-capacity').textContent = currentTrip.capacity;
    document.getElementById('trip-bookings').textContent = currentTrip.bookedPassengers;

    // Update check-in progress
    const checkinPercentage = currentTrip.bookedPassengers > 0
        ? Math.round((currentTrip.checkedInPassengers / currentTrip.bookedPassengers) * 100)
        : 0;
    document.getElementById('check-in-progress').style.width = `${checkinPercentage}%`;
    document.getElementById('checked-in-count').textContent = `${currentTrip.checkedInPassengers} Checked in`;
    document.getElementById('total-passengers').textContent = `of ${currentTrip.bookedPassengers} passengers`;

    // Load passenger list
    loadPassengerList(tripId, isPast);
}

// Load passenger list for a specific trip
function loadPassengerList(tripId, isPast = false) {
    document.getElementById('passenger-list').innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Loading passenger list...
            </td>
        </tr>
    `;

    fetch(`/api/guide/trips/${tripId}/passengers`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load passengers');
            }
            return response.json();
        })
        .then(passengers => {
            renderPassengerList(passengers, isPast);
            document.getElementById('passenger-count').textContent = `${passengers.length} passengers`;
        })
        .catch(error => {
            console.error('Error loading passengers:', error);
            document.getElementById('passenger-list').innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="alert alert-danger mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Failed to load passenger list. Please try again.
                        </div>
                    </td>
                </tr>
            `;
        });
}

// Render passenger list
function renderPassengerList(passengers, isPast = false) {
    const passengerList = document.getElementById('passenger-list');

    if (passengers.length === 0) {
        passengerList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">No passengers booked for this trip.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    passengers.forEach(passenger => {
        const checkinStatus = passenger.checkedIn
            ? `<span class="badge bg-success"><i class="fas fa-check me-1"></i>Checked In</span>`
            : `<span class="badge bg-warning text-dark"><i class="fas fa-hourglass-half me-1"></i>Pending</span>`;

        const actionButton = passenger.checkedIn
            ? `<button class="btn btn-sm btn-outline-danger undo-checkin-btn" data-booking-id="${passenger.bookingId}" ${isPast ? 'disabled' : ''}>
                <i class="fas fa-undo me-1"></i>Undo
              </button>`
            : `<button class="btn btn-sm btn-success checkin-btn" data-booking-id="${passenger.bookingId}" data-passenger-name="${passenger.passengerName}" data-passenger-count="${passenger.passengerCount}" ${isPast ? 'disabled' : ''}>
                <i class="fas fa-check-circle me-1"></i>Check In
              </button>`;

        html += `
            <tr>
                <td>${passenger.passengerName}</td>
                <td>${passenger.contact || 'N/A'}</td>
                <td>${passenger.email || 'N/A'}</td>
                <td>${passenger.passengerCount}</td>
                <td>${checkinStatus}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });

    passengerList.innerHTML = html;

    // Add event listeners to check-in buttons
    const checkInButtons = passengerList.querySelectorAll('.checkin-btn');
    checkInButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            const passengerName = this.getAttribute('data-passenger-name');
            const passengerCount = this.getAttribute('data-passenger-count');

            document.getElementById('checkin-passenger-name').textContent = passengerName;
            document.getElementById('checkin-passenger-count').textContent = passengerCount;

            // Store booking ID to use when confirming
            document.getElementById('confirm-check-in').setAttribute('data-booking-id', bookingId);

            // Show modal
            const checkInModal = new bootstrap.Modal(document.getElementById('check-in-modal'));
            checkInModal.show();
        });
    });

    // Add event listeners to undo check-in buttons
    const undoButtons = passengerList.querySelectorAll('.undo-checkin-btn');
    undoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            undoPassengerCheckIn(bookingId);
        });
    });
}

// Show trip list and hide details
function showTripsList() {
    document.getElementById('trip-details').style.display = 'none';

    // Show the active tab again
    const activeTab = document.querySelector('.sidebar .nav-link.active');
    const targetId = activeTab.getAttribute('href').substring(1);
    document.getElementById(targetId).classList.add('show', 'active');
}

// Handle passenger check-in
function confirmCheckIn() {
    const bookingId = document.getElementById('confirm-check-in').getAttribute('data-booking-id');
    const notes = document.getElementById('check-in-notes').value;

    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('check-in-modal'));
    modal.hide();

    // Show loading state
    const passengerRow = document.querySelector(`button[data-booking-id="${bookingId}"]`).closest('tr');
    const actionCell = passengerRow.querySelector('td:last-child');
    actionCell.innerHTML = `
        <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;

    // Make API call
    fetch('/api/guide/check-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `bookingId=${bookingId}&notes=${encodeURIComponent(notes)}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to check in passenger');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Refresh passenger list
            loadPassengerList(currentTripId);

            // Update current trip object
            if (currentTrip) {
                currentTrip.checkedInPassengers += 1;

                // Update UI
                const checkinPercentage = currentTrip.bookedPassengers > 0
                    ? Math.round((currentTrip.checkedInPassengers / currentTrip.bookedPassengers) * 100)
                    : 0;
                document.getElementById('check-in-progress').style.width = `${checkinPercentage}%`;
                document.getElementById('checked-in-count').textContent = `${currentTrip.checkedInPassengers} Checked in`;
            }
        } else {
            throw new Error(data.message || 'Failed to check in passenger');
        }
    })
    .catch(error => {
        console.error('Error checking in passenger:', error);
        actionCell.innerHTML = `
            <div class="alert alert-danger p-2 mb-0">
                <small>Check-in failed. Please try again.</small>
            </div>
        `;

        // Restore original button after 3 seconds
        setTimeout(() => {
            loadPassengerList(currentTripId);
        }, 3000);
    });
}

// Handle undoing passenger check-in
function undoPassengerCheckIn(bookingId) {
    // Show loading state
    const passengerRow = document.querySelector(`button[data-booking-id="${bookingId}"]`).closest('tr');
    const actionCell = passengerRow.querySelector('td:last-child');
    actionCell.innerHTML = `
        <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;

    // Make API call
    fetch('/api/guide/undo-check-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `bookingId=${bookingId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to undo check in');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Refresh passenger list
            loadPassengerList(currentTripId);

            // Update current trip object
            if (currentTrip && currentTrip.checkedInPassengers > 0) {
                currentTrip.checkedInPassengers -= 1;

                // Update UI
                const checkinPercentage = currentTrip.bookedPassengers > 0
                    ? Math.round((currentTrip.checkedInPassengers / currentTrip.bookedPassengers) * 100)
                    : 0;
                document.getElementById('check-in-progress').style.width = `${checkinPercentage}%`;
                document.getElementById('checked-in-count').textContent = `${currentTrip.checkedInPassengers} Checked in`;
            }
        } else {
            throw new Error(data.message || 'Failed to undo check in');
        }
    })
    .catch(error => {
        console.error('Error undoing check in:', error);
        actionCell.innerHTML = `
            <div class="alert alert-danger p-2 mb-0">
                <small>Failed to undo check-in. Please try again.</small>
            </div>
        `;

        // Restore original button after 3 seconds
        setTimeout(() => {
            loadPassengerList(currentTripId);
        }, 3000);
    });
}

// Helper Functions

// Format time string to 12-hour format
function formatTime(timeString) {
    if (!timeString) return 'N/A';

    const parts = timeString.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours}:${minutes} ${ampm}`;
}

// Get appropriate progress bar class based on percentage
function getProgressBarClass(percentage) {
    if (percentage < 30) return 'bg-danger';
    if (percentage < 70) return 'bg-warning';
    return 'bg-success';
}

// Logout function (this should interact with auth.js)
function logout() {
    if (typeof signOut === 'function') {
        signOut();
    } else {
        // Fallback if auth.js doesn't have signOut function
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }
}
