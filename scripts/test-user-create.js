// Generate random user data
function generateRandomUser() {
    const randomId = Math.random().toString(36).substring(7);
    return {
        name: `Test User ${randomId}`,
        email: `test.${randomId}@example.com`,
        password: `password${randomId}`,
        role: 'User',
        is_active: true,
        auth_type: 'local',
        avatar: null,
        voting_rights: true
    };
}

// Test user creation
async function testUserCreation() {
    const testUser = generateRandomUser();
    console.log('\nAttempting to create user with data:', testUser);
    
    try {
        const response = await fetch('http://localhost:3000/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const result = await response.json();
        console.log('\nResponse:', {
            status: response.status,
            data: result
        });
        
    } catch (error) {
        console.error('\nError creating user:', error);
    }
}

// Run the test
console.log('Make sure your Next.js server is running on http://localhost:3000');
console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(testUserCreation, 3000);
