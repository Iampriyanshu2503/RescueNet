const axios = require('axios');

async function testFrontendLogin() {
  try {
    console.log('🧪 Testing frontend login flow...');
    
    // First, check if backend is running
    console.log('1. Checking backend connectivity...');
    const healthResponse = await axios.get('http://localhost:5000/api');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test registration first
    console.log('2. Testing user registration...');
    const testUser = {
      name: 'Frontend Test User',
      email: `frontend-test-${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'donor'
    };
    
    const regResponse = await axios.post('http://localhost:5000/api/users', testUser);
    console.log('✅ Registration successful:', {
      user: regResponse.data.user.email,
      role: regResponse.data.user.role,
      hasToken: !!regResponse.data.token
    });
    
    // Test login with the registered user
    console.log('3. Testing login with registered user...');
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful:', {
      user: loginResponse.data.user.email,
      role: loginResponse.data.user.role,
      hasToken: !!loginResponse.data.token
    });
    
    // Test login with wrong password
    console.log('4. Testing login with wrong password...');
    try {
      await axios.post('http://localhost:5000/api/users/login', {
        email: testUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed with wrong password');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login correctly failed with wrong password');
      } else {
        console.log('❌ Unexpected error with wrong password:', error.message);
      }
    }
    
    // Test login with non-existent user
    console.log('5. Testing login with non-existent user...');
    try {
      await axios.post('http://localhost:5000/api/users/login', {
        email: 'nonexistent@example.com',
        password: 'testpassword123'
      });
      console.log('❌ Login should have failed with non-existent user');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login correctly failed with non-existent user');
      } else {
        console.log('❌ Unexpected error with non-existent user:', error.message);
      }
    }
    
    console.log('🎉 All login tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

testFrontendLogin();
