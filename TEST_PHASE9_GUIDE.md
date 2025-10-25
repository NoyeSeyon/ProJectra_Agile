# 🧪 Phase 9 Testing Guide - Complete Test Plan

## 📋 Testing Checklist

This guide will help you test all Phase 9 features systematically.

---

## 🎯 **Pre-Test Setup**

### **1. Start the Backend Server**
```bash
cd server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Email service initialized successfully
✅ Server running on port 5001
✅ Socket.io server initialized
```

### **2. Start the Frontend Server**
```bash
cd client
npm start
```

**Expected Output:**
```
✅ Compiled successfully!
✅ webpack compiled with 0 errors
✅ Local: http://localhost:3000
```

### **3. Test Accounts**

Use these accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@projectra.com | SuperAdmin@123 |
| **Admin** | admin@projectra.com | admin123 |
| **PM** | pm@projectra.com | pm123 |
| **Member** | member@projectra.com | member123 |

---

## 📝 **Test Suite**

### **Test 1: Login Redirects** ⭐ CRITICAL

Test that each role redirects to the correct dashboard.

#### **1.1 Super Admin Login Redirect**
**Steps:**
1. Open http://localhost:3000/login
2. Login with: `superadmin@projectra.com` / `SuperAdmin@123`
3. Click "Sign in"

**Expected Results:**
- ✅ URL changes to: `/super-admin/dashboard`
- ✅ SuperAdminLayout visible (dark theme)
- ✅ Header shows "Super Admin Dashboard"
- ✅ No errors in console

**Status:** [ ] Pass / [ ] Fail

---

#### **1.2 Admin Login Redirect**
**Steps:**
1. Logout (if logged in)
2. Open http://localhost:3000/login
3. Login with: `admin@projectra.com` / `admin123`
4. Click "Sign in"

**Expected Results:**
- ✅ URL changes to: `/admin/dashboard`
- ✅ AdminLayout visible (blue theme)
- ✅ Organization name in header (e.g., "EventAuro")
- ✅ Sidebar shows: Dashboard, PM Management, Users, Kanban Board, Analytics, Settings

**Status:** [ ] Pass / [ ] Fail

---

#### **1.3 PM Login Redirect**
**Steps:**
1. Logout
2. Open http://localhost:3000/login
3. Login with: `pm@projectra.com` / `pm123`
4. Click "Sign in"

**Expected Results:**
- ✅ URL changes to: `/pm/dashboard`
- ✅ PMLayout visible (indigo theme)
- ✅ Company name in header (e.g., "EventAuro")
- ✅ PM name in header
- ✅ Sidebar shows: Dashboard, My Projects, My Team, Kanban Board, Analytics, Settings

**Status:** [ ] Pass / [ ] Fail

---

#### **1.4 Member/Team Leader Login Redirect**
**Steps:**
1. Logout
2. Open http://localhost:3000/login
3. Login with: `member@projectra.com` / `member123`
4. Click "Sign in"

**Expected Results:**
- ✅ URL changes to: `/member/dashboard`
- ✅ MemberLayout visible (teal/green theme)
- ✅ User avatar/initials visible
- ✅ Project capacity shown (e.g., "0/5 Projects")
- ✅ Sidebar shows: Dashboard, My Projects, My Tasks, Kanban Board, Team, Time Tracking, Settings

**Status:** [ ] Pass / [ ] Fail

---

### **Test 2: Admin Kanban Access** 🎯

#### **2.1 Admin Kanban Navigation**
**Steps:**
1. Login as Admin
2. Click "Kanban Board" in sidebar
3. Wait for page to load

**Expected Results:**
- ✅ URL changes to: `/admin/kanban`
- ✅ AdminLayout persists (blue theme)
- ✅ Kanban board loads successfully
- ✅ Header shows "Kanban Board"
- ✅ Green "● Live" indicator visible in header
- ✅ "Kanban Board" menu item is highlighted
- ✅ Columns visible: To Do, In Progress, Review, Completed

**Status:** [ ] Pass / [ ] Fail

---

#### **2.2 Admin Kanban Functionality**
**Steps:**
1. On Admin Kanban page
2. Click "New Task" button
3. Create a test task
4. Try dragging a card to another column

**Expected Results:**
- ✅ Task creation modal opens
- ✅ Can create new task
- ✅ Task appears in correct column
- ✅ Drag & drop works smoothly
- ✅ Status updates after drop
- ✅ Real-time updates (if testing with 2 browsers)

**Status:** [ ] Pass / [ ] Fail

---

### **Test 3: PM Kanban Access** 🎯

#### **3.1 PM Kanban Navigation**
**Steps:**
1. Login as PM
2. Click "Kanban Board" in sidebar
3. Wait for page to load

**Expected Results:**
- ✅ URL changes to: `/pm/kanban`
- ✅ PMLayout persists (indigo theme)
- ✅ Kanban board loads successfully
- ✅ Green "● Live" indicator visible
- ✅ "Kanban Board" menu item is highlighted
- ✅ All Kanban features accessible

**Status:** [ ] Pass / [ ] Fail

---

#### **3.2 PM Kanban Time Logging**
**Steps:**
1. On PM Kanban page
2. Find any task card
3. Click "+ Log" button on a card
4. Enter time (e.g., 2 hours)
5. Add description (optional)
6. Click "Log Time"

**Expected Results:**
- ✅ Quick Time Log modal opens
- ✅ Task details visible
- ✅ Quick hour buttons work (1h, 2h, 4h, 8h)
- ✅ Can enter custom hours
- ✅ Time logs successfully
- ✅ Modal closes
- ✅ Card updates with new logged hours
- ✅ Progress bar updates

**Status:** [ ] Pass / [ ] Fail

---

### **Test 4: Member/Team Leader Kanban Access** 🎯

#### **4.1 Member Kanban Navigation**
**Steps:**
1. Login as Member
2. Click "Kanban Board" in sidebar
3. Wait for page to load

**Expected Results:**
- ✅ URL changes to: `/member/kanban`
- ✅ MemberLayout persists (teal theme)
- ✅ Kanban board loads successfully
- ✅ Green "● Live" indicator visible
- ✅ "Kanban Board" menu item is highlighted
- ✅ Can see assigned tasks

**Status:** [ ] Pass / [ ] Fail

---

#### **4.2 Team Leader Badge Verification**
**Steps:**
1. Login as a user who is a Team Leader
2. Navigate to `/member/dashboard`
3. Check for Team Leader badge

**Expected Results:**
- ✅ "Team Leader" badge visible in header or sidebar
- ✅ Badge has distinct styling (e.g., yellow/gold)
- ✅ Regular members don't see this badge

**Status:** [ ] Pass / [ ] Fail

---

### **Test 5: Navigation Menu Verification** 📋

#### **5.1 Admin Navigation**
**Steps:**
1. Login as Admin
2. Check sidebar menu items

**Expected Menu Items:**
- ✅ Dashboard
- ✅ PM Management
- ✅ User Management
- ✅ Kanban Board ⭐ NEW
- ✅ Analytics
- ✅ Settings
- ✅ Logout button

**Status:** [ ] Pass / [ ] Fail

---

#### **5.2 PM Navigation**
**Steps:**
1. Login as PM
2. Check sidebar menu items

**Expected Menu Items:**
- ✅ Dashboard
- ✅ My Projects
- ✅ My Team
- ✅ Kanban Board ⭐ NEW
- ✅ Analytics
- ✅ Settings
- ✅ Logout button

**Status:** [ ] Pass / [ ] Fail

---

#### **5.3 Member/Team Leader Navigation**
**Steps:**
1. Login as Member
2. Check sidebar menu items

**Expected Menu Items:**
- ✅ Dashboard
- ✅ My Projects
- ✅ My Tasks
- ✅ Kanban Board ⭐ NEW
- ✅ Team
- ✅ Time Tracking
- ✅ Settings
- ✅ Logout button

**Status:** [ ] Pass / [ ] Fail

---

### **Test 6: Route Guard Security** 🔒

#### **6.1 Unauthorized Admin Access**
**Steps:**
1. Login as Member
2. Manually navigate to: http://localhost:3000/admin/dashboard
3. Press Enter

**Expected Results:**
- ✅ Access denied (no admin dashboard shown)
- ✅ Redirected to `/dashboard` or appropriate page
- ✅ No errors in console
- ✅ User remains logged in

**Status:** [ ] Pass / [ ] Fail

---

#### **6.2 Unauthorized PM Access**
**Steps:**
1. Login as Member
2. Manually navigate to: http://localhost:3000/pm/dashboard
3. Press Enter

**Expected Results:**
- ✅ Access denied
- ✅ Redirected to appropriate page
- ✅ No errors

**Status:** [ ] Pass / [ ] Fail

---

#### **6.3 Unauthorized Member Access**
**Steps:**
1. Login as Admin
2. Manually navigate to: http://localhost:3000/member/dashboard
3. Press Enter

**Expected Results:**
- ✅ Access denied
- ✅ Redirected to appropriate page
- ✅ No errors

**Status:** [ ] Pass / [ ] Fail

---

### **Test 7: Real-Time Kanban Collaboration** 🔄

#### **7.1 Two-Browser Real-Time Test**
**Setup:**
- Open Chrome: Login as PM
- Open Firefox (or Incognito): Login as Member

**Steps:**
1. Both navigate to their respective Kanban boards
   - Chrome (PM): `/pm/kanban`
   - Firefox (Member): `/member/kanban`
2. Both should see green "● Live" indicator
3. In Chrome (PM): Drag a card from "To Do" to "In Progress"
4. Watch Firefox (Member) window

**Expected Results:**
- ✅ Both see "● Live" indicator
- ✅ Card moves in Firefox immediately (within 1 second)
- ✅ No page refresh needed
- ✅ Smooth animation in both windows
- ✅ No errors in either console

**Status:** [ ] Pass / [ ] Fail

---

#### **7.2 New Task Real-Time Sync**
**Setup:**
- Chrome: PM on `/pm/kanban`
- Firefox: Member on `/member/kanban`

**Steps:**
1. In Chrome: Click "New Task"
2. Create a task: "Test Real-Time Sync"
3. Click "Create Task"
4. Watch Firefox window

**Expected Results:**
- ✅ New task appears in Firefox automatically
- ✅ Appears in correct column
- ✅ All details visible (title, description, etc.)
- ✅ No manual refresh needed

**Status:** [ ] Pass / [ ] Fail

---

### **Test 8: Active Navigation Highlighting** 🎨

#### **8.1 Navigation Active State**
**Steps:**
1. Login as any role
2. Click each menu item in sequence
3. Observe the active state

**Expected Results:**
- ✅ Active menu item has distinct highlight
- ✅ Active item has different background color
- ✅ Icon color changes for active item
- ✅ Text color changes for active item
- ✅ Only one item active at a time
- ✅ Highlighting persists on page refresh

**Status:** [ ] Pass / [ ] Fail

---

### **Test 9: Backward Compatibility** 🔄

#### **9.1 Generic Kanban Route**
**Steps:**
1. Login as any role
2. Manually navigate to: http://localhost:3000/kanban
3. Press Enter

**Expected Results:**
- ✅ Kanban board loads
- ✅ Uses generic Layout (not role-specific)
- ✅ All features work
- ✅ Real-time features work

**Status:** [ ] Pass / [ ] Fail

---

### **Test 10: Responsive Design** 📱

#### **10.1 Mobile Navigation**
**Steps:**
1. Login as any role
2. Resize browser to mobile width (< 768px)
3. Check sidebar behavior

**Expected Results:**
- ✅ Sidebar collapses or becomes hamburger menu
- ✅ Toggle button appears
- ✅ Can expand/collapse sidebar
- ✅ All menu items accessible
- ✅ Layout doesn't break

**Status:** [ ] Pass / [ ] Fail

---

### **Test 11: Performance** ⚡

#### **11.1 Page Load Times**
**Steps:**
1. Login as any role
2. Open browser DevTools (F12)
3. Go to Network tab
4. Click "Kanban Board" in navigation
5. Check load time

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ No failed network requests
- ✅ No 404 errors
- ✅ No console errors

**Status:** [ ] Pass / [ ] Fail

---

### **Test 12: Browser Compatibility** 🌐

#### **12.1 Cross-Browser Testing**
**Browsers to Test:**
- [ ] Chrome (recommended)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

**For Each Browser:**
1. Login as Admin
2. Navigate to `/admin/kanban`
3. Test drag & drop
4. Test real-time updates (with second browser)

**Expected Results:**
- ✅ All features work in all browsers
- ✅ Consistent UI appearance
- ✅ Real-time sync works
- ✅ No browser-specific errors

**Status:** [ ] Pass / [ ] Fail

---

## 📊 **Test Results Summary**

Fill this out after testing:

| Test Suite | Status | Notes |
|------------|--------|-------|
| 1. Login Redirects | [ ] Pass / [ ] Fail | |
| 2. Admin Kanban | [ ] Pass / [ ] Fail | |
| 3. PM Kanban | [ ] Pass / [ ] Fail | |
| 4. Member Kanban | [ ] Pass / [ ] Fail | |
| 5. Navigation Menus | [ ] Pass / [ ] Fail | |
| 6. Route Guards | [ ] Pass / [ ] Fail | |
| 7. Real-Time Sync | [ ] Pass / [ ] Fail | |
| 8. Active Highlighting | [ ] Pass / [ ] Fail | |
| 9. Backward Compatibility | [ ] Pass / [ ] Fail | |
| 10. Responsive Design | [ ] Pass / [ ] Fail | |
| 11. Performance | [ ] Pass / [ ] Fail | |
| 12. Browser Compatibility | [ ] Pass / [ ] Fail | |

**Overall Status:** [ ] All Pass / [ ] Some Failures

---

## 🐛 **Bug Reporting Template**

If you find any issues, report them using this format:

```
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
[Paste any console errors]

**Screenshot:**
[Attach if relevant]

**Browser:** [Chrome/Firefox/etc.]
**Role:** [Admin/PM/Member/etc.]
```

---

## ✅ **Quick Test Checklist**

**Minimum tests to run:**

- [ ] Login as Admin → Click Kanban Board → URL is `/admin/kanban`
- [ ] Login as PM → Click Kanban Board → URL is `/pm/kanban`
- [ ] Login as Member → Click Kanban Board → URL is `/member/kanban`
- [ ] All 3 roles see green "● Live" indicator
- [ ] Drag & drop works in all 3 Kanban views
- [ ] Real-time sync works (test with 2 browsers)
- [ ] Navigation highlighting works
- [ ] Route guards block unauthorized access

**If all 8 checks pass, Phase 9 is working correctly!** ✅

---

## 🚀 **Ready to Test!**

Start testing with **Test 1: Login Redirects** and work your way through the test suite.

**Good luck!** 🎯

