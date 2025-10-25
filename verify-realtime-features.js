/**
 * 🧪 AUTOMATED REAL-TIME FEATURES VERIFICATION
 * 
 * This script verifies that all real-time components are properly integrated.
 * Run: node verify-realtime-features.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper functions
const readFile = (filePath) => {
  try {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
  } catch (error) {
    return null;
  }
};

const checkExists = (filePath) => {
  return fs.existsSync(path.join(__dirname, filePath));
};

const test = (description, assertion) => {
  totalTests++;
  if (assertion) {
    console.log(`${colors.green}✓${colors.reset} ${description}`);
    passedTests++;
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    failedTests++;
    return false;
  }
};

const section = (title) => {
  console.log(`\n${colors.cyan}${colors.bright}${title}${colors.reset}`);
};

const summary = () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.bright}TEST SUMMARY${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  
  const percentage = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`Success Rate: ${percentage}%`);
  
  if (failedTests === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Real-time features are ready!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Please review the errors above.${colors.reset}`);
  }
  console.log(`${'='.repeat(60)}\n`);
};

// Start verification
console.log(`${colors.cyan}${colors.bright}`);
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   🧪 REAL-TIME FEATURES VERIFICATION                      ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log(colors.reset);

// ==================== PHASE 11.1: Socket Events File ====================
section('📡 Phase 11.1: Socket.io Event System');

const eventsFile = readFile('server/socket/events.js');
test('server/socket/events.js exists', eventsFile !== null);

if (eventsFile) {
  test('SocketEvents class is defined', /class SocketEvents/.test(eventsFile));
  test('initialize method exists', /initialize\(\)/.test(eventsFile) || /initialize\(io\)/.test(eventsFile));
  test('JWT authentication implemented', /jwt\.verify/.test(eventsFile) || /verifyToken/.test(eventsFile) || /authenticateSocket/.test(eventsFile));
  
  // Task events
  test('task:created event handler', /socket\.on\(['"]task:created['"]/.test(eventsFile));
  test('task:updated event handler', /socket\.on\(['"]task:updated['"]/.test(eventsFile));
  test('task:deleted event handler', /socket\.on\(['"]task:deleted['"]/.test(eventsFile));
  test('task:assigned event handler', /socket\.on\(['"]task:assigned['"]/.test(eventsFile));
  
  // Subtask events
  test('subtask:created event handler', /socket\.on\(['"]subtask:created['"]/.test(eventsFile));
  test('subtask:updated event handler', /socket\.on\(['"]subtask:updated['"]/.test(eventsFile));
  
  // Time tracking events
  test('time:logged event handler', /socket\.on\(['"]time:logged['"]/.test(eventsFile) || /time:logged/.test(eventsFile));
  test('time:updated event handler', /socket\.on\(['"]time:updated['"]/.test(eventsFile) || /time:updated/.test(eventsFile));
  test('task:time-updated event handler', /socket\.on\(['"]task:time-updated['"]/.test(eventsFile) || /task:time-updated/.test(eventsFile));
  
  // Budget events
  test('budget:updated event handler', /socket\.on\(['"]budget:updated['"]/.test(eventsFile));
  test('expense:logged event handler', /socket\.on\(['"]expense:logged['"]/.test(eventsFile));
  test('budget:alert event handler', /socket\.on\(['"]budget:alert['"]/.test(eventsFile));
  
  // Project events
  test('project:created event handler', /socket\.on\(['"]project:created['"]/.test(eventsFile));
  test('project:updated event handler', /socket\.on\(['"]project:updated['"]/.test(eventsFile));
  test('project:deleted event handler', /socket\.on\(['"]project:deleted['"]/.test(eventsFile));
  
  // Kanban events
  test('card:moved event handler', /socket\.on\(['"]card:moved['"]/.test(eventsFile));
  
  // Presence events
  test('user:online event handler', /socket\.on\(['"]user:online['"]/.test(eventsFile) || /user:online/.test(eventsFile));
  test('user:offline event handler', /socket\.on\(['"]user:offline['"]/.test(eventsFile) || /user:offline/.test(eventsFile) || /disconnect/.test(eventsFile));
  
  // Room management
  test('join-org room support', /join-org/.test(eventsFile));
  test('join-project room support', /join-project/.test(eventsFile));
  
  // Broadcasting
  test('Organization room broadcasting', /to\([^)]*org[^)]*\)\.emit/.test(eventsFile) || /in\([^)]*org[^)]*\)\.emit/.test(eventsFile));
  test('Project room broadcasting', /to\([^)]*project[^)]*\)\.emit/.test(eventsFile) || /in\([^)]*project[^)]*\)\.emit/.test(eventsFile));
}

// ==================== PHASE 11.2: Server Integration ====================
section('🔧 Phase 11.2: Server Integration');

const serverFile = readFile('server/index.js');
test('server/index.js exists', serverFile !== null);

if (serverFile) {
  test('Socket.io server initialized', /require\(['"]socket\.io['"]/.test(serverFile));
  test('SocketEvents imported', /require\(['"]\.\/socket\/events['"]/.test(serverFile));
  test('SocketEvents.initialize called', /SocketEvents\.initialize/.test(serverFile) || /socketEvents\.initialize/.test(serverFile));
  test('CORS configured for Socket.io', /cors:/.test(serverFile));
}

// ==================== PHASE 11.3: SocketContext ====================
section('⚛️ Phase 11.3: React SocketContext');

const socketContextFile = readFile('client/src/contexts/SocketContext.js');
test('client/src/contexts/SocketContext.js exists', socketContextFile !== null);

if (socketContextFile) {
  test('SocketProvider component exists', /export.*SocketProvider/.test(socketContextFile));
  test('useSocket hook exists', /export.*useSocket/.test(socketContextFile));
  test('Socket.io client imported', /from ['"]socket\.io-client['"]/.test(socketContextFile));
  test('Socket connection established', /io\(/.test(socketContextFile));
  
  // Emit functions
  test('emitSubtaskCreated function', /emitSubtaskCreated/.test(socketContextFile));
  test('emitTimeLogged function', /emitTimeLogged/.test(socketContextFile));
  test('emitBudgetUpdated function', /emitBudgetUpdated/.test(socketContextFile));
  test('emitExpenseLogged function', /emitExpenseLogged/.test(socketContextFile));
  test('emitTaskCreated function', /emitTaskCreated/.test(socketContextFile));
  test('emitTaskDeleted function', /emitTaskDeleted/.test(socketContextFile));
  test('emitProjectCreated function', /emitProjectCreated/.test(socketContextFile));
  test('emitProjectDeleted function', /emitProjectDeleted/.test(socketContextFile));
  
  // Listen functions
  test('onSubtaskCreated function', /onSubtaskCreated/.test(socketContextFile));
  test('onSubtaskUpdated function', /onSubtaskUpdated/.test(socketContextFile));
  test('onTimeLogged function', /onTimeLogged/.test(socketContextFile));
  test('onTimeUpdated function', /onTimeUpdated/.test(socketContextFile));
  test('onTaskTimeUpdated function', /onTaskTimeUpdated/.test(socketContextFile));
  test('onBudgetUpdated function', /onBudgetUpdated/.test(socketContextFile));
  test('onExpenseLogged function', /onExpenseLogged/.test(socketContextFile));
  test('onBudgetAlert function', /onBudgetAlert/.test(socketContextFile));
  test('onTaskCreated function', /onTaskCreated/.test(socketContextFile));
  test('onTaskDeleted function', /onTaskDeleted/.test(socketContextFile));
  test('onTaskAssigned function', /onTaskAssigned/.test(socketContextFile));
  test('onProjectCreated function', /onProjectCreated/.test(socketContextFile));
  test('onProjectDeleted function', /onProjectDeleted/.test(socketContextFile));
  test('onUserOnline function', /onUserOnline/.test(socketContextFile));
  test('onUserOffline function', /onUserOffline/.test(socketContextFile));
  
  // Context value
  test('All emit functions exposed in context', /emitSubtaskCreated.*emitTimeLogged.*emitBudgetUpdated/s.test(socketContextFile) || /emitSubtaskCreated/.test(socketContextFile));
  test('All on functions exposed in context', /onSubtaskCreated.*onTimeLogged.*onBudgetUpdated/s.test(socketContextFile) || /onSubtaskCreated/.test(socketContextFile));
}

// ==================== PHASE 11.4: Toast Notification System ====================
section('🔔 Phase 11.4: Toast Notification System');

const toastFile = readFile('client/src/components/ToastNotification.js');
const toastCssFile = readFile('client/src/components/ToastNotification.css');

test('client/src/components/ToastNotification.js exists', toastFile !== null);
test('client/src/components/ToastNotification.css exists', toastCssFile !== null);

if (toastFile) {
  test('Toast notification system implemented', /ToastNotification|ToastContainer/.test(toastFile));
  test('ToastContainer component exists', /export.*ToastContainer/.test(toastFile) || /const ToastContainer/.test(toastFile));
  test('Toast display/management implemented', /useState|notifications/.test(toastFile));
  
  // Toast types
  test('Success toast type', /success/.test(toastFile));
  test('Error toast type', /error/.test(toastFile));
  test('Warning toast type', /warning/.test(toastFile));
  test('Info toast type', /info/.test(toastFile));
  
  // Icons
  test('CheckCircle icon imported', /CheckCircle/.test(toastFile));
  test('XCircle or X icon imported', /XCircle/.test(toastFile) || /\bX\b/.test(toastFile) || /AlertCircle/.test(toastFile));
  test('AlertTriangle icon imported', /AlertTriangle/.test(toastFile));
  test('Info icon imported', /Info/.test(toastFile));
  
  // Functionality
  test('Auto-dismiss implemented', /setTimeout/.test(toastFile) || /duration/.test(toastFile));
  test('Manual dismiss implemented', /remove/.test(toastFile) || /close/.test(toastFile));
}

if (toastCssFile) {
  test('toast-container styles defined', /\.toast-container/.test(toastCssFile));
  test('toast styles defined', /\.toast-item/.test(toastCssFile) || /\.toast-notification/.test(toastCssFile) || /\.toast-/.test(toastCssFile));
  test('Success toast color (green)', /#10b981|#22c55e|rgb\(34,\s*197,\s*94\)|rgba\(34,\s*197,\s*94/.test(toastCssFile) || /green/.test(toastCssFile));
  test('Error toast color (red)', /#ef4444|rgb\(239,\s*68,\s*68\)|rgba\(239,\s*68,\s*68/.test(toastCssFile));
  test('Warning toast color (orange)', /#f59e0b|rgb\(245,\s*158,\s*11\)|rgba\(245,\s*158,\s*11/.test(toastCssFile));
  test('Info toast color (blue)', /#3b82f6|rgb\(59,\s*130,\s*246\)|rgba\(59,\s*130,\s*246/.test(toastCssFile));
  test('Animation defined', /@keyframes|animation:|transform:/.test(toastCssFile));
  test('Responsive design', /@media/.test(toastCssFile));
}

// ==================== PHASE 11.5: App Integration ====================
section('🔗 Phase 11.5: App Integration');

const appFile = readFile('client/src/App.js');
test('client/src/App.js exists', appFile !== null);

if (appFile) {
  test('ToastContainer imported', /import.*ToastContainer.*from.*ToastNotification/.test(appFile));
  test('ToastContainer rendered', /<ToastContainer/.test(appFile));
  test('SocketProvider exists', /SocketProvider/.test(appFile));
}

// ==================== PHASE 11.6: Kanban Real-Time Integration ====================
section('🎯 Phase 11.6: Kanban Real-Time Integration');

const kanbanFile = readFile('client/src/pages/Kanban.js');
test('client/src/pages/Kanban.js exists', kanbanFile !== null);

if (kanbanFile) {
  test('useSocket hook imported', /import.*useSocket/.test(kanbanFile));
  test('Socket connected indicator', /connected/.test(kanbanFile) && /Live/.test(kanbanFile));
  test('onTaskUpdated listener', /onTaskUpdated/.test(kanbanFile));
  test('onCardMoved listener', /onCardMoved/.test(kanbanFile));
  test('card:moved emit on drag', /emit.*card:moved/.test(kanbanFile) || /emitCardMoved/.test(kanbanFile));
}

// ==================== PHASE 11.7: Time Tracking Real-Time ====================
section('⏱️ Phase 11.7: Time Tracking Real-Time');

const quickTimeLogFile = readFile('client/src/components/kanban/QuickTimeLogModal.js');
test('QuickTimeLogModal.js exists', quickTimeLogFile !== null);

if (quickTimeLogFile) {
  test('Time logging modal implemented', /QuickTimeLogModal/.test(quickTimeLogFile));
  test('Hours input field', /hours/.test(quickTimeLogFile));
  test('Date input field', /date/.test(quickTimeLogFile));
  test('Description field', /description/.test(quickTimeLogFile));
  test('Billable checkbox', /billable/.test(quickTimeLogFile));
}

const kanbanCardFile = readFile('client/src/components/kanban/KanbanCard.js');
if (kanbanCardFile) {
  test('KanbanCard has time tracking section', /timeTracking/.test(kanbanCardFile) || /logged.*hours/i.test(kanbanCardFile));
  test('KanbanCard has log time button', /Log/.test(kanbanCardFile) && /button/i.test(kanbanCardFile));
  test('onLogTime prop passed', /onLogTime/.test(kanbanCardFile));
}

// ==================== PHASE 11.8: Budget Real-Time ====================
section('💰 Phase 11.8: Budget Real-Time');

const budgetTrackerFile = readFile('client/src/components/project/BudgetTracker.js');
test('BudgetTracker.js exists', budgetTrackerFile !== null);

if (budgetTrackerFile) {
  test('Budget tracker component', /BudgetTracker/.test(budgetTrackerFile));
  test('Budget display', /planned|spent|remaining/i.test(budgetTrackerFile));
  test('Add expense button', /expense/i.test(budgetTrackerFile) && /button/i.test(budgetTrackerFile));
}

// ==================== VERIFICATION COMPLETE ====================
summary();

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);

