// User management functions for admin dashboard
let allUsers = [];

// Function to load all users for role management
function loadStaffMembers() {
    fetch('/api/admin/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return response.json();
    })
    .then(data => {
        allUsers = data;
        displayStaffMembers(allUsers);
    })
    .catch(error => {
        console.error('Error loading users:', error);
        alert('Failed to load users. Please try again.');
    });
}

// Function to display users in the table
function displayStaffMembers(userList) {
    const tbody = document.getElementById('staff-management-tbody');
    tbody.innerHTML = '';

    if (userList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No users found</td></tr>';
        return;
    }

    userList.forEach(user => {
        // Format the date to display properly (only for staff roles)
        const hireDate = user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A';

        // Determine user role
        let role = getStaffRole(user.roleType);

        // Create row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.firstName} ${user.secondName}</td>
            <td>${user.email}</td>
            <td>${user.contactNo || 'N/A'}</td>
            <td>${role}</td>
            <td>${user.certification || 'N/A'}</td>
            <td>${hireDate}</td>
            <td><span class="status-badge active">Active</span></td>
            <td class="action-buttons">
                <button onclick="viewStaffDetails(${user.userId})"><i class="fas fa-eye"></i> View</button>
                <button onclick="editStaffMember(${user.userId})"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="showRoleAssignmentModal(${user.userId}, '${role}')"><i class="fas fa-user-tag"></i> Role</button>
                <button onclick="showDeleteStaffModal(${user.userId})" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter users by role
function applyStaffManagementFilters() {
    const roleFilter = document.getElementById('staff-role-filter').value.toUpperCase();

    let filteredUsers;

    if (roleFilter) {
        // Map selected filter to actual discriminator value
        filteredUsers = roleFilter ?
            allUsers.filter(user => user.roleType === roleFilter) :
            allUsers;
    } else {
        filteredUsers = allUsers;
    }

    displayStaffMembers(filteredUsers);
}

// Clear filters
function clearStaffManagementFilters() {
    document.getElementById('staff-role-filter').value = '';
    displayStaffMembers(allUsers);
}

// View staff details
function viewStaffDetails(staffId) {
    const staff = allUsers.find(s => s.id === staffId || s.userId === staffId);
    if (!staff) return;

    // Create modal content
    const modalHTML = `
        <div id="view-staff-modal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('view-staff-modal').remove()">&times;</span>
                <h2>Staff Details</h2>
                <div style="margin-top: 20px;">
                    <h3>${staff.firstName} ${staff.secondName}</h3>
                    <p><strong>ID:</strong> ${staff.id || staff.userId}</p>
                    <p><strong>Email:</strong> ${staff.email}</p>
                    <p><strong>Contact:</strong> ${staff.contactNo || 'N/A'}</p>
                    <p><strong>Role:</strong> ${getStaffRole(staff.roleType)}</p>
                    <p><strong>Certification/Experience:</strong> ${staff.certification || 'N/A'}</p>
                    <p><strong>Hire Date:</strong> ${staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Address:</strong> ${formatAddress(staff)}</p>
                </div>
                <button onclick="document.getElementById('view-staff-modal').remove()" style="margin-top: 20px;">Close</button>
            </div>
        </div>
    `;

    // Add modal to the body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
}

// Helper function to get staff role from discriminator
function getStaffRole(roleType) {
    // Handle null/undefined values
    if (!roleType) {
        return 'Not Assigned';
    }
    
    // Convert to uppercase for case-insensitive comparison
    const role = roleType.toUpperCase();
    
    switch (role) {
        case 'ADMIN': 
        case 'ADMINISTRATOR': 
            return 'Administrator';
            
        case 'GUIDE': 
        case 'SAFARI_GUIDE': 
        case 'SAFARIGUIDE':
            return 'Safari Guide';
            
        case 'IT_SUPPORT': 
        case 'ITSUPPORT':
            return 'IT Support';
            
        case 'IT_ASSISTANT': 
        case 'ITASSISTANT':
            return 'IT Assistant';
            
        case 'CAPTAIN': 
        case 'BOAT_CAPTAIN':
        case 'BOATCAPTAIN':
            return 'Boat Captain';
            
        case 'STAFF': 
        case 'GENERAL_STAFF':
        case 'STAFF_MEMBER':
        case 'STAFFMEMBER':
            return 'General Staff';
            
        case 'CUSTOMER':
        case 'CLIENT':
            return 'Customer';
            
        default: 
            console.warn('Unknown role type:', roleType);
            return `Unknown Role (${roleType})`;
    }
}

// Helper function to format address
function formatAddress(staff) {
    const addressParts = [];
    if (staff.address) addressParts.push(staff.address);
    if (staff.street) addressParts.push(staff.street);
    if (staff.city) addressParts.push(staff.city);
    if (staff.postalCode) addressParts.push(staff.postalCode);

    return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
}

// Function to edit staff member
function editStaffMember(staffId) {
    const staff = allUsers.find(s => s.id === staffId || s.userId === staffId);
    if (!staff) return;

    // Populate form fields
    document.getElementById('edit-staff-id').value = staff.id || staff.userId;
    document.getElementById('edit-staff-first-name').value = staff.firstName || '';
    document.getElementById('edit-staff-last-name').value = staff.secondName || '';
    document.getElementById('edit-staff-email').value = staff.email || '';
    document.getElementById('edit-staff-password').value = ''; // Don't populate password

    // Set role dropdown
    const roleSelect = document.getElementById('edit-staff-role');
    roleSelect.value = staff.roleType || 'STAFF';

    document.getElementById('edit-staff-contact').value = staff.contactNo || '';
    document.getElementById('edit-staff-address').value = staff.address || '';
    document.getElementById('edit-staff-city').value = staff.city || '';
    document.getElementById('edit-staff-street').value = staff.street || '';
    document.getElementById('edit-staff-postal-code').value = staff.postalCode || '';

    // This is the missing line causing the edit button not to work - set certification/experience
    // There's no "edit-staff-experience" field in HTML, so we'll check if both elements exist
    const experienceField = document.getElementById('edit-staff-experience');
    const certificationField = document.getElementById('edit-staff-certification');

    if (experienceField) {
        experienceField.value = staff.certification || '';
    } else if (certificationField) {
        certificationField.value = staff.certification || '';
    }

    if (staff.hireDate) {
        // Format date for input field (YYYY-MM-DD)
        const hireDate = new Date(staff.hireDate);
        const year = hireDate.getFullYear();
        const month = String(hireDate.getMonth() + 1).padStart(2, '0');
        const day = String(hireDate.getDate()).padStart(2, '0');
        document.getElementById('edit-staff-hire-date').value = `${year}-${month}-${day}`;
    } else {
        document.getElementById('edit-staff-hire-date').value = '';
    }

    // Display the edit modal
    const modal = document.getElementById('edit-staff-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Edit staff modal not found!');
    }
}

// Function to show the role assignment modal
function showRoleAssignmentModal(userId, currentRole) {
    const user = allUsers.find(u => u.userId == userId);
    if (!user) {
        alert('User not found');
        return;
    }

    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'roleAssignmentModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('roleAssignmentModal')">&times;</span>
            <h2>Assign Role</h2>
            <p>Assigning role for: <strong>${user.firstName} ${user.secondName}</strong></p>
            <p>Current role: <strong>${currentRole}</strong></p>
            
            <div class="form-group">
                <label for="role-select">Select New Role:</label>
                <select id="role-select" class="form-control">
                    <option value="ADMIN">Administrator</option>
                    <option value="STAFF">General Staff</option>
                    <option value="GUIDE">Safari Guide</option>
                    <option value="IT_SUPPORT">IT Support</option>
                    <option value="IT_ASSISTANT">IT Assistant</option>
                    <option value="CAPTAIN">Boat Captain</option>
                    <option value="CUSTOMER">Customer</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-primary" onclick="assignRole(${userId})">Assign Role</button>
                <button class="btn btn-secondary" onclick="closeModal('roleAssignmentModal')">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    }
}

// Function to assign role to user
function assignRole(staffId) {
    const roleSelect = document.getElementById('role-select');
    const selectedRole = roleSelect.value; // Use value instead of text

    console.log(`Assigning role ${selectedRole} to user ID: ${staffId}`);

    // Send role assignment request to server
    fetch(`/api/admin/users/${staffId}/role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            role: selectedRole
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Failed to assign role');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Role successfully updated');
        closeModal('roleAssignmentModal');
        // Reload users to reflect changes
        loadStaffMembers();
    })
    .catch(error => {
        console.error('Error assigning role:', error);
        alert('Failed to assign role. Please try again. ' + error.message);
    });
}

// Initialize staff management page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the staff management page
    if (document.getElementById('staff-management-tbody')) {
        loadStaffMembers();

        // Add event listener for add staff form submission
        const addStaffForm = document.getElementById('add-staff-form');
        if (addStaffForm) {
            addStaffForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addStaffMember();
            });
        }

        // Add event listener for edit staff form submission
        const editStaffForm = document.getElementById('edit-staff-form');
        if (editStaffForm) {
            editStaffForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveEditedStaff();
            });
        }
    }
});

// Function to open add staff modal
function openAddStaffModal() {
    const modal = document.getElementById('add-staff-modal');
    if (modal) {
        // Set default hire date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('staff-hire-date').value = today;

        modal.style.display = 'block';
    }
}

// Function to add a new staff member
function addStaffMember() {
    const firstName = document.getElementById('staff-first-name').value;
    const lastName = document.getElementById('staff-last-name').value;
    const email = document.getElementById('staff-email').value;
    const password = document.getElementById('staff-password').value;
    const role = document.getElementById('staff-role').value;
    const certification = document.getElementById('staff-experience').value;
    const contactNo = document.getElementById('staff-contact').value;
    const address = document.getElementById('staff-address').value;
    const city = document.getElementById('staff-city').value;
    const street = document.getElementById('staff-street').value;
    const postalCode = document.getElementById('staff-postal-code').value;
    const hireDate = document.getElementById('staff-hire-date').value || new Date().toISOString().split('T')[0];

    const staffData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: role,
        certification: certification,
        contactNo: contactNo,
        address: address,
        city: city,
        street: street,
        postalCode: postalCode,
        hireDate: hireDate
    };

    fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(staffData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Failed to add staff member');
            });
        }
        return response.json();
    })
    .then(data => {
        // First reset the form (if it exists)
        const form = document.getElementById('add-staff-form');
        if (form) {
            form.reset();
        }

        // Then close the modal
        alert('Staff member successfully added');
        closeModal('add-staff-modal');

        // Reload staff members to reflect changes
        loadStaffMembers();
    })
    .catch(error => {
        console.error('Error adding staff member:', error);
        alert('Failed to add staff member. Please try again. ' + error.message);
    });
}

// Function to save edited staff information
function saveEditedStaff() {
    const staffId = document.getElementById('edit-staff-id').value;
    const firstName = document.getElementById('edit-staff-first-name').value;
    const lastName = document.getElementById('edit-staff-last-name').value;
    const email = document.getElementById('edit-staff-email').value;
    const password = document.getElementById('edit-staff-password').value;
    const role = document.getElementById('edit-staff-role').value;
    const contactNo = document.getElementById('edit-staff-contact').value;
    const address = document.getElementById('edit-staff-address').value;
    const city = document.getElementById('edit-staff-city').value;
    const street = document.getElementById('edit-staff-street').value;
    const postalCode = document.getElementById('edit-staff-postal-code').value;
    const hireDate = document.getElementById('edit-staff-hire-date').value;

    // Try to get experience/certification field value, checking both possible field IDs
    let certification = '';
    const experienceField = document.getElementById('edit-staff-experience');
    const certificationField = document.getElementById('edit-staff-certification');
    if (experienceField) {
        certification = experienceField.value;
    } else if (certificationField) {
        certification = certificationField.value;
    }

    // Properly format the data with correct field names to match backend API expectations
    const staffData = {
        firstName: firstName,
        secondName: lastName,
        email: email,
        contactNo: contactNo,
        roleType: role,  // Use roleType instead of role to match the backend field
        certification: certification,
        // Ensure address fields are correctly named and structured
        address: address,  // This should be the actual address field
        city: city,        // This should be the city field
        street: street,    // This should be the street field
        postalCode: postalCode,
        hireDate: hireDate
    };

    // Only include password if provided
    if (password && password.trim() !== '') {
        staffData.password = password;
    }

    console.log('Updating staff member with ID:', staffId);
    console.log('Staff data:', staffData);

    // Show a loading indicator
    const button = document.querySelector('#edit-staff-form button[type="submit"]');
    const originalButtonText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    button.disabled = true;

    fetch(`/api/admin/users/${staffId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(staffData)
    })
    .then(response => {
        if (!response.ok) {
            if (response.headers.get("content-type")?.includes("application/json")) {
                return response.json().then(err => {
                    throw new Error(err.message || err.error || 'Failed to update staff member');
                });
            } else {
                return response.text().then(text => {
                    throw new Error(text || 'Failed to update staff member');
                });
            }
        }
        return response.json();
    })
    .then(data => {
        alert('Staff member successfully updated');
        // Reset button state
        button.innerHTML = originalButtonText;
        button.disabled = false;
        // Close the modal
        const modal = document.getElementById('edit-staff-modal');
        if (modal) modal.style.display = 'none';
        // Reload staff members to reflect changes
        loadStaffMembers();
    })
    .catch(error => {
        console.error('Error updating staff member:', error);
        alert('Failed to update staff member. Please try again. ' + error.message);
        // Reset button state
        button.innerHTML = originalButtonText;
        button.disabled = false;
    });
}

// Function to show delete staff modal
function showDeleteStaffModal(staffId) {
    const staff = allUsers.find(s => s.id === staffId || s.userId === staffId);
    if (!staff) return;

    // Create modal content
    const modalHTML = `
        <div id="delete-staff-modal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('delete-staff-modal').remove()">&times;</span>
                <h2>Delete Staff Member</h2>
                <p>Are you sure you want to delete the following staff member?</p>
                <div style="margin-top: 10px;">
                    <strong>${staff.firstName} ${staff.secondName}</strong><br>
                    <span>${staff.email}</span>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button class="btn btn-danger" onclick="confirmDeleteStaff(${staff.id || staff.userId})">Delete</button>
                    <button class="btn btn-secondary" onclick="closeModal('delete-staff-modal')">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to the body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
}

// Function to confirm staff deletion
function confirmDeleteStaff(staffId) {
    fetch(`/api/admin/users/${staffId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Failed to delete staff member');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Staff member successfully deleted');
        closeModal('delete-staff-modal');
        // Reload staff members to reflect changes
        loadStaffMembers();
    })
    .catch(error => {
        console.error('Error deleting staff member:', error);
        alert('Failed to delete staff member. Please try again. ' + error.message);
    });
}
