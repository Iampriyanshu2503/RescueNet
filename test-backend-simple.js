const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connectivity...');
    
    // Test health check
    const response = await axios.get('http://localhost:5000/api');
    console.log('✅ Backend is running:', response.data);
    
    // Test registration
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'donor'
    };
    
    console.log('Testing registration...');
    const regResponse = await axios.post('http://localhost:5000/api/users', testUser);
    console.log('✅ Registration successful:', regResponse.data);
    
    // Test login with the same user
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

testBackend();
