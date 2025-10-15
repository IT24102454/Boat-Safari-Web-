// Test authentication and CRUD operations
async function testAuth() {
    try {
        // Test login
        console.log('Testing login...');
        const loginResponse = await fetch('http://localhost:9091/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@gmail.com',
                password: 'adminadmin'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Login failed: ' + loginResponse.status);
        }
        
        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData);
        
        const token = loginData.token;
        
        // Test boat retrieval
        console.log('\nTesting boat retrieval...');
        const boatsResponse = await fetch('http://localhost:9091/api/admin/boats', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!boatsResponse.ok) {
            throw new Error('Boat retrieval failed: ' + boatsResponse.status);
        }
        
        const boats = await boatsResponse.json();
        console.log('Boats retrieved:', boats.length, 'boats found');
        
        // Test boat creation
        console.log('\nTesting boat creation...');
        const newBoat = {
            name: 'Test Boat',
            model: 'Test Model',
            type: 'Standard',
            capacity: 10,
            registrationNumber: 'TEST123',
            status: 'Available',
            features: 'GPS, Radio',
            description: 'Test boat for CRUD testing'
        };
        
        const createResponse = await fetch('http://localhost:9091/api/admin/boats', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBoat)
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error('Boat creation failed: ' + createResponse.status + ' - ' + errorText);
        }
        
        const createdBoat = await createResponse.json();
        console.log('Boat created successfully:', createdBoat);
        
        // Test boat update
        console.log('\nTesting boat update...');
        const updatedBoat = {
            ...createdBoat,
            name: 'Updated Test Boat',
            description: 'Updated description'
        };
        
        const updateResponse = await fetch(`http://localhost:9091/api/admin/boats/${createdBoat.boatId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBoat)
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error('Boat update failed: ' + updateResponse.status + ' - ' + errorText);
        }
        
        const updated = await updateResponse.json();
        console.log('Boat updated successfully:', updated);
        
        // Test boat deletion
        console.log('\nTesting boat deletion...');
        const deleteResponse = await fetch(`http://localhost:9091/api/admin/boats/${createdBoat.boatId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error('Boat deletion failed: ' + deleteResponse.status + ' - ' + errorText);
        }
        
        console.log('Boat deleted successfully');
        
        console.log('\n✅ All CRUD operations working correctly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    }
}

// Run the test
testAuth();