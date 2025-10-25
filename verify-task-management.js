/**
 * Task Management CRUD System - Automated Verification Script
 * Verifies all files exist and have required functions/components
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
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

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    passCount++;
    log(`✅ ${filePath}`, 'green');
    return true;
  } else {
    failCount++;
    log(`❌ ${filePath} - NOT FOUND`, 'red');
    return false;
  }
}

function checkFileContains(filePath, searchStrings, description) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    failCount++;
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const missingStrings = [];
  
  searchStrings.forEach(str => {
    if (!content.includes(str)) {
      missingStrings.push(str);
    }
  });
  
  if (missingStrings.length === 0) {
    passCount++;
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    failCount++;
    log(`❌ ${description} - Missing: ${missingStrings.join(', ')}`, 'red');
    return false;
  }
}

// Start verification
log('\n🔍 Starting Task Management CRUD System Verification...\n', 'cyan');

// ====================================
// PHASE 1: Database Schema Updates
// ====================================
log('📦 Phase 1: Database Schema Updates', 'blue');

checkFileContains(
  'server/models/Project.js',
  ['allowTeamLeaderSubtasks'],
  'Project model has settings.allowTeamLeaderSubtasks'
);

checkFileContains(
  'server/models/Task.js',
  ['dependencies', 'blockedBy', 'blockingStatus'],
  'Task model has dependency fields'
);

// ====================================
// PHASE 2: Backend PM Task CRUD
// ====================================
log('\n📦 Phase 2: Backend PM Task CRUD', 'blue');

checkFileContains(
  'server/routes/pm.js',
  [
    'router.post(\'/projects/:projectId/tasks\'',
    'router.put(\'/tasks/:taskId\'',
    'router.delete(\'/tasks/:taskId\'',
    'router.put(\'/projects/:projectId/settings\'',
    'router.post(\'/tasks/:taskId/dependencies\'',
    'router.delete(\'/tasks/:taskId/dependencies/:dependencyId\''
  ],
  'PM routes have all task CRUD endpoints'
);

checkFileContains(
  'server/controllers/pmController.js',
  [
    'exports.createTask',
    'exports.updateTask',
    'exports.deleteTask',
    'exports.updateProjectSettings',
    'exports.addTaskDependency',
    'exports.removeTaskDependency'
  ],
  'PM controller has all task CRUD methods'
);

// ====================================
// PHASE 3: Team Leader Permission Check
// ====================================
log('\n📦 Phase 3: Team Leader Permission Check', 'blue');

checkFileContains(
  'server/controllers/teamLeaderController.js',
  ['allowTeamLeaderSubtasks', 'Subtask creation is disabled'],
  'Team Leader controller checks subtask permission'
);

// ====================================
// PHASE 4: PM Task Management Modal
// ====================================
log('\n📦 Phase 4: PM Task Management Modal', 'blue');

checkFileExists('client/src/components/pm/TaskManagementModal.js');
checkFileExists('client/src/components/pm/TaskManagementModal.css');

checkFileContains(
  'client/src/components/pm/TaskManagementModal.js',
  [
    'title',
    'description',
    'assignee',
    'priority',
    'storyPoints',
    'estimatedHours',
    'dependencies'
  ],
  'TaskManagementModal has all required fields'
);

// ====================================
// PHASE 5: PM Project Detail Updates
// ====================================
log('\n📦 Phase 5: PM Project Detail Updates', 'blue');

checkFileExists('client/src/components/pm/PMTaskList.js');
checkFileExists('client/src/components/pm/PMTaskList.css');

checkFileContains(
  'client/src/pages/pm/PMProjectDetail.js',
  [
    'TaskManagementModal',
    'PMTaskList',
    'handleCreateTask',
    'handleToggleSubtaskPermission',
    'allowTeamLeaderSubtasks'
  ],
  'PMProjectDetail integrates task management'
);

checkFileContains(
  'client/src/components/pm/PMTaskList.js',
  [
    'groupedTasks',
    'blockingStatus',
    'dependencies',
    'onEditTask',
    'onDeleteTask'
  ],
  'PMTaskList displays tasks with dependencies'
);

// ====================================
// PHASE 6: Member Tasks Updates
// ====================================
log('\n📦 Phase 6: Member Tasks Updates', 'blue');

checkFileContains(
  'client/src/pages/member/MemberTasks.js',
  [
    'blockingStatus',
    'dependencies',
    'getBlockingStatusIcon',
    'isTeamLeaderButDisabled',
    'ShieldOff'
  ],
  'MemberTasks shows blocking status and disabled message'
);

checkFileContains(
  'client/src/pages/member/MemberTasks.css',
  [
    '.task-item.blocked',
    '.task-item.waiting',
    '.blocking-badge',
    '.dependencies-section',
    '.disabled-message'
  ],
  'MemberTasks.css has blocking and dependency styles'
);

// ====================================
// PHASE 7: Task Services
// ====================================
log('\n📦 Phase 7: Task Services', 'blue');

checkFileExists('client/src/services/pmTaskService.js');

checkFileContains(
  'client/src/services/pmTaskService.js',
  [
    'createTask',
    'updateTask',
    'deleteTask',
    'updateProjectSettings',
    'addTaskDependency',
    'removeTaskDependency',
    'validateTaskData',
    'calculateBlockingStatus'
  ],
  'pmTaskService has all required functions'
);

checkFileContains(
  'client/src/services/teamLeaderService.js',
  [
    'canCreateSubtasks',
    'checkSubtaskPermission',
    'allowTeamLeaderSubtasks'
  ],
  'teamLeaderService has permission check helpers'
);

// ====================================
// PHASE 8: Socket Events
// ====================================
log('\n📦 Phase 8: Socket Events', 'blue');

checkFileContains(
  'server/socket/events.js',
  [
    'task:dependencyAdded',
    'task:dependencyRemoved',
    'project:settingsUpdated'
  ],
  'Socket events has dependency and settings events'
);

checkFileContains(
  'client/src/contexts/SocketContext.js',
  [
    'onTaskDependencyAdded',
    'onTaskDependencyRemoved',
    'onProjectSettingsUpdated'
  ],
  'SocketContext has all task event listeners'
);

checkFileContains(
  'server/controllers/pmController.js',
  [
    'io.to(`org:',
    'io.to(`project:',
    'project:settingsUpdated',
    'task:dependencyAdded',
    'task:dependencyRemoved'
  ],
  'PM controller emits socket events correctly'
);

// ====================================
// Additional Checks
// ====================================
log('\n📦 Additional Integration Checks', 'blue');

checkFileContains(
  'client/src/pages/pm/PMProjectDetail.css',
  [
    '.settings-section',
    '.toggle-switch',
    '.toggle-slider',
    '.btn-create-task'
  ],
  'PMProjectDetail.css has settings and task button styles'
);

checkFileContains(
  'server/models/Task.js',
  [
    'not_blocked',
    'waiting',
    'blocked'
  ],
  'Task model has blocking status enum values'
);

// ====================================
// Summary
// ====================================
log('\n' + '='.repeat(60), 'cyan');
log('📊 Verification Summary', 'cyan');
log('='.repeat(60), 'cyan');

const total = passCount + failCount;
const passPercentage = ((passCount / total) * 100).toFixed(1);

log(`\n✅ Passed: ${passCount}/${total} (${passPercentage}%)`, 'green');

if (failCount > 0) {
  log(`❌ Failed: ${failCount}/${total}`, 'red');
} else {
  log('🎉 All checks passed!', 'green');
}

log('\n' + '='.repeat(60) + '\n', 'cyan');

// Exit with appropriate code
process.exit(failCount > 0 ? 1 : 0);

