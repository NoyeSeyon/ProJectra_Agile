# 🧪 Real-Time Features - Comprehensive Testing Guide

## ✅ **Prerequisites**

### **1. Start Backend Server**
```bash
cd server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Server running on port 5001
✅ Socket.io server initialized with event handlers
```

### **2. Start Frontend Server**
```bash
cd client
npm start
```

**Expected Output:**
```
✅ Compiled successfully!
✅ Local: http://localhost:3000
```

### **3. Test Accounts**

| Role | Email | Password |
|------|-------|----------|
| **PM** | pm@projectra.com | pm123 |
| **Member** | member@projectra.com | member123 |
| **Admin** | admin@projectra.com | admin123 |

---

## 📋 **Test Suite**

### **Test 1: Toast Notification System** ⭐

#### **Test 1.1: Basic Toast Display**

**Steps:**
1. Open http://localhost:3000 in browser
2. Login as any user
3. Open browser console (F12)
4. Copy and paste this code:

```javascript
// Import is automatic in the app
// Test all toast types

// Success (Green)
window.dispatchEvent(new CustomEvent('show-toast', {
  detail: { 
    type: 'success', 
    title: 'Success',
    message: 'This is a success message!',
    duration: 5000
  }
}));

// Wait 500ms
setTimeout(() => {
  // Error (Red)
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { 
      type: 'error', 
      title: 'Error',
      message: 'This is an error message!',
      duration: 5000
    }
  }));
}, 500);

// Wait 1000ms
setTimeout(() => {
  // Warning (Orange)
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { 
      type: 'warning', 
      title: 'Warning',
      message: 'This is a warning message!',
      duration: 5000
    }
  }));
}, 1000);

// Wait 1500ms
setTimeout(() => {
  // Info (Blue)
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { 
      type: 'info', 
      title: 'Info',
      message: 'This is an info message!',
      duration: 5000
    }
  }));
}, 1500);
```

**Expected Result:**
```
✅ 4 toasts appear in top-right corner
✅ Success: Green with checkmark icon
✅ Error: Red with X icon
✅ Warning: Orange with triangle icon
✅ Info: Blue with info icon
✅ Each has title and message
✅ Each has close button (X)
✅ Stack vertically with 12px gap
✅ Smooth slide-in animation from right
✅ Auto-dismiss after 5 seconds
```

**Visual Check:**
```
Top-right corner should show:

┌────────────────────────────┐
│ ✓ Success              × │
│   Success message!         │
└────────────────────────────┘
┌────────────────────────────┐
│ ✕ Error                × │
│   Error message!           │
└────────────────────────────┘
┌────────────────────────────┐
│ ⚠ Warning              × │
│   Warning message!         │
└────────────────────────────┘
┌────────────────────────────┐
│ ⓘ Info                 × │
│   Info message!            │
└────────────────────────────┘
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 1.2: Manual Toast Dismissal**

**Steps:**
1. Trigger a toast (use code above)
2. Click the X button on the toast

**Expected Result:**
```
✅ Toast slides out to the right
✅ Toast disappears after animation
✅ Other toasts adjust position smoothly
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 1.3: Auto-Dismiss**

**Steps:**
1. Trigger a toast
2. Wait 5 seconds without clicking

**Expected Result:**
```
✅ Toast automatically slides out after 5 seconds
✅ Smooth exit animation
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 1.4: Multiple Toasts Stacking**

**Steps:**
1. Trigger 10 toasts rapidly:

```javascript
for (let i = 1; i <= 10; i++) {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        type: 'info', 
        message: `Toast #${i}`,
        duration: 10000
      }
    }));
  }, i * 200);
}
```

**Expected Result:**
```
✅ All 10 toasts appear
✅ Stack vertically with consistent spacing
✅ No overlap
✅ Scrollable if too many
✅ Each dismisses independently
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 1.5: Responsive Design**

**Steps:**
1. Trigger a toast
2. Resize browser to mobile width (< 640px)

**Expected Result:**
```
✅ Toast becomes full-width on mobile
✅ Maintains proper margins
✅ Still readable
✅ Close button still accessible
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 2: Socket Connection** 🔌

#### **Test 2.1: Socket Connection on Login**

**Steps:**
1. Open browser console
2. Login to the application
3. Watch console output

**Expected Result:**
```
Console should show:
✅ "Socket connected"
✅ No connection errors
✅ Green "● Live" indicator appears (on Kanban page)
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 2.2: Socket Reconnection**

**Steps:**
1. Login and verify "Socket connected" in console
2. Stop the backend server (Ctrl+C in server terminal)
3. Wait 5 seconds
4. Restart backend server (`npm start`)
5. Watch console

**Expected Result:**
```
✅ "Socket disconnected" appears when server stops
✅ "Socket connected" appears when server restarts
✅ No errors
✅ Automatic reconnection
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 3: Real-Time Kanban Updates** 🎯

#### **Test 3.1: Card Movement Sync**

**Setup:**
- **Browser 1:** Chrome - Login as PM
- **Browser 2:** Firefox/Incognito - Login as Member

**Steps:**
1. Both browsers navigate to `/kanban`
2. Both should see green "● Live" indicator
3. Browser 1: Drag a card from "To Do" to "In Progress"
4. Watch Browser 2

**Expected Result:**
```
✅ Card moves in Browser 2 within 1 second
✅ Smooth animation in both browsers
✅ No flicker or jump
✅ Both browsers show same state
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 3.2: Real-Time Task Creation**

**Setup:**
- **Browser 1:** PM on `/kanban`
- **Browser 2:** Member on `/kanban`

**Steps:**
1. Browser 1: Click "New Task"
2. Browser 1: Create task "Test Real-Time Sync"
3. Browser 1: Click "Create Task"
4. Watch Browser 2

**Expected Result:**
```
✅ New task appears in Browser 2 automatically
✅ Appears in correct column
✅ All details visible (title, description, etc.)
✅ No manual refresh needed
✅ Toast notification in Browser 2: "New task added"
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 3.3: Multiple Users Moving Cards**

**Setup:**
- **Browser 1:** PM
- **Browser 2:** Member
- **Browser 3:** Admin (optional)

**Steps:**
1. All browsers on `/kanban` with "● Live" indicator
2. Browser 1: Move Card A
3. Browser 2: Move Card B (different card)
4. Browser 3: Move Card C (different card)

**Expected Result:**
```
✅ All movements visible in all browsers
✅ No card duplication
✅ No lost updates
✅ Smooth experience
✅ No conflicts
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 4: Real-Time Time Tracking** ⏱️

#### **Test 4.1: Quick Time Log Sync**

**Setup:**
- **Browser 1:** Member on `/kanban`
- **Browser 2:** PM on `/kanban`

**Steps:**
1. Browser 1: Click "+ Log" on a task card
2. Browser 1: Enter 2 hours
3. Browser 1: Click "Log Time"
4. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 shows toast: "Time logged"
✅ Task card updates with new hours
✅ Progress bar updates
✅ Percentage updates
✅ All within 1 second
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 4.2: Time Tracking Page Updates**

**Setup:**
- **Browser 1:** Member on `/member/time-tracking`
- **Browser 2:** PM on `/pm/dashboard`

**Steps:**
1. Browser 1: Log time to a task
2. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 dashboard updates
✅ Project time stats refresh
✅ Team workload updates
✅ Real-time synchronization
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 5: Real-Time Budget Tracking** 💰

#### **Test 5.1: Budget Update Sync**

**Setup:**
- **Browser 1:** PM on `/pm/projects/:projectId`
- **Browser 2:** Member viewing same project

**Steps:**
1. Browser 1: Click "Add Expense"
2. Browser 1: Log expense of $500
3. Browser 1: Submit
4. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 budget updates instantly
✅ Spent amount increases
✅ Remaining amount decreases
✅ Progress bar updates
✅ No page refresh needed
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 5.2: Budget Alert Notification**

**Setup:**
- Project budget: $1000
- Current spent: $750 (75%)
- **Browser 1:** PM
- **Browser 2:** Team Member

**Steps:**
1. Browser 1: Log expense of $100
2. Budget now at 85% (alert threshold)
3. Watch both browsers

**Expected Result:**
```
✅ Both browsers show toast: "Budget at 85% - Warning"
✅ Toast is orange (warning type)
✅ Budget display shows warning color
✅ Alert appears in both browsers simultaneously
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 6: Real-Time Task Assignment** 📋

#### **Test 6.1: Assignment Notification**

**Setup:**
- **Browser 1:** PM on `/pm/dashboard`
- **Browser 2:** Member on `/member/dashboard`

**Steps:**
1. Browser 1: Create a task
2. Browser 1: Assign task to Member
3. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 shows toast: "You've been assigned a new task"
✅ Toast is blue (info type)
✅ Member's task list updates
✅ New task appears in "My Tasks"
✅ Notification badge updates (if implemented)
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 7: Real-Time Subtask Creation** 📝

#### **Test 7.1: Subtask Creation Sync**

**Setup:**
- **Browser 1:** Team Leader on `/member/tasks`
- **Browser 2:** Team Member viewing same project

**Steps:**
1. Browser 1: Click "Create Subtasks" on a main task
2. Browser 1: Create 3 subtasks
3. Browser 1: Assign to different members
4. Browser 1: Submit
5. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 shows toast: "3 subtasks added"
✅ Subtasks appear automatically
✅ Assignment visible
✅ No refresh needed
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 8: Real-Time Project Events** 📁

#### **Test 8.1: Project Creation**

**Setup:**
- **Browser 1:** PM on `/pm/projects`
- **Browser 2:** Admin on `/admin/dashboard`

**Steps:**
1. Browser 1: Create new project
2. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 shows toast: "New project created"
✅ Project list updates
✅ Project count increases
✅ Real-time sync
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 8.2: Project Deletion**

**Setup:**
- **Browser 1:** PM on `/pm/projects`
- **Browser 2:** Member viewing projects

**Steps:**
1. Browser 1: Delete a project
2. Watch Browser 2

**Expected Result:**
```
✅ Browser 2 shows toast: "Project deleted"
✅ Project disappears from list
✅ Smooth removal
✅ No 404 errors
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 9: User Presence** 👥

#### **Test 9.1: User Online Notification**

**Setup:**
- **Browser 1:** PM logged in
- **Browser 2:** Not logged in yet

**Steps:**
1. Browser 2: Login as Member
2. Watch Browser 1

**Expected Result:**
```
✅ Browser 1 receives "user:online" event
✅ User list updates (if implemented)
✅ Online indicator shows (if implemented)
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 9.2: User Offline Notification**

**Setup:**
- **Browser 1:** PM logged in
- **Browser 2:** Member logged in

**Steps:**
1. Browser 2: Logout or close browser
2. Watch Browser 1

**Expected Result:**
```
✅ Browser 1 receives "user:offline" event
✅ User status updates
✅ Offline indicator shows
```

**Status:** [ ] Pass / [ ] Fail

---

### **Test 10: Performance & Scalability** ⚡

#### **Test 10.1: Multiple Rapid Updates**

**Steps:**
1. Open 3 browsers all on `/kanban`
2. Rapidly move 10 cards in different browsers
3. Watch all browsers

**Expected Result:**
```
✅ All updates propagate successfully
✅ No lost updates
✅ No UI lag
✅ Smooth performance
✅ No errors in console
```

**Status:** [ ] Pass / [ ] Fail

---

#### **Test 10.2: Network Latency**

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Perform real-time actions

**Expected Result:**
```
✅ Updates still work (slower)
✅ No connection errors
✅ Graceful degradation
✅ No crashes
```

**Status:** [ ] Pass / [ ] Fail

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: Toasts Not Appearing**

**Symptoms:**
- No toasts show up
- Console error: "Cannot read property 'dispatchEvent'"

**Fix:**
1. Check that `ToastContainer` is in `App.js`
2. Verify import: `import ToastContainer from './components/ToastNotification';`
3. Ensure `<ToastContainer />` is inside `<Router>` but outside `<Routes>`
4. Hard refresh: Ctrl+Shift+R

---

### **Issue 2: Socket Not Connecting**

**Symptoms:**
- Console shows "Socket connection error"
- No "Socket connected" message
- No "● Live" indicator

**Fix:**
1. Check backend is running on port 5001
2. Verify `REACT_APP_SERVER_URL` in `.env`
3. Check CORS configuration in `server/index.js`
4. Clear browser cache
5. Check browser console for errors

---

### **Issue 3: Real-Time Updates Not Working**

**Symptoms:**
- Socket connects but updates don't appear
- No toast notifications for events

**Fix:**
1. Check user is logged in
2. Verify organization ID is set
3. Check browser console for Socket events
4. Ensure both users are in same organization
5. Check backend logs for event emissions

---

### **Issue 4: "● Live" Indicator Not Showing**

**Symptoms:**
- Socket connected but indicator missing

**Fix:**
1. Navigate to `/kanban` page
2. Check `connected` prop in `useSocket()`
3. Verify `SocketContext` is providing `connected` value
4. Check Kanban.js uses `connected` prop

---

### **Issue 5: Toasts Stacking Incorrectly**

**Symptoms:**
- Toasts overlap
- Layout issues

**Fix:**
1. Check `ToastNotification.css` is loaded
2. Verify `z-index: 10000` on `.toast-container`
3. Clear browser cache
4. Check for CSS conflicts

---

## 📊 **Test Results Summary**

After completing all tests, fill this out:

```
✅ REAL-TIME FEATURES TEST RESULTS

Toast Notification System:
  ☐ Basic Display           [ ] Pass / [ ] Fail
  ☐ Manual Dismissal        [ ] Pass / [ ] Fail
  ☐ Auto-Dismiss            [ ] Pass / [ ] Fail
  ☐ Multiple Stacking       [ ] Pass / [ ] Fail
  ☐ Responsive Design       [ ] Pass / [ ] Fail

Socket Connection:
  ☐ Connection on Login     [ ] Pass / [ ] Fail
  ☐ Reconnection            [ ] Pass / [ ] Fail

Real-Time Kanban:
  ☐ Card Movement Sync      [ ] Pass / [ ] Fail
  ☐ Task Creation           [ ] Pass / [ ] Fail
  ☐ Multiple Users          [ ] Pass / [ ] Fail

Real-Time Time Tracking:
  ☐ Quick Log Sync          [ ] Pass / [ ] Fail
  ☐ Page Updates            [ ] Pass / [ ] Fail

Real-Time Budget:
  ☐ Budget Update Sync      [ ] Pass / [ ] Fail
  ☐ Alert Notification      [ ] Pass / [ ] Fail

Real-Time Task Assignment:
  ☐ Assignment Notification [ ] Pass / [ ] Fail

Real-Time Subtasks:
  ☐ Creation Sync           [ ] Pass / [ ] Fail

Real-Time Projects:
  ☐ Project Creation        [ ] Pass / [ ] Fail
  ☐ Project Deletion        [ ] Pass / [ ] Fail

User Presence:
  ☐ Online Notification     [ ] Pass / [ ] Fail
  ☐ Offline Notification    [ ] Pass / [ ] Fail

Performance:
  ☐ Multiple Updates        [ ] Pass / [ ] Fail
  ☐ Network Latency         [ ] Pass / [ ] Fail

Overall Status: [ ] All Pass / [ ] Some Failures

Total Tests: 23
Passed: ___
Failed: ___

Success Rate: ____%
```

---

## ✅ **Success Criteria**

**Phase 11 is working if:**

1. ✅ All 4 toast types display correctly
2. ✅ Toasts auto-dismiss after 5 seconds
3. ✅ Socket connects on login
4. ✅ "● Live" indicator shows on Kanban
5. ✅ Card movements sync across browsers
6. ✅ Time logging updates in real-time
7. ✅ Budget updates sync instantly
8. ✅ Task assignments show notifications
9. ✅ No console errors
10. ✅ Performance is smooth

**If all 10 criteria met → Phase 11 is production-ready!** 🚀

---

## 🎯 **Priority Tests**

**Minimum tests for basic validation:**

1. **Test 1.1** - Basic Toast Display
2. **Test 2.1** - Socket Connection
3. **Test 3.1** - Card Movement Sync
4. **Test 4.1** - Time Log Sync

**If these 4 pass → Core functionality works!**

---

## 📝 **Notes**

- Test in different browsers (Chrome, Firefox, Edge)
- Test on different devices (Desktop, Mobile)
- Test with poor network conditions
- Monitor backend logs during tests
- Check browser console for errors

---

**Happy Testing!** 🧪

