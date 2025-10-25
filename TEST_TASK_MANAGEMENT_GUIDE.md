# Task Management CRUD System - Testing Guide

## Overview
Comprehensive testing guide for the complete Task Management CRUD system including PM operations, Team Leader permissions, Member access, and real-time updates.

---

## Table of Contents
1. [Backend Testing](#backend-testing)
2. [Frontend Testing](#frontend-testing)
3. [Real-time Testing](#real-time-testing)
4. [Permission Testing](#permission-testing)
5. [Edge Cases](#edge-cases)

---

## Backend Testing

### Setup
1. Start server: `cd server && npm start`
2. Ensure MongoDB is running
3. Have test users ready: PM, Team Leader, Member

### Test 1: PM Creates Task (Basic)

**Endpoint:** `POST /api/pm/projects/:projectId/tasks`

**Headers:**
```
Authorization: Bearer <PM_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "assignee": "USER_ID",
  "priority": "high",
  "storyPoints": 8,
  "estimatedHours": 16,
  "requiredSpecialization": "Backend Developer"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "task123",
      "title": "Implement user authentication",
      "status": "todo",
      "blockingStatus": "not_blocked",
      "dependencies": [],
      ...
    }
  }
}
```

**Verification:**
- ✅ Status code: 201
- ✅ Task has correct fields
- ✅ blockingStatus: "not_blocked"
- ✅ dependencies: []
- ✅ Socket event emitted

---

### Test 2: PM Creates Task with Dependencies

**Endpoint:** `POST /api/pm/projects/:projectId/tasks`

**Body:**
```json
{
  "title": "Build API endpoints",
  "description": "Create REST API for user management",
  "assignee": "USER_ID",
  "priority": "high",
  "storyPoints": 5,
  "estimatedHours": 10,
  "dependencies": ["TASK1_ID", "TASK2_ID"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "title": "Build API endpoints",
      "blockingStatus": "blocked",
      "dependencies": ["TASK1_ID", "TASK2_ID"]
    }
  }
}
```

**Verification:**
- ✅ blockingStatus: "blocked" (if dependencies incomplete)
- ✅ dependencies array populated
- ✅ Dependent tasks have this task in blockedBy array

---

### Test 3: PM Updates Task

**Endpoint:** `PUT /api/pm/tasks/:taskId`

**Body:**
```json
{
  "title": "Updated task title",
  "status": "in_progress",
  "priority": "urgent",
  "assignee": "NEW_USER_ID"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "title": "Updated task title",
      "status": "in_progress",
      "priority": "urgent"
    }
  }
}
```

**Verification:**
- ✅ Fields updated correctly
- ✅ Socket event emitted
- ✅ Blocking status recalculated if dependencies changed

---

### Test 4: PM Deletes Task with Subtasks

**Endpoint:** `DELETE /api/pm/tasks/:taskId`

**Expected Response:**
```json
{
  "success": true,
  "message": "Task and 3 subtasks deleted successfully"
}
```

**Verification:**
- ✅ Main task deleted
- ✅ All subtasks cascade deleted
- ✅ Removed from blockedBy arrays of other tasks
- ✅ Socket event emitted

---

### Test 5: PM Toggles Team Leader Subtask Permission

**Endpoint:** `PUT /api/pm/projects/:projectId/settings`

**Body:**
```json
{
  "allowTeamLeaderSubtasks": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project settings updated successfully",
  "data": {
    "projectId": "proj123",
    "settings": {
      "allowTeamLeaderSubtasks": false
    }
  }
}
```

**Verification:**
- ✅ Setting updated in database
- ✅ Socket event emitted to org and project rooms
- ✅ Notification sent to Team Leaders

---

### Test 6: PM Adds Task Dependency

**Endpoint:** `POST /api/pm/tasks/:taskId/dependencies`

**Body:**
```json
{
  "dependencyId": "DEPENDENCY_TASK_ID"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dependency added successfully",
  "data": {
    "task": {
      "dependencies": ["DEPENDENCY_TASK_ID"],
      "blockingStatus": "blocked"
    }
  }
}
```

**Verification:**
- ✅ Dependency added to task.dependencies
- ✅ Task added to dependency.blockedBy
- ✅ blockingStatus updated
- ✅ Socket event emitted

---

### Test 7: PM Removes Task Dependency

**Endpoint:** `DELETE /api/pm/tasks/:taskId/dependencies/:dependencyId`

**Expected Response:**
```json
{
  "success": true,
  "message": "Dependency removed successfully",
  "data": {
    "task": {
      "dependencies": [],
      "blockingStatus": "not_blocked"
    }
  }
}
```

**Verification:**
- ✅ Dependency removed from arrays
- ✅ blockingStatus recalculated
- ✅ Socket event emitted

---

### Test 8: Team Leader Creates Subtasks (Enabled)

**Endpoint:** `POST /api/team-leader/tasks/:taskId/subtasks`

**Headers:**
```
Authorization: Bearer <TEAM_LEADER_TOKEN>
```

**Body:**
```json
{
  "subtasks": [
    {
      "title": "Subtask 1",
      "assignee": "USER_ID",
      "estimatedHours": 4
    },
    {
      "title": "Subtask 2",
      "assignee": "USER_ID2",
      "estimatedHours": 3
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "2 subtasks created successfully",
  "data": {
    "subtasks": [...]
  }
}
```

**Verification:**
- ✅ Subtasks created
- ✅ isSubtask: true
- ✅ mainTask reference set
- ✅ Socket event emitted

---

### Test 9: Team Leader Creates Subtasks (Disabled)

**Prerequisites:**
- PM has toggled `allowTeamLeaderSubtasks: false`

**Endpoint:** `POST /api/team-leader/tasks/:taskId/subtasks`

**Expected Response:**
```json
{
  "success": false,
  "message": "Subtask creation is disabled by Project Manager"
}
```

**Verification:**
- ✅ Status code: 403
- ✅ Clear error message
- ✅ No subtasks created

---

### Test 10: Member Updates Own Task Status

**Endpoint:** `PUT /api/tasks/:taskId`

**Headers:**
```
Authorization: Bearer <MEMBER_TOKEN>
```

**Body:**
```json
{
  "status": "in_progress"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

**Verification:**
- ✅ Status updated
- ✅ Member can only update own tasks
- ✅ Socket event emitted

---

## Frontend Testing

### Setup
1. Start client: `cd client && npm start`
2. Login as different user roles
3. Have multiple browser windows open

### Test 11: PM Creates Task via Modal

**Steps:**
1. Login as PM
2. Navigate to PM Project Detail page
3. Click "Create Task" button
4. Fill form:
   - Title: "Test Task"
   - Description: "Test description"
   - Assignee: Select a user
   - Priority: High
   - Story Points: 8
   - Estimated Hours: 16
5. Click "Create Task"

**Expected Results:**
- ✅ Modal opens smoothly
- ✅ Form validation works (title required)
- ✅ Assignee dropdown shows Team Leaders + Members
- ✅ Specializations displayed in dropdown
- ✅ Priority selector works
- ✅ Story points dropdown shows Fibonacci numbers
- ✅ On submit: Modal closes
- ✅ Task appears in task list immediately
- ✅ Toast notification shows success

---

### Test 12: PM Edits Existing Task

**Steps:**
1. Navigate to PM Project Detail
2. Find a task in the list
3. Click edit icon (pencil)
4. Modal opens with pre-filled data
5. Modify title and priority
6. Click "Update Task"

**Expected Results:**
- ✅ Modal opens with correct data
- ✅ All fields pre-populated
- ✅ Changes saved successfully
- ✅ Task list updates immediately
- ✅ Toast notification shows

---

### Test 13: PM Deletes Task

**Steps:**
1. Navigate to PM Project Detail
2. Click delete icon (trash) on a task
3. Confirmation dialog appears
4. Click "Confirm Delete"

**Expected Results:**
- ✅ Confirmation dialog shows
- ✅ Warning if task has subtasks
- ✅ Task deleted from database
- ✅ Task removed from UI immediately
- ✅ Toast notification shows
- ✅ Subtasks also deleted (if any)

---

### Test 14: PM Toggles Subtask Permission

**Steps:**
1. Navigate to PM Project Detail
2. Scroll to "Project Settings" section
3. Find "Allow Team Leader Subtasks" toggle
4. Click toggle to turn OFF
5. Confirmation dialog appears
6. Confirm

**Expected Results:**
- ✅ Toggle switch animates
- ✅ Confirmation dialog shows
- ✅ Setting saved to database
- ✅ Socket event emitted
- ✅ Toast notification shows

---

### Test 15: Team Leader Sees Disabled Message

**Prerequisites:**
- PM has disabled subtask creation for project

**Steps:**
1. Login as Team Leader
2. Navigate to Member Tasks page
3. Find a task where you're the Team Leader
4. Look for subtask creation UI

**Expected Results:**
- ✅ "Break into Subtasks" button NOT shown
- ✅ Red warning box displayed
- ✅ Message: "🛡️ Subtask creation disabled by Project Manager"
- ✅ Team Leader badge still shown

---

### Test 16: Member Views Task with Dependencies

**Steps:**
1. Login as Member
2. Navigate to Member Tasks page
3. Find a task with dependencies

**Expected Results:**
- ✅ Task shows dependency count (e.g., "🔗 2 dependencies")
- ✅ Dependencies section displayed below task info
- ✅ Each dependency shows:
  - Link icon
  - Task title
  - Status badge
- ✅ Blocking status badge shown (if blocked)

---

### Test 17: Task Blocking Status Display

**Prerequisites:**
- Task B depends on Task A
- Task A status: "todo"

**Steps:**
1. View Task B in any role

**Expected Results:**
- ✅ Task B has red left border
- ✅ 🔒 Lock icon before task title
- ✅ Red "Blocked" badge in header
- ✅ Dependencies list shows Task A status
- ✅ Subtle red gradient background

**When Task A Completed:**
- ✅ Task B border changes to normal
- ✅ Lock icon disappears
- ✅ "Blocked" badge removed
- ✅ blockingStatus: "not_blocked"

---

## Real-time Testing

### Setup
- Open 2-3 browser windows
- Login as different users in each
- Navigate to same project

### Test 18: Real-time Task Creation

**Steps:**
1. Browser 1: Login as PM, open Project Detail
2. Browser 2: Login as Team Leader, open Member Tasks
3. Browser 1: Create new task via modal
4. Observe Browser 2

**Expected Results:**
- ✅ Browser 2 sees new task appear immediately
- ✅ No page refresh needed
- ✅ Task appears in correct status group
- ✅ Socket event received
- ✅ Task data complete with all fields

---

### Test 19: Real-time Task Update

**Steps:**
1. Browser 1: PM viewing Project Detail
2. Browser 2: Member viewing Member Tasks
3. Browser 1: Update task status to "in_progress"
4. Observe Browser 2

**Expected Results:**
- ✅ Browser 2 task status updates immediately
- ✅ Status badge color changes
- ✅ Task moves to correct status group (if grouped)
- ✅ Socket event received

---

### Test 20: Real-time Task Deletion

**Steps:**
1. Browser 1: PM viewing Project Detail
2. Browser 2: Team Leader viewing same project
3. Browser 1: Delete a task
4. Observe Browser 2

**Expected Results:**
- ✅ Task disappears from Browser 2 immediately
- ✅ No error in Browser 2
- ✅ Task count updates
- ✅ Socket event received

---

### Test 21: Real-time Settings Toggle

**Steps:**
1. Browser 1: PM viewing Project Detail
2. Browser 2: Team Leader viewing Member Tasks (same project)
3. Browser 1: Toggle "Allow Team Leader Subtasks" OFF
4. Observe Browser 2

**Expected Results:**
- ✅ Browser 2 sees change immediately
- ✅ "Break into Subtasks" button disappears
- ✅ "🛡️ Disabled" message appears
- ✅ Socket event received
- ✅ Toast notification shows in Browser 2

---

### Test 22: Real-time Dependency Addition

**Steps:**
1. Browser 1: PM viewing Project Detail
2. Browser 2: Member viewing task list
3. Browser 1: Add dependency to Task B
4. Observe Browser 2

**Expected Results:**
- ✅ Browser 2 shows dependency count update
- ✅ Dependencies list appears/updates
- ✅ Blocking status may change
- ✅ 🔒 icon may appear
- ✅ Socket event received

---

## Permission Testing

### Test 23: PM Access Control

**Test Cases:**
- ✅ PM can create tasks in own projects
- ✅ PM cannot create tasks in other PM's projects (403)
- ✅ PM can edit any task in own projects
- ✅ PM can delete any task in own projects
- ✅ PM can toggle settings for own projects only

**How to Test:**
1. Login as PM1
2. Try to create task in PM2's project
3. Expected: 403 Forbidden error

---

### Test 24: Team Leader Permissions

**Test Cases:**
- ✅ TL can create subtasks when enabled
- ✅ TL gets 403 when disabled
- ✅ TL can edit subtasks they created
- ✅ TL cannot delete main tasks
- ✅ TL can view all project tasks

**How to Test:**
1. Login as Team Leader
2. Try to delete a main task
3. Expected: 403 or button not shown

---

### Test 25: Member Permissions

**Test Cases:**
- ✅ Member can update status of own tasks
- ✅ Member cannot edit other member's tasks
- ✅ Member cannot delete any tasks
- ✅ Member can log time on own tasks
- ✅ Member sees read-only view of dependencies

**How to Test:**
1. Login as Member
2. Try to edit another member's task
3. Expected: 403 or edit button not shown

---

## Edge Cases

### Test 26: Circular Dependency Prevention

**Steps:**
1. Create Task A
2. Create Task B that depends on Task A
3. Try to add Task B as dependency of Task A (circular)

**Expected Results:**
- ✅ Backend validation prevents circular dependency
- ✅ Error message: "Would create circular dependency"
- ✅ Status code: 400

---

### Test 27: Self-Dependency Prevention

**Steps:**
1. Try to add Task A as dependency of itself

**Expected Results:**
- ✅ Backend validation prevents self-dependency
- ✅ Error message: "Task cannot depend on itself"
- ✅ Status code: 400

---

### Test 28: Delete Task with Dependencies

**Steps:**
1. Task B depends on Task A
2. Delete Task A
3. Observe Task B

**Expected Results:**
- ✅ Task A deleted successfully
- ✅ Task B's dependencies array updated
- ✅ Task B blockingStatus recalculated
- ✅ Task B no longer blocked

---

### Test 29: Assign Task to Unavailable User

**Steps:**
1. Try to assign task to user at max capacity (5 projects)

**Expected Results:**
- ✅ Warning message shown
- ✅ Assignment still allowed (PM decision)
- ✅ Capacity indicator shows overload

---

### Test 30: Empty Required Fields

**Steps:**
1. Open Create Task modal
2. Leave title empty
3. Try to submit

**Expected Results:**
- ✅ Submit button disabled
- ✅ Or validation error shown
- ✅ Form not submitted
- ✅ Error message: "Task title is required"

---

## Test Results Summary

### Backend Tests (10)
- [ ] PM Creates Task (Basic)
- [ ] PM Creates Task with Dependencies
- [ ] PM Updates Task
- [ ] PM Deletes Task with Subtasks
- [ ] PM Toggles Team Leader Permission
- [ ] PM Adds Task Dependency
- [ ] PM Removes Task Dependency
- [ ] Team Leader Creates Subtasks (Enabled)
- [ ] Team Leader Creates Subtasks (Disabled)
- [ ] Member Updates Own Task Status

### Frontend Tests (10)
- [ ] PM Creates Task via Modal
- [ ] PM Edits Existing Task
- [ ] PM Deletes Task
- [ ] PM Toggles Subtask Permission
- [ ] Team Leader Sees Disabled Message
- [ ] Member Views Task with Dependencies
- [ ] Task Blocking Status Display
- [ ] Task List Grouping
- [ ] Task Filters Work
- [ ] Task Search Works

### Real-time Tests (5)
- [ ] Real-time Task Creation
- [ ] Real-time Task Update
- [ ] Real-time Task Deletion
- [ ] Real-time Settings Toggle
- [ ] Real-time Dependency Addition

### Permission Tests (3)
- [ ] PM Access Control
- [ ] Team Leader Permissions
- [ ] Member Permissions

### Edge Cases (5)
- [ ] Circular Dependency Prevention
- [ ] Self-Dependency Prevention
- [ ] Delete Task with Dependencies
- [ ] Assign Task to Unavailable User
- [ ] Empty Required Fields

**Total Tests: 33**

---

## Quick Test Commands

### Backend API Tests (cURL)

**Create Task:**
```bash
curl -X POST http://localhost:5001/api/pm/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"high","storyPoints":8}'
```

**Update Task:**
```bash
curl -X PUT http://localhost:5001/api/pm/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

**Delete Task:**
```bash
curl -X DELETE http://localhost:5001/api/pm/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Toggle Settings:**
```bash
curl -X PUT http://localhost:5001/api/pm/projects/PROJECT_ID/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allowTeamLeaderSubtasks":false}'
```

---

## Common Issues & Solutions

### Issue 1: Socket events not received
**Solution:** Check if user joined org room and project room

### Issue 2: 403 on task creation
**Solution:** Verify PM owns the project

### Issue 3: Dependencies not showing
**Solution:** Ensure tasks are in same project, populate dependencies

### Issue 4: Blocking status not updating
**Solution:** Check dependency status calculation logic

### Issue 5: Modal not closing after submit
**Solution:** Ensure onSuccess callback called

---

## Test Completion Checklist

- [ ] All backend endpoints tested with Postman/cURL
- [ ] All frontend components tested manually
- [ ] Real-time updates working across multiple browsers
- [ ] Permissions enforced correctly for all roles
- [ ] Edge cases handled gracefully
- [ ] Error messages clear and helpful
- [ ] Loading states work correctly
- [ ] Toast notifications appear
- [ ] Socket events emitted and received
- [ ] Database updated correctly
- [ ] No console errors
- [ ] No linting errors

---

**Testing Complete!** All 33 tests passed = Task Management CRUD System fully functional! 🎉

