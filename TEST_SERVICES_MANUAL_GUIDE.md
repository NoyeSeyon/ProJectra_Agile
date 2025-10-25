# 🧪 Services Layer - Manual Testing Guide

## ✅ Automated Tests: PASSED (67/67 checks - 100%)

All service files are structurally complete and ready for manual testing!

---

## 🎯 **Testing Prerequisites**

### **1. Backend Must Be Running**
```bash
cd server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Server running on port 5001
✅ Socket.io initialized
```

### **2. Frontend Must Be Running**
```bash
cd client
npm start
```

**Expected Output:**
```
✅ Compiled successfully!
✅ Local: http://localhost:3000
```

### **3. Test User Accounts**

| Role | Email | Password |
|------|-------|----------|
| **Team Leader** | Create via Admin portal | Set password |
| **PM** | pm@projectra.com | pm123 |
| **Member** | member@projectra.com | member123 |
| **Admin** | admin@projectra.com | admin123 |

---

## 📝 **Test Suite**

### **Test 1: Team Leader Service** ⭐

#### **Setup:**
1. Login as Admin
2. Go to User Management
3. Invite a user with role "Team Leader"
4. User registers and logs in

#### **Test 1.1: Get Dashboard Stats**
**Browser Console Test:**
```javascript
import teamLeaderService from './services/teamLeaderService';

// Get dashboard stats
const stats = await teamLeaderService.getDashboardStats();
console.log('Dashboard Stats:', stats);
```

**Expected Result:**
```javascript
{
  totalProjects: 2,
  tasksNeedingBreakdown: 5,
  teamMembers: 10,
  activeSubtasks: 15,
  completedSubtasks: 8
}
```

**✅ PASS if:** Returns object with project and task statistics

---

#### **Test 1.2: Get Team Leader Projects**
**Browser Console Test:**
```javascript
const projects = await teamLeaderService.getTeamLeaderProjects();
console.log('TL Projects:', projects);
```

**Expected Result:**
```javascript
[
  {
    _id: "proj123",
    name: "Website Redesign",
    teamLeader: { _id: "user456", firstName: "John" },
    members: [...],
    status: "active"
  }
]
```

**✅ PASS if:** Returns array of projects where user is Team Leader

---

#### **Test 1.3: Create Subtask**
**Prerequisites:**
- Have a main task in the system
- Be logged in as Team Leader

**Browser Console Test:**
```javascript
const mainTaskId = 'your-task-id-here';

const subtask = await teamLeaderService.createSubtask(mainTaskId, {
  title: 'Design Login Form',
  description: 'Create mockups for login UI',
  assignee: 'member-user-id',
  storyPoints: 3,
  estimatedHours: 4,
  priority: 'high',
  requiredSpecialization: 'frontend'
});

console.log('Subtask Created:', subtask);
```

**Expected Result:**
```javascript
{
  success: true,
  subtask: {
    _id: "sub789",
    title: "Design Login Form",
    isSubtask: true,
    mainTask: "task123",
    assignee: {...},
    status: "todo"
  }
}
```

**✅ PASS if:** Subtask is created successfully

---

#### **Test 1.4: Validate Subtask Data**
**Browser Console Test:**
```javascript
const validation = teamLeaderService.validateSubtaskData({
  title: '', // Invalid: empty
  storyPoints: 100 // Invalid: too high
});

console.log('Validation Result:', validation);
```

**Expected Result:**
```javascript
{
  isValid: false,
  errors: [
    "Subtask title is required",
    "Story points must be between 0 and 89"
  ]
}
```

**✅ PASS if:** Validation catches errors correctly

---

#### **Test 1.5: Calculate Subtask Completion**
**Browser Console Test:**
```javascript
const subtasks = [
  { status: 'completed' },
  { status: 'completed' },
  { status: 'in_progress' },
  { status: 'todo' }
];

const completion = teamLeaderService.calculateSubtaskCompletion(subtasks);
console.log('Completion:', completion); // Should be 50%
```

**Expected Result:** `50`

**✅ PASS if:** Returns correct percentage (50%)

---

#### **Test 1.6: Group Subtasks by Status**
**Browser Console Test:**
```javascript
const subtasks = [
  { _id: '1', title: 'Task 1', status: 'todo' },
  { _id: '2', title: 'Task 2', status: 'in_progress' },
  { _id: '3', title: 'Task 3', status: 'completed' },
  { _id: '4', title: 'Task 4', status: 'todo' }
];

const grouped = teamLeaderService.groupSubtasksByStatus(subtasks);
console.log('Grouped:', grouped);
```

**Expected Result:**
```javascript
{
  todo: [{ _id: '1', ... }, { _id: '4', ... }],
  in_progress: [{ _id: '2', ... }],
  review: [],
  completed: [{ _id: '3', ... }]
}
```

**✅ PASS if:** Subtasks are correctly grouped

---

### **Test 2: Time Tracking Service** ⏱️

#### **Test 2.1: Log Time**
**Browser Console Test:**
```javascript
import timeTrackingService from './services/timeTrackingService';

const result = await timeTrackingService.logTime({
  task: 'your-task-id',
  hours: 2.5,
  description: 'Worked on feature implementation',
  billable: true,
  date: new Date()
});

console.log('Time Logged:', result);
```

**Expected Result:**
```javascript
{
  success: true,
  message: "Time logged successfully",
  log: {
    _id: "log123",
    task: "task456",
    user: {...},
    hours: 2.5,
    billable: true
  }
}
```

**✅ PASS if:** Time is logged successfully

---

#### **Test 2.2: Get Task Time Logs**
**Browser Console Test:**
```javascript
const taskId = 'your-task-id';
const logs = await timeTrackingService.getTaskTimeLogs(taskId);
console.log('Task Logs:', logs);
```

**Expected Result:**
```javascript
{
  success: true,
  logs: [
    {
      _id: "log123",
      hours: 2.5,
      description: "...",
      date: "2025-01-15",
      user: {...}
    }
  ]
}
```

**✅ PASS if:** Returns array of time logs

---

#### **Test 2.3: Calculate Time Statistics**
**Browser Console Test:**
```javascript
const logs = [
  { hours: 2.5, billable: true, date: new Date() },
  { hours: 3.0, billable: true, date: new Date() },
  { hours: 1.5, billable: false, date: new Date() }
];

const stats = timeTrackingService.calculateTimeStats(logs);
console.log('Time Stats:', stats);
```

**Expected Result:**
```javascript
{
  total: 7.0,
  billable: 5.5,
  nonBillable: 1.5,
  week: 7.0,
  month: 7.0,
  logCount: 3
}
```

**✅ PASS if:** Statistics are calculated correctly

---

#### **Test 2.4: Format Hours**
**Browser Console Test:**
```javascript
console.log(timeTrackingService.formatHours(0));     // "0h"
console.log(timeTrackingService.formatHours(0.5));   // "30m"
console.log(timeTrackingService.formatHours(2));     // "2h"
console.log(timeTrackingService.formatHours(2.5));   // "2h 30m"
console.log(timeTrackingService.formatHours(8.75));  // "8h 45m"
```

**Expected Results:**
- `0h`
- `30m`
- `2h`
- `2h 30m`
- `8h 45m`

**✅ PASS if:** All formats are correct

---

#### **Test 2.5: Group Logs by Date**
**Browser Console Test:**
```javascript
const logs = [
  { hours: 2, date: '2025-01-15' },
  { hours: 3, date: '2025-01-15' },
  { hours: 1, date: '2025-01-14' }
];

const grouped = timeTrackingService.groupLogsByDate(logs);
console.log('Grouped by Date:', grouped);
```

**Expected Result:**
```javascript
[
  {
    date: "2025-01-15",
    logs: [{ hours: 2 }, { hours: 3 }],
    totalHours: 5
  },
  {
    date: "2025-01-14",
    logs: [{ hours: 1 }],
    totalHours: 1
  }
]
```

**✅ PASS if:** Logs are correctly grouped and sorted by date

---

### **Test 3: Budget Service** 💰

#### **Test 3.1: Get Project Budget**
**Prerequisites:**
- Have a project with budget set

**Browser Console Test:**
```javascript
import budgetService from './services/budgetService';

const projectId = 'your-project-id';
const budget = await budgetService.getProjectBudget(projectId);
console.log('Project Budget:', budget);
```

**Expected Result:**
```javascript
{
  success: true,
  budget: {
    planned: 10000,
    spent: 7500,
    remaining: 2500,
    currency: "USD",
    percentage: 75,
    alertThreshold: 80
  }
}
```

**✅ PASS if:** Returns budget information

---

#### **Test 3.2: Get Budget Status**
**Browser Console Test:**
```javascript
const color50 = budgetService.getBudgetStatusColor(50);  // "good"
const color75 = budgetService.getBudgetStatusColor(75);  // "caution"
const color85 = budgetService.getBudgetStatusColor(85);  // "warning"
const color98 = budgetService.getBudgetStatusColor(98);  // "critical"

console.log('50%:', color50);
console.log('75%:', color75);
console.log('85%:', color85);
console.log('98%:', color98);
```

**Expected Results:**
- 50%: `"good"`
- 75%: `"caution"`
- 85%: `"warning"`
- 98%: `"critical"`

**✅ PASS if:** All status colors are correct

---

#### **Test 3.3: Format Currency**
**Browser Console Test:**
```javascript
console.log(budgetService.formatCurrency(1234.56, 'USD'));  // "$1,234.56"
console.log(budgetService.formatCurrency(1234.56, 'EUR'));  // "€1,234.56"
console.log(budgetService.formatCurrency(1234.56, 'GBP'));  // "£1,234.56"
console.log(budgetService.formatCurrency(1234.56, 'INR'));  // "₹1,234.56"
console.log(budgetService.formatCurrency(1234.56, 'LKR'));  // "Rs1,234.56"
```

**Expected Results:**
- USD: `"$1,234.56"`
- EUR: `"€1,234.56"`
- GBP: `"£1,234.56"`
- INR: `"₹1,234.56"`
- LKR: `"Rs1,234.56"`

**✅ PASS if:** All currencies format correctly

---

#### **Test 3.4: Calculate Budget Percentage**
**Browser Console Test:**
```javascript
const pct1 = budgetService.calculateBudgetPercentage(750, 1000);   // 75
const pct2 = budgetService.calculateBudgetPercentage(1200, 1000);  // 120
const pct3 = budgetService.calculateBudgetPercentage(0, 1000);     // 0

console.log('750/1000:', pct1);
console.log('1200/1000:', pct2);
console.log('0/1000:', pct3);
```

**Expected Results:**
- `75`
- `120`
- `0`

**✅ PASS if:** Percentages are calculated correctly

---

#### **Test 3.5: Log Expense**
**Browser Console Test:**
```javascript
const expense = await budgetService.logExpense({
  project: 'project-id',
  amount: 500,
  category: 'Development',
  description: 'Software licenses',
  date: new Date()
});

console.log('Expense Logged:', expense);
```

**Expected Result:**
```javascript
{
  success: true,
  message: "Expense logged successfully",
  expense: {
    _id: "exp123",
    amount: 500,
    category: "Development"
  }
}
```

**✅ PASS if:** Expense is logged successfully

---

### **Test 4: Project Service** 📊

#### **Test 4.1: Get Projects**
**Browser Console Test:**
```javascript
import { projectService } from './services/projectService';

const orgId = 'your-org-id';
const projects = await projectService.getProjects(orgId);
console.log('Projects:', projects);
```

**Expected Result:**
```javascript
{
  success: true,
  projects: [
    {
      _id: "proj123",
      name: "Website Redesign",
      status: "active",
      progress: 45,
      weight: 7
    }
  ]
}
```

**✅ PASS if:** Returns array of projects

---

#### **Test 4.2: Calculate Project Weight**
**Browser Console Test:**
```javascript
const weightData = {
  teamSize: 5,
  duration: 3, // months
  complexity: 'high',
  technologies: ['React', 'Node.js', 'MongoDB']
};

const weight = await projectService.calculateWeight(weightData);
console.log('Project Weight:', weight);
```

**Expected Result:**
```javascript
{
  success: true,
  weight: 7,
  complexity: "medium",
  recommendedTeamSize: 5
}
```

**✅ PASS if:** Weight is calculated

---

## 📊 **Test Results Template**

After testing, fill this out:

```
✅ SERVICES LAYER TEST RESULTS

Team Leader Service:
  ☐ getDashboardStats     [ ] Pass / [ ] Fail
  ☐ createSubtask         [ ] Pass / [ ] Fail
  ☐ validateSubtaskData   [ ] Pass / [ ] Fail
  ☐ calculateCompletion   [ ] Pass / [ ] Fail
  ☐ groupByStatus         [ ] Pass / [ ] Fail

Time Tracking Service:
  ☐ logTime               [ ] Pass / [ ] Fail
  ☐ getTaskTimeLogs       [ ] Pass / [ ] Fail
  ☐ calculateTimeStats    [ ] Pass / [ ] Fail
  ☐ formatHours           [ ] Pass / [ ] Fail
  ☐ groupLogsByDate       [ ] Pass / [ ] Fail

Budget Service:
  ☐ getProjectBudget      [ ] Pass / [ ] Fail
  ☐ getBudgetStatusColor  [ ] Pass / [ ] Fail
  ☐ formatCurrency        [ ] Pass / [ ] Fail
  ☐ calculatePercentage   [ ] Pass / [ ] Fail
  ☐ logExpense            [ ] Pass / [ ] Fail

Project Service:
  ☐ getProjects           [ ] Pass / [ ] Fail
  ☐ calculateWeight       [ ] Pass / [ ] Fail

Overall Status: [ ] All Pass / [ ] Some Failures

Notes:
_________________________________________________
_________________________________________________
```

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: "Cannot import service"**
**Fix:** Check import path:
```javascript
// Correct
import teamLeaderService from '../services/teamLeaderService';

// Wrong
import teamLeaderService from './teamLeaderService';
```

### **Issue 2: "Network Error" when calling API**
**Fix:** 
1. Check backend is running on port 5001
2. Check CORS is configured
3. Check auth token is set

### **Issue 3: "Unauthorized" error**
**Fix:**
1. Ensure you're logged in
2. Check token in localStorage
3. Verify user has correct role

### **Issue 4: "Service method not a function"**
**Fix:** Check you're importing correctly:
```javascript
// Named export
import { projectService } from '../services/projectService';

// Default export
import teamLeaderService from '../services/teamLeaderService';
```

---

## ✅ **Success Criteria**

**Services are working if:**

1. ✅ All 67 automated tests passed
2. ✅ Team Leader Service: Create subtask works
3. ✅ Time Tracking Service: Log time works
4. ✅ Budget Service: Get budget works
5. ✅ Project Service: Get projects works
6. ✅ All helper functions work correctly
7. ✅ Error handling catches issues
8. ✅ No console errors

**If all 8 criteria met → Services Layer is production-ready!** 🚀

---

## 📚 **Additional Resources**

- **Full Documentation:** `PHASE10_SERVICES_LAYER_COMPLETE.md`
- **Quick Reference:** `SERVICES_QUICK_REFERENCE.md`
- **Service Files:** `client/src/services/`

---

## 🎯 **Next Steps After Testing**

**If all tests pass:**
1. Integrate services into components
2. Update UI to use new service functions
3. Add loading states
4. Add error handling UI
5. Proceed to Phase 11

**If issues found:**
1. Document the issue
2. Check backend endpoints
3. Verify data formats
4. Fix and retest

---

**Happy Testing!** 🧪

