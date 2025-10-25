const axios = require('axios');

const API_BASE = 'http://localhost:5001';

const testRegistration = async () => {
  try {
    console.log('🧪 Testing Registration...');
    
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      organizationName: 'Test Company'
    };

    console.log('📝 Registration data:', { ...testData, password: '***' });
    
    const response = await axios.post(`${API_BASE}/api/auth/register`, testData);
    
    console.log('✅ Registration successful!');
    console.log('👤 User:', response.data.data.user.email);
    console.log('🏢 Organization:', response.data.data.organization.name);
    console.log('🔑 Token:', response.data.data.token ? 'Generated' : 'Not generated');
    
    return {
      success: true,
      user: testData,
      token: response.data.data.token
    };
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    
    return { success: false, error: error.response?.data };
  }
};

const testLogin = async (email, password) => {
  try {
    console.log('\n🧪 Testing Login...');
    
    const loginData = { email, password };
    console.log('📝 Login data:', { ...loginData, password: '***' });
    
    const response = await axios.post(`${API_BASE}/api/auth/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('👤 User:', response.data.data.user.email);
    console.log('🔑 Token:', response.data.data.token ? 'Generated' : 'Not generated');
    
    return { success: true, token: response.data.data.token };
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    
    return { success: false, error: error.response?.data };
  }
};

const testMeEndpoint = async (token) => {
  try {
    console.log('\n🧪 Testing /me endpoint...');
    
    const response = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ /me endpoint working!');
    console.log('👤 User:', response.data.data.user.email);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ /me endpoint failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    
    return { success: false, error: error.response?.data };
  }
};

const runTests = async () => {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test registration
  const regResult = await testRegistration();
  
  if (regResult.success) {
    // Test login with registered user
    const loginResult = await testLogin(regResult.user.email, regResult.user.password);
    
    if (loginResult.success) {
      // Test /me endpoint
      await testMeEndpoint(loginResult.token);
    }
  }
  
  console.log('\n🏁 Tests completed!');
};

// Wait a moment for server to start, then run tests
setTimeout(runTests, 3000);
