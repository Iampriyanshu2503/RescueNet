const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing backend connectivity...');
    
    // Test health check
    const healthResponse = await axios.get('http://localhost:5000/api');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test registration endpoint
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'donor'
    };
    
    console.log('🧪 Testing registration with:', testUser);
    
    const registrationResponse = await axios.post('http://localhost:5000/api/users', testUser);
    console.log('✅ Registration successful:', registrationResponse.data);
    
    // Test login
    console.log('🧪 Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testRegistration();
