# 🧪 Kanban Board Testing Guide

## ❌ Problem: "No tasks in this column"

**Root Cause:** You don't have any tasks created yet!

---

## ✅ Solution: Create Tasks First

### **Option 1: Create Tasks via PM Project Detail Page (RECOMMENDED)**

1. **Navigate to your project:**
   - Go to **PM Dashboard** → Click on a project card
   - OR go to **My Projects** → Click on a project

2. **Create a task:**
   - Click the **"Create Task"** button (Plus icon)
   - Fill in:
     - Title: "Test Task 1"
     - Description: "Testing Kanban board"
     - Assignee: Select a team member
     - Priority: Medium
     - Status: To Do
   - Click **Save**

3. **Verify:**
   - The task should appear in the PM Project Detail page
   - Now go to **Kanban Board** and refresh
   - The task should appear in the "To Do" column

---

### **Option 2: Create Tasks via API (Quick Test)**

**Open Browser Console** (F12) and run this script:

```javascript
// Step 1: Get your projects
fetch('/api/pm/projects', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Your Projects:', data.projects);
  
  // Step 2: Create a task for the first project
  if (data.projects && data.projects.length > 0) {
    const projectId = data.projects[0]._id;
    console.log(`📝 Creating task for project: ${projectId}`);
    
    return fetch(`/api/pm/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Kanban Task',
        description: 'This is a test task for the Kanban board',
        priority: 'medium',
        status: 'todo'
      })
    });
  } else {
    console.error('❌ No projects found! Create a project first.');
  }
})
.then(r => r?.json())
.then(data => {
  if (data) {
    console.log('✅ Task created:', data);
    alert('Task created! Refresh the Kanban board.');
  }
})
.catch(err => console.error('❌ Error:', err));
```

---

## 🔍 Debug: Check What's Happening

**Open Browser Console (F12)** on the Kanban page and look for these logs:

```javascript
// Should see:
🔄 Loading tasks for user: pm
📋 PM Projects: X        // Number of projects
✅ Total PM tasks loaded: X  // Number of tasks
```

### **If you see "0 PM Projects":**
- You need to create a project first!
- Go to: **PM Dashboard** → Click **"New Project"**

### **If you see "0 Total PM tasks loaded":**
- You have projects but no tasks
- Follow **Option 1** or **Option 2** above to create tasks

---

## 📊 Complete Test Flow

### **1. Create a Project (if you don't have one)**
```
PM Dashboard → New Project button
- Name: "Test Project"
- Description: "For testing Kanban"
- Start Date: Today
- End Date: 1 month from now
- Status: Planning
- Click Create
```

### **2. Add Team Members to Project**
```
PM Dashboard → Click project card
→ Scroll to "Team Management" section
→ Click "Add Member"
→ Select members
→ Click Save
```

### **3. Create Multiple Tasks**
```
PM Project Detail Page → "Create Task" button
Create 3-4 tasks with different statuses:

Task 1:
- Title: "Setup Database"
- Status: To Do
- Priority: High

Task 2:
- Title: "Build UI Components"
- Status: In Progress
- Priority: Medium

Task 3:
- Title: "Write Tests"
- Status: Review
- Priority: Low

Task 4:
- Title: "Deploy to Production"
- Status: Completed
- Priority: Urgent
```

### **4. Test Kanban Board**
```
Navigate to: Kanban Board
Expected Result:
- To Do column: 1 task
- In Progress column: 1 task
- Review column: 1 task
- Completed column: 1 task
```

### **5. Test Drag and Drop**
```
- Drag "Setup Database" from "To Do" to "In Progress"
- Expected: Task moves smoothly
- Console shows: "📡 Card moved via socket"
```

### **6. Test New Task Creation**
```
Click "New Task" button on Kanban
- Select Project: Should show your projects
- Select Assignee: Should show team members (after selecting project)
- Fill in title, priority
- Click Save
- Expected: Task appears in "To Do" column immediately
```

---

## 🐛 Common Errors & Fixes

### **Error: "Cannot read property 'projects' of undefined"**
**Fix:** You're not logged in as PM. Verify role:
```javascript
// In console:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current role:', user?.role);
// Should be "pm"
```

### **Error: "404 Not Found - /api/pm/projects"**
**Fix:** Backend routes not registered. Check `server/index.js`:
```javascript
// Should have:
app.use('/api/pm', require('./routes/pm'));
```

### **Error: "403 Forbidden"**
**Fix:** User doesn't have permission. Check User model for `hasPermission` method.

### **Projects dropdown is empty in "New Task" modal**
**Fix:** 
1. Check console for "✅ PM Projects loaded: X"
2. If X = 0, create a project first
3. Refresh the page after creating project

### **Users dropdown is empty in "New Task" modal**
**Fix:**
1. First select a project
2. The users dropdown loads AFTER project selection
3. Make sure the project has team members added

---

## ✅ Verification Checklist

- [ ] Logged in as **PM**
- [ ] Have at least **1 project** created
- [ ] Project has **team members** added
- [ ] Created at least **1 task** via PM Project Detail
- [ ] Kanban board loads without errors
- [ ] Can see tasks in correct columns
- [ ] Can drag tasks between columns
- [ ] "New Task" button opens modal
- [ ] Projects dropdown shows projects
- [ ] Users dropdown shows members (after selecting project)
- [ ] Can create new task from Kanban
- [ ] Task appears immediately after creation

---

## 🎯 Quick Fix Summary

**The main issue is:** You need to create tasks first!

**Steps:**
1. Go to PM Dashboard
2. Click on a project (or create one if you don't have any)
3. Click "Create Task" button
4. Fill in task details and save
5. Go back to Kanban Board
6. Tasks should now appear!

---

## 📞 Still Having Issues?

**Check these in order:**

1. **Console Logs** (F12 → Console tab)
   - Look for error messages
   - Check what the API calls are returning

2. **Network Tab** (F12 → Network tab)
   - See which API calls are failing
   - Check response status codes

3. **Redux DevTools** or **React DevTools**
   - Inspect the component state
   - Check if `tasks` array is empty

---

**🚀 After following these steps, your Kanban board will be fully functional!**

