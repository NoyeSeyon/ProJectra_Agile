/**
 * Admin Workflow Test Script
 * Tests the complete Admin → PM assignment workflow
 * 
 * Prerequisites:
 * 1. Server must be running on port 5001
 * 2. MongoDB must be connected
 * 3. You must have:
 *    - An admin user account
 *    - At least one member user in the same organization
 * 
 * Usage: node tests/test-admin-workflow.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Configuration - Update these values
const CONFIG = {
  adminEmail: 'admin@example.com',
  adminPassword: 'password123',
  testMemberEmail: 'member@example.com', // A member user in your org
  newUserEmail: 'testuser@example.com'
};

let adminToken = '';
let testUserId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function section(message) {
  log(`\n${'='.repeat(60)}`, colors.yellow);
  log(message, colors.yellow);
  log('='.repeat(60), colors.yellow);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Admin Login
async function testAdminLogin() {
  section('Test 1: Admin Login');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: CONFIG.adminEmail,
      password: CONFIG.adminPassword
    });

    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      success('Admin logged in successfully');
      info(`Admin: ${response.data.user.firstName} ${response.data.user.lastName}`);
      info(`Role: ${response.data.user.role}`);
      info(`Organization: ${response.data.user.organization}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Login failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 2: Get Organization Users
async function testGetUsers() {
  section('Test 2: Get Organization Users');
  try {
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      success(`Found ${response.data.count} users in organization`);
      
      // Find a member to promote
      const member = response.data.data.find(u => u.role === 'member');
      if (member) {
        testUserId = member._id;
        info(`Test user found: ${member.firstName} ${member.lastName} (${member.email})`);
        info(`User ID: ${testUserId}`);
      } else {
        error('No member users found to test with');
      }
      return true;
    }
    return false;
  } catch (err) {
    error(`Get users failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 3: Assign User as PM
async function testAssignPM() {
  section('Test 3: Assign User as Project Manager');
  
  if (!testUserId) {
    error('No test user available. Skipping test.');
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/admin/assign-pm`,
      {
        userId: testUserId,
        maxProjects: 10
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      success('User assigned as PM successfully');
      info(`New role: ${response.data.data.role}`);
      info(`Max projects: ${response.data.data.capacity.maxProjects}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Assign PM failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 4: Get All PMs
async function testGetPMs() {
  section('Test 4: Get All Project Managers');
  try {
    const response = await axios.get(`${BASE_URL}/admin/pms`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      success(`Found ${response.data.count} Project Manager(s)`);
      
      response.data.data.forEach((pm, index) => {
        info(`\nPM ${index + 1}:`);
        info(`  Name: ${pm.firstName} ${pm.lastName}`);
        info(`  Email: ${pm.email}`);
        info(`  Total Projects: ${pm.projectsCount}`);
        info(`  Active Projects: ${pm.activeProjectsCount}`);
        info(`  Max Projects: ${pm.capacity.maxProjects}`);
        info(`  Capacity Usage: ${pm.capacityUsage.toFixed(2)}%`);
      });
      return true;
    }
    return false;
  } catch (err) {
    error(`Get PMs failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 5: Update PM Capacity
async function testUpdatePMCapacity() {
  section('Test 5: Update PM Capacity');
  
  if (!testUserId) {
    error('No test user available. Skipping test.');
    return false;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/admin/pm/${testUserId}/capacity`,
      {
        maxProjects: 15
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      success('PM capacity updated successfully');
      info(`New max projects: ${response.data.data.capacity.maxProjects}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Update capacity failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 6: Get PM's Projects
async function testGetPMProjects() {
  section('Test 6: Get PM\'s Projects');
  
  if (!testUserId) {
    error('No test user available. Skipping test.');
    return false;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/admin/pm/${testUserId}/projects`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      success(`PM has ${response.data.count} project(s)`);
      
      if (response.data.count > 0) {
        response.data.data.forEach((project, index) => {
          info(`\nProject ${index + 1}:`);
          info(`  Name: ${project.name}`);
          info(`  Status: ${project.status}`);
        });
      }
      return true;
    }
    return false;
  } catch (err) {
    error(`Get PM projects failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 7: Get Organization Analytics
async function testGetAnalytics() {
  section('Test 7: Get Organization Analytics');
  try {
    const response = await axios.get(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      success('Analytics retrieved successfully');
      const { users, projects, recentUsers } = response.data.data;
      
      info('\nUser Statistics:');
      info(`  Total Users: ${users.total}`);
      info(`  Project Managers: ${users.projectManagers}`);
      info(`  Members: ${users.members}`);
      
      info('\nProject Statistics:');
      info(`  Total Projects: ${projects.total}`);
      info(`  Active Projects: ${projects.active}`);
      info(`  Completed Projects: ${projects.completed}`);
      
      info(`\nRecent Users: ${recentUsers.length}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Get analytics failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 8: Change User Role
async function testChangeUserRole() {
  section('Test 8: Change User Role');
  
  if (!testUserId) {
    error('No test user available. Skipping test.');
    return false;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/admin/users/${testUserId}/role`,
      {
        role: 'team_leader'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      success('User role changed successfully');
      info(`New role: ${response.data.data.role}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Change role failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 9: Unassign PM (cleanup)
async function testUnassignPM() {
  section('Test 9: Remove PM Role (Cleanup)');
  
  if (!testUserId) {
    error('No test user available. Skipping test.');
    return false;
  }

  // First change role back to PM to test unassign
  try {
    await axios.put(
      `${BASE_URL}/admin/users/${testUserId}/role`,
      { role: 'project_manager' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    info('Changed role back to PM for testing');
  } catch (err) {
    // Continue anyway
  }

  await delay(1000);

  try {
    const response = await axios.delete(
      `${BASE_URL}/admin/unassign-pm/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      success('PM role removed successfully');
      info(`New role: ${response.data.data.role}`);
      return true;
    }
    return false;
  } catch (err) {
    error(`Unassign PM failed: ${err.response?.data?.message || err.message}`);
    info('Note: If user has active projects, this is expected to fail');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.blue);
  log('║          Admin API Workflow Test Suite                    ║', colors.blue);
  log('╚════════════════════════════════════════════════════════════╝\n', colors.blue);

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Get Organization Users', fn: testGetUsers },
    { name: 'Assign PM', fn: testAssignPM },
    { name: 'Get All PMs', fn: testGetPMs },
    { name: 'Update PM Capacity', fn: testUpdatePMCapacity },
    { name: 'Get PM Projects', fn: testGetPMProjects },
    { name: 'Get Analytics', fn: testGetAnalytics },
    { name: 'Change User Role', fn: testChangeUserRole },
    { name: 'Unassign PM', fn: testUnassignPM }
  ];

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
      await delay(500); // Brief delay between tests
    } catch (err) {
      error(`Test crashed: ${err.message}`);
      results.failed++;
    }
  }

  // Summary
  section('Test Summary');
  log(`Total Tests: ${tests.length}`, colors.cyan);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, colors.red);
  
  const successRate = ((results.passed / tests.length) * 100).toFixed(2);
  log(`\nSuccess Rate: ${successRate}%`, colors.yellow);

  if (results.failed === 0) {
    log('\n🎉 All tests passed!', colors.green);
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed. Please review the errors above.`, colors.red);
  }

  log('\n' + '='.repeat(60) + '\n', colors.yellow);
}

// Run tests
runTests().catch(err => {
  error(`Test suite crashed: ${err.message}`);
  console.error(err);
  process.exit(1);
});

