/**
 * Client Portal Testing Script
 * Automated verification of Phase 13 implementation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let passCount = 0;
let failCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    passCount++;
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    failCount++;
    log(`✗ ${description}`, 'red');
    log(`  Missing: ${filePath}`, 'yellow');
    return false;
  }
}

function checkFileContent(filePath, searchStrings, description) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    failCount++;
    log(`✗ ${description} - File not found`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const allFound = searchStrings.every(str => content.includes(str));
  
  if (allFound) {
    passCount++;
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    failCount++;
    log(`✗ ${description}`, 'red');
    const missing = searchStrings.filter(str => !content.includes(str));
    log(`  Missing: ${missing.join(', ')}`, 'yellow');
    return false;
  }
}

function runTests() {
  log('\n╔══════════════════════════════════════╗', 'cyan');
  log('║  Phase 13: Client Portal Testing    ║', 'cyan');
  log('╚══════════════════════════════════════╝\n', 'cyan');

  // Backend Files
  log('📦 Backend Files:', 'blue');
  checkFile('server/controllers/clientController.js', 'Client Controller');
  checkFile('server/routes/client.js', 'Client Routes');

  // Backend Controller Functions
  log('\n🎮 Backend Controller Functions:', 'blue');
  checkFileContent(
    'server/controllers/clientController.js',
    ['getClientDashboard', 'getClientProjects', 'getProjectProgress', 'getProjectTimeline', 'submitFeedback', 'getReports'],
    'All 6 controller functions present'
  );

  // Backend Routes
  log('\n🛣️  Backend Routes:', 'blue');
  checkFileContent(
    'server/routes/client.js',
    ['/dashboard', '/projects', '/project/:projectId/progress', '/project/:projectId/timeline', '/feedback', '/reports'],
    'All 6 routes defined'
  );

  checkFileContent(
    'server/routes/client.js',
    ['authenticate', 'isClient'],
    'Authentication and role check middleware'
  );

  // Server Integration
  log('\n🔌 Server Integration:', 'blue');
  checkFileContent(
    'server/index.js',
    ["app.use('/api/client'", "require('./routes/client')"],
    'Client routes registered in server'
  );

  // Project Model Updates
  log('\n📊 Project Model Updates:', 'blue');
  checkFileContent(
    'server/models/Project.js',
    ['milestones', 'clientVisibleFields', 'getClientView'],
    'Project model has client features'
  );

  checkFileContent(
    'server/models/Project.js',
    ["role === 'client'", 'this.client'],
    'canUserAccess includes client check'
  );

  // Frontend Service
  log('\n🔧 Frontend Service:', 'blue');
  checkFile('client/src/services/clientService.js', 'Client Service');

  checkFileContent(
    'client/src/services/clientService.js',
    ['getClientDashboard', 'getClientProjects', 'getProjectProgress', 'getProjectTimeline', 'submitFeedback', 'getReports'],
    'All service functions present'
  );

  checkFileContent(
    'client/src/services/clientService.js',
    ['formatProjectStatus', 'getDaysRemaining', 'formatBudget', 'getBudgetAlertLevel'],
    'Helper functions present'
  );

  // Frontend Components
  log('\n🎨 Frontend Components:', 'blue');
  checkFile('client/src/components/client/ClientLayout.js', 'Client Layout Component');
  checkFile('client/src/components/client/ClientLayout.css', 'Client Layout Styles');

  checkFileContent(
    'client/src/components/client/ClientLayout.js',
    ['Dashboard', 'My Projects', 'Reports', 'Communication', 'Documents'],
    'Navigation items present'
  );

  checkFileContent(
    'client/src/components/client/ClientLayout.css',
    ['.client-sidebar', '.client-layout', '.client-main', '.logout-btn'],
    'Core layout styles present'
  );

  // Dashboard Page
  log('\n📊 Dashboard Page:', 'blue');
  checkFile('client/src/pages/client/ClientDashboard.js', 'Client Dashboard Component');
  checkFile('client/src/pages/client/ClientDashboard.css', 'Client Dashboard Styles');

  checkFileContent(
    'client/src/pages/client/ClientDashboard.js',
    ['getClientDashboard', 'stats', 'projects', 'recentActivity', 'ProjectCard', 'ActivityItem'],
    'Dashboard features implemented'
  );

  checkFileContent(
    'client/src/pages/client/ClientDashboard.css',
    ['.welcome-section', '.stats-grid', '.project-card', '.activity-list'],
    'Dashboard styles present'
  );

  // Project Progress Page
  log('\n📈 Project Progress Page:', 'blue');
  checkFile('client/src/pages/client/ClientProjectProgress.js', 'Project Progress Component');
  checkFile('client/src/pages/client/ClientProjectProgress.css', 'Project Progress Styles');

  checkFileContent(
    'client/src/pages/client/ClientProjectProgress.js',
    ['getProjectProgress', 'taskStats', 'budgetStatus', 'milestones', 'timelineProgress'],
    'Progress page features implemented'
  );

  checkFileContent(
    'client/src/pages/client/ClientProjectProgress.css',
    ['.stats-overview', '.timeline-viz', '.budget-details', '.milestone-item'],
    'Progress page styles present'
  );

  // App.js Integration
  log('\n🔗 App.js Integration:', 'blue');
  checkFileContent(
    'client/src/App.js',
    ['ClientLayout', 'ClientDashboard', 'ClientProjectProgress'],
    'Client components imported'
  );

  checkFileContent(
    'client/src/App.js',
    ['ClientRoute', "/client/dashboard", "/client/projects", "/client/project/:projectId"],
    'Client routes configured'
  );

  checkFileContent(
    'client/src/App.js',
    ["user?.role === 'client'", "return <Navigate to=\"/client/dashboard\" />"],
    'Client login redirect configured'
  );

  // Color Theme
  log('\n🎨 Design & Styling:', 'blue');
  checkFileContent(
    'client/src/components/client/ClientLayout.css',
    ['#0f766e', '#0891b2', 'linear-gradient'],
    'Teal/cyan theme applied'
  );

  checkFileContent(
    'client/src/pages/client/ClientDashboard.css',
    ['.welcome-section', 'linear-gradient', '#0891b2'],
    'Dashboard gradient styling'
  );

  // Security Features
  log('\n🔒 Security Features:', 'blue');
  checkFileContent(
    'server/routes/client.js',
    ['authenticate', 'isClient', "role !== 'client'"],
    'Authentication and authorization middleware'
  );

  checkFileContent(
    'client/src/App.js',
    ["if (user?.role !== 'client')", "<Navigate to=\"/dashboard\" />"],
    'Frontend route protection'
  );

  // Responsive Design
  log('\n📱 Responsive Design:', 'blue');
  checkFileContent(
    'client/src/components/client/ClientLayout.css',
    ['@media (max-width: 768px)', '.sidebar-overlay', 'transform: translateX'],
    'Mobile responsive styles'
  );

  checkFileContent(
    'client/src/pages/client/ClientDashboard.css',
    ['@media (max-width: 768px)', '@media (max-width: 1024px)'],
    'Dashboard responsive breakpoints'
  );

  // Documentation
  log('\n📚 Documentation:', 'blue');
  checkFile('PHASE13_CLIENT_PORTAL_PROGRESS.md', 'Progress documentation');
  checkFile('PHASE13_CLIENT_PORTAL_COMPLETE.md', 'Completion documentation');

  // Summary
  log('\n╔══════════════════════════════════════╗', 'cyan');
  log('║         Test Summary                 ║', 'cyan');
  log('╚══════════════════════════════════════╝', 'cyan');
  log(`✓ Passed: ${passCount}`, 'green');
  log(`✗ Failed: ${failCount}`, 'red');
  log(`Total:    ${passCount + failCount}`, 'cyan');
  
  if (failCount === 0) {
    log('\n🎉 All automated tests passed!', 'green');
    log('✅ Client Portal implementation verified!', 'green');
    log('\n📋 Next Steps:', 'cyan');
    log('  1. Start the servers (backend & frontend)', 'white');
    log('  2. Create a user with client role', 'white');
    log('  3. Assign client to a project', 'white');
    log('  4. Login as client and test manually', 'white');
    log('\n📖 See MANUAL_CLIENT_TESTING.md for detailed test cases', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }
  
  log('');
  
  return failCount === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);

