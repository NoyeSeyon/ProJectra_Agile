/**
 * Phase 12: Agile Sprint Management - Verification Script
 * Checks all sprint management files and configurations
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
  cyan: '\x1b[36m'
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
  log('\n=================================', 'cyan');
  log('Phase 12: Sprint Management Tests', 'cyan');
  log('=================================\n', 'cyan');

  // Backend Files (Existing - Verification)
  log('📦 Backend Files (Verification):', 'blue');
  checkFile('server/models/Sprint.js', 'Sprint Model');
  checkFile('server/controllers/sprintController.js', 'Sprint Controller');
  checkFile('server/routes/sprints.js', 'Sprint Routes');

  log('\n📦 Frontend Service:', 'blue');
  checkFile('client/src/services/sprintService.js', 'Sprint Service');

  log('\n📦 Sprint List Page:', 'blue');
  checkFile('client/src/pages/pm/PMSprints.js', 'Sprint List Component');
  checkFile('client/src/pages/pm/PMSprints.css', 'Sprint List Styles');

  log('\n📦 Sprint Detail Page:', 'blue');
  checkFile('client/src/pages/pm/PMSprintDetail.js', 'Sprint Detail Component');
  checkFile('client/src/pages/pm/PMSprintDetail.css', 'Sprint Detail Styles');

  log('\n📦 Burndown Chart:', 'blue');
  checkFile('client/src/components/sprint/BurndownChart.js', 'Burndown Chart Component');
  checkFile('client/src/components/sprint/BurndownChart.css', 'Burndown Chart Styles');

  // Service Functions
  log('\n🔧 Sprint Service Functions:', 'blue');
  checkFileContent(
    'client/src/services/sprintService.js',
    ['createSprint', 'getProjectSprints', 'getSprint', 'startSprint', 'completeSprint', 'getSprintBurndown', 'addTasksToSprint'],
    'All sprint service functions present'
  );

  // Sprint List Features
  log('\n🎨 Sprint List Features:', 'blue');
  checkFileContent(
    'client/src/pages/pm/PMSprints.js',
    ['CreateSprintModal', 'SprintCard', 'filter', 'activeSprint', 'plannedSprints', 'completedSprints'],
    'Sprint list components and filters'
  );

  checkFileContent(
    'client/src/pages/pm/PMSprints.js',
    ['handleStartSprint', 'handleCompleteSprint', 'loadSprints'],
    'Sprint list handlers'
  );

  // Sprint Detail Features
  log('\n🎨 Sprint Detail Features:', 'blue');
  checkFileContent(
    'client/src/pages/pm/PMSprintDetail.js',
    ['BurndownChart', 'TaskCard', 'AddTasksModal', 'RetrospectiveModal'],
    'Sprint detail components'
  );

  checkFileContent(
    'client/src/pages/pm/PMSprintDetail.js',
    ['sprint-stats-grid', 'getDaysRemaining', 'calculateSprintProgress', 'getSprintStatus'],
    'Sprint detail stats and utilities'
  );

  // Burndown Chart Features
  log('\n📊 Burndown Chart Features:', 'blue');
  checkFileContent(
    'client/src/components/sprint/BurndownChart.js',
    ['ReactApexChart', 'remainingStoryPoints', 'idealRemaining', 'burndownData'],
    'Burndown chart data and visualization'
  );

  // Routes
  log('\n🛣️  Route Configuration:', 'blue');
  checkFileContent(
    'client/src/App.js',
    ['PMSprints', 'PMSprintDetail', '/pm/sprints/:projectId', '/pm/sprint/:sprintId'],
    'Sprint routes in App.js'
  );

  // Project Detail Integration
  log('\n🔗 Project Detail Integration:', 'blue');
  checkFileContent(
    'client/src/pages/pm/PMProjectDetail.js',
    ['Target', 'Sprints', '/pm/sprints/${projectId}'],
    'Sprint button in project detail'
  );

  checkFileContent(
    'client/src/pages/pm/PMProjectDetail.css',
    ['btn-primary-sprint', 'background: #3b82f6'],
    'Sprint button styling'
  );

  // Backend Routes
  log('\n🌐 Backend Sprint Routes:', 'blue');
  checkFileContent(
    'server/routes/sprints.js',
    ['createSprint', 'getProjectSprints', 'getSprint', 'updateSprint', 'startSprint', 'completeSprint', 'getSprintBurndown', 'addTasksToSprint'],
    'All sprint controller functions used in routes'
  );

  // Backend Controller
  log('\n🎮 Backend Sprint Controller:', 'blue');
  checkFileContent(
    'server/controllers/sprintController.js',
    ['exports.createSprint', 'exports.startSprint', 'exports.completeSprint', 'exports.getSprintBurndown'],
    'Sprint controller functions'
  );

  // Sprint Model
  log('\n📊 Sprint Model Schema:', 'blue');
  checkFileContent(
    'server/models/Sprint.js',
    ['plannedStoryPoints', 'completedStoryPoints', 'velocity', 'burndownData', 'retrospective'],
    'Sprint model fields'
  );

  checkFileContent(
    'server/models/Sprint.js',
    ['getSprintHealth', 'updateBurndown', 'daysRemaining'],
    'Sprint model methods'
  );

  // CSS Styling
  log('\n🎨 Sprint Styling:', 'blue');
  checkFileContent(
    'client/src/pages/pm/PMSprints.css',
    ['.sprint-card', '.sprint-status', '.progress-bar', '.modal-overlay'],
    'Sprint list CSS classes'
  );

  checkFileContent(
    'client/src/pages/pm/PMSprintDetail.css',
    ['.sprint-stats-grid', '.stat-card', '.task-card', '.retrospective-modal'],
    'Sprint detail CSS classes'
  );

  // Helper Functions
  log('\n🛠️  Helper Functions:', 'blue');
  checkFileContent(
    'client/src/services/sprintService.js',
    ['calculateSprintProgress', 'getSprintStatus', 'getDaysRemaining', 'getSprintDuration'],
    'Sprint utility functions'
  );

  // Documentation
  log('\n📚 Documentation:', 'blue');
  checkFile('PHASE12_AGILE_SPRINTS_COMPLETE.md', 'Phase 12 Documentation');

  // Summary
  log('\n=================================', 'cyan');
  log('Test Summary', 'cyan');
  log('=================================', 'cyan');
  log(`✓ Passed: ${passCount}`, 'green');
  log(`✗ Failed: ${failCount}`, 'red');
  log(`Total:    ${passCount + failCount}`, 'cyan');
  
  if (failCount === 0) {
    log('\n🎉 All tests passed! Phase 12 implementation is complete!', 'green');
    log('✅ Sprint Management system is ready for testing.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }
  
  log('');
  
  return failCount === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);

