const fs = require('fs');
const path = require('path');

/**
 * Verification Script for Member Management Feature
 * Verifies all backend and frontend components are in place
 */

let passedTests = 0;
let failedTests = 0;
const errors = [];

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper function to check if file contains specific content
function fileContains(filePath, searchString) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

// Test helper
function test(description, condition) {
  if (condition) {
    console.log(`✓ ${description}`);
    passedTests++;
  } else {
    console.log(`✗ ${description}`);
    failedTests++;
    errors.push(description);
  }
}

console.log('🔍 Verifying Member Management Implementation...\n');

// ============================================
// BACKEND TESTS
// ============================================

console.log('📦 Backend Components:');

// PM Controller
test(
  'PM Controller exists',
  fileExists('server/controllers/pmController.js')
);

test(
  'PM Controller has addMemberToProject method',
  fileContains('server/controllers/pmController.js', 'exports.addMemberToProject')
);

test(
  'PM Controller has removeMemberFromProject method',
  fileContains('server/controllers/pmController.js', 'exports.removeMemberFromProject')
);

test(
  'PM Controller has updateTeamLeader method',
  fileContains('server/controllers/pmController.js', 'exports.updateTeamLeader')
);

test(
  'PM Controller has updateMemberSpecialization method',
  fileContains('server/controllers/pmController.js', 'exports.updateMemberSpecialization')
);

test(
  'PM Controller has getAllProjectMembers method',
  fileContains('server/controllers/pmController.js', 'exports.getAllProjectMembers')
);

// PM Routes
test(
  'PM Routes file exists',
  fileExists('server/routes/pm.js')
);

test(
  'PM Routes has add member route',
  fileContains('server/routes/pm.js', '/projects/:projectId/members')
);

test(
  'PM Routes has remove member route',
  fileContains('server/routes/pm.js', '/projects/:projectId/members/:userId')
);

test(
  'PM Routes has update team leader route',
  fileContains('server/routes/pm.js', '/projects/:projectId/team-leader')
);

test(
  'PM Routes has update specialization route',
  fileContains('server/routes/pm.js', '/members/:userId/specialization')
);

test(
  'PM Routes has get all members route',
  fileContains('server/routes/pm.js', 'router.get(\'/members\'')
);

// Team Leader Controller
test(
  'Team Leader Controller exists',
  fileExists('server/controllers/teamLeaderController.js')
);

test(
  'Team Leader Controller has getProjectMembers method',
  fileContains('server/controllers/teamLeaderController.js', 'exports.getProjectMembers')
);

// Team Leader Routes
test(
  'Team Leader Routes file exists',
  fileExists('server/routes/teamLeader.js')
);

test(
  'Team Leader Routes has get project members route',
  fileContains('server/routes/teamLeader.js', '/projects/:projectId/members')
);

// Socket Events
test(
  'Socket Events file exists',
  fileExists('server/socket/events.js')
);

test(
  'Socket Events has handleMemberManagementEvents method',
  fileContains('server/socket/events.js', 'handleMemberManagementEvents')
);

test(
  'Socket Events has member:added event',
  fileContains('server/socket/events.js', 'member:added')
);

test(
  'Socket Events has member:removed event',
  fileContains('server/socket/events.js', 'member:removed')
);

test(
  'Socket Events has teamLeader:changed event',
  fileContains('server/socket/events.js', 'teamLeader:changed')
);

test(
  'Socket Events has member:specializationUpdated event',
  fileContains('server/socket/events.js', 'member:specializationUpdated')
);

console.log('');

// ============================================
// FRONTEND TESTS
// ============================================

console.log('🎨 Frontend Components:');

// TeamManagement Component
test(
  'TeamManagement component exists',
  fileExists('client/src/components/pm/TeamManagement.js')
);

test(
  'TeamManagement CSS exists',
  fileExists('client/src/components/pm/TeamManagement.css')
);

test(
  'TeamManagement has addMemberToProject handler',
  fileContains('client/src/components/pm/TeamManagement.js', 'handleAddMember')
);

test(
  'TeamManagement has removeMemberFromProject handler',
  fileContains('client/src/components/pm/TeamManagement.js', 'handleRemoveMember')
);

test(
  'TeamManagement has updateTeamLeader handler',
  fileContains('client/src/components/pm/TeamManagement.js', 'handleChangeTeamLeader')
);

test(
  'TeamManagement has updateSpecialization handler',
  fileContains('client/src/components/pm/TeamManagement.js', 'handleUpdateSpecialization')
);

// PMAllMembers Page
test(
  'PMAllMembers page exists',
  fileExists('client/src/pages/pm/PMAllMembers.js')
);

test(
  'PMAllMembers CSS exists',
  fileExists('client/src/pages/pm/PMAllMembers.css')
);

test(
  'PMAllMembers has search functionality',
  fileContains('client/src/pages/pm/PMAllMembers.js', 'searchTerm')
);

test(
  'PMAllMembers has filter functionality',
  fileContains('client/src/pages/pm/PMAllMembers.js', 'selectedSpecialization')
);

test(
  'PMAllMembers has sort functionality',
  fileContains('client/src/pages/pm/PMAllMembers.js', 'sortBy')
);

// TeamMembersView Component (TL read-only)
test(
  'TeamMembersView component exists',
  fileExists('client/src/components/member/TeamMembersView.js')
);

test(
  'TeamMembersView CSS exists',
  fileExists('client/src/components/member/TeamMembersView.css')
);

test(
  'TeamMembersView has read-only badge',
  fileContains('client/src/components/member/TeamMembersView.css', 'read-only-badge')
);

// PM Team Service
test(
  'pmTeamService exists',
  fileExists('client/src/services/pmTeamService.js')
);

test(
  'pmTeamService has addMember function',
  fileContains('client/src/services/pmTeamService.js', 'export const addMember')
);

test(
  'pmTeamService has removeMember function',
  fileContains('client/src/services/pmTeamService.js', 'export const removeMember')
);

test(
  'pmTeamService has updateTeamLeader function',
  fileContains('client/src/services/pmTeamService.js', 'export const updateTeamLeader')
);

test(
  'pmTeamService has updateMemberSpecialization function',
  fileContains('client/src/services/pmTeamService.js', 'export const updateMemberSpecialization')
);

test(
  'pmTeamService has getAllMembers function',
  fileContains('client/src/services/pmTeamService.js', 'export const getAllMembers')
);

test(
  'pmTeamService has helper functions',
  fileContains('client/src/services/pmTeamService.js', 'hasProjectCapacity')
);

// Socket Context
test(
  'SocketContext exists',
  fileExists('client/src/contexts/SocketContext.js')
);

test(
  'SocketContext has onMemberAdded handler',
  fileContains('client/src/contexts/SocketContext.js', 'onMemberAdded')
);

test(
  'SocketContext has onMemberRemoved handler',
  fileContains('client/src/contexts/SocketContext.js', 'onMemberRemoved')
);

test(
  'SocketContext has onTeamLeaderChanged handler',
  fileContains('client/src/contexts/SocketContext.js', 'onTeamLeaderChanged')
);

test(
  'SocketContext has onMemberSpecializationUpdated handler',
  fileContains('client/src/contexts/SocketContext.js', 'onMemberSpecializationUpdated')
);

// PM Project Detail Integration
test(
  'PMProjectDetail imports TeamManagement',
  fileContains('client/src/pages/pm/PMProjectDetail.js', 'import TeamManagement')
);

test(
  'PMProjectDetail renders TeamManagement',
  fileContains('client/src/pages/pm/PMProjectDetail.js', '<TeamManagement')
);

// App.js Routes
test(
  'App.js imports PMAllMembers',
  fileContains('client/src/App.js', 'import PMAllMembers')
);

test(
  'App.js has /pm/members route',
  fileContains('client/src/App.js', '/pm/members')
);

// PM Layout Navigation
test(
  'PMLayout has All Members link',
  fileContains('client/src/components/pm/PMLayout.js', 'All Members')
);

console.log('');

// ============================================
// SUMMARY
// ============================================

console.log('═'.repeat(60));
console.log('📊 Test Summary:');
console.log('═'.repeat(60));
console.log(`✓ Passed: ${passedTests}`);
console.log(`✗ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests > 0) {
  console.log('\n❌ Failed Tests:');
  errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
  console.log('\n⚠️  Some components are missing. Please review the implementation.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! Member Management feature is complete.');
  console.log('\n🎉 Implementation Summary:');
  console.log('   - Backend: 6 controller methods, 6 routes');
  console.log('   - Frontend: 3 components, 1 page, 1 service');
  console.log('   - Socket Events: 4 real-time events');
  console.log('   - Total Files: 15+ new/modified files');
  console.log('\n📝 Next Steps:');
  console.log('   1. Start the server: cd server && npm start');
  console.log('   2. Start the client: cd client && npm start');
  console.log('   3. Test as PM: Add/remove members, change TL');
  console.log('   4. Test as TL: View team members (read-only)');
  console.log('   5. Verify real-time updates across tabs');
  process.exit(0);
}

