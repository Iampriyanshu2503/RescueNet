const { spawn } = require('child_process');
const axios = require('axios');

async function testBackendStart() {
  console.log('🚀 Starting backend server...');
  
  // Start the backend server
  const backend = spawn('node', ['index.js'], {
    cwd: './Test_HH305/backend1',
    stdio: 'pipe'
  });

  let serverStarted = false;
  let errorOutput = '';

  // Listen for output
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Backend output:', output);
    
    if (output.includes('Server running on port')) {
      serverStarted = true;
      console.log('✅ Backend server started successfully!');
    }
  });

  backend.stderr.on('data', (data) => {
    const error = data.toString();
    errorOutput += error;
    console.error('Backend error:', error);
  });

  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  if (serverStarted) {
    try {
      console.log('🧪 Testing backend connectivity...');
      
      // Test health check
      const response = await axios.get('http://localhost:5000/api');
      console.log('✅ Health check successful:', response.data);
      
      // Test registration
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'donor'
      };
      
      console.log('🧪 Testing registration...');
      const regResponse = await axios.post('http://localhost:5000/api/users', testUser);
      console.log('✅ Registration successful:', regResponse.data);
      
      // Test login
      console.log('🧪 Testing login...');
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
  } else {
    console.error('❌ Backend failed to start');
    console.error('Error output:', errorOutput);
  }

  // Kill the backend process
  backend.kill();
  console.log('🛑 Backend server stopped');
}

testBackendStart().catch(console.error);
