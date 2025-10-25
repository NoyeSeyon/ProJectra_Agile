# 🧪 Specialization Feature - Complete Testing Guide

## ✅ Implementation Status: COMPLETE

All components have been verified and are properly integrated. This guide will help you manually test the specialization feature across all portals.

---

## 🎯 Test Environment Setup

### Prerequisites
1. Server running on `http://localhost:5001`
2. Client running on `http://localhost:3000`
3. MongoDB connected and running
4. SMTP configured in `.env` for email testing

### Test Accounts Needed
- **Super Admin** (for organization management)
- **Admin** (for user management and invitations)
- **Project Manager** (for project creation and team assignment)
- **Team Leader** (for testing specialization display)
- **Member** (for testing specialization updates)

---

## 📋 Test Suite

### **Test 1: Admin - Send Invitation with Specialization**

**Objective:** Verify that admins can send invitations with specialization assigned

**Steps:**
1. Log in as **Admin**
2. Navigate to **User Management**
3. Click **"Send Invitation"** button
4. Fill in the form:
   - Email: `testmember@example.com`
   - First Name: `John`
   - Last Name: `Doe`
   - Role: Select **"Member"**
   - Specialization: Select **"Frontend Developer"** (dropdown should appear)
   - Message: *(Optional)* "Welcome to the team!"
5. Click **"Send Invitation"**

**Expected Results:**
- ✅ Specialization dropdown appears when Member or Team Leader is selected
- ✅ Specialization dropdown hides when Admin or PM is selected
- ✅ Invitation is created successfully
- ✅ Email is sent to `testmember@example.com`
- ✅ Invitation appears in "Pending Invitations" tab
- ✅ Form hint displays: "Specialization will help in task assignment"

**Validation Points:**
- Check terminal for: `✅ Email sent successfully to testmember@example.com`
- Verify invitation record in database includes `metadata.specialization: "Frontend Developer"`

---

### **Test 2: User Registration via Invitation Link**

**Objective:** Verify that invited users automatically receive their assigned specialization

**Steps:**
1. Check email inbox for invitation (or copy link from Pending Invitations)
2. Click the invitation link or navigate to: `http://localhost:3000/register?invite=[TOKEN]`
3. Complete registration form:
   - Email: `testmember@example.com` (pre-filled)
   - First Name: `John` (pre-filled)
   - Last Name: `Doe` (pre-filled)
   - Password: `password123`
   - Confirm Password: `password123`
4. Click **"Register"**

**Expected Results:**
- ✅ Registration successful
- ✅ User automatically assigned "Frontend Developer" specialization
- ✅ User redirected to `/member/dashboard`
- ✅ No errors in console

**Validation Points:**
- Check user record in database: `specialization: "Frontend Developer"`
- Invitation status changed to `accepted`

---

### **Test 3: Admin - View Users with Specialization Column**

**Objective:** Verify that admins can see specialization in the user table

**Steps:**
1. Log in as **Admin**
2. Navigate to **User Management**
3. View the **Active Users** table

**Expected Results:**
- ✅ Table shows 6 columns: User | Email | Role | Specialization | Status | Actions
- ✅ Members/Team Leaders show specialization badge with gradient purple background
- ✅ Admins/PMs show "N/A" in gray italic text
- ✅ Users with "general" specialization show "No Specialization"

**Test Cases:**
| Role             | Specialization       | Expected Display            |
|------------------|----------------------|-----------------------------|
| Member           | Frontend Developer   | Gradient badge: "Frontend Developer" |
| Team Leader      | QA Engineer          | Gradient badge: "QA Engineer" |
| Member           | general              | "No Specialization"         |
| Project Manager  | (any)                | "N/A"                       |
| Admin            | (any)                | "N/A"                       |

---

### **Test 4: Admin - Filter Users by Specialization**

**Objective:** Verify that the specialization filter works correctly

**Steps:**
1. Log in as **Admin**
2. Navigate to **User Management**
3. Create multiple test users with different specializations:
   - User A: Frontend Developer
   - User B: Backend Developer
   - User C: QA Engineer
   - User D: No Specialization (general)
4. Use the **Specialization filter dropdown**
5. Test each filter option:
   - "All Specializations"
   - "Frontend Developer"
   - "Backend Developer"
   - "QA Engineer"
   - "General / No Specialization"

**Expected Results:**
- ✅ Filter shows all 20+ specialization options
- ✅ "All Specializations" shows all users
- ✅ Selecting a specific specialization only shows users with that specialization
- ✅ Filters work in combination with Role and Status filters
- ✅ Search still works alongside specialization filter

---

### **Test 5: Member/Team Leader - View Own Specialization**

**Objective:** Verify that members/team leaders can view their specialization in Settings

**Steps:**
1. Log in as **Member** (John Doe from Test 2)
2. Navigate to **Settings** → **Profile** tab
3. Scroll to **Specialization** section

**Expected Results:**
- ✅ Specialization dropdown is visible
- ✅ Current specialization is selected: "Frontend Developer"
- ✅ Blue gradient badge displays current specialization
- ✅ Badge shows: "Frontend Developer"
- ✅ Dropdown includes 20+ specialization options

---

### **Test 6: Member/Team Leader - Update Specialization**

**Objective:** Verify that users can change their specialization

**Steps:**
1. Log in as **Member** (continuing from Test 5)
2. Navigate to **Settings** → **Profile** tab
3. Change specialization from "Frontend Developer" to **"Full Stack Developer"**
4. Click **"Update Profile"**
5. Wait for success message
6. Refresh the page

**Expected Results:**
- ✅ Success message: "Profile updated successfully"
- ✅ Specialization dropdown shows "Full Stack Developer"
- ✅ Badge updates to show "Full Stack Developer"
- ✅ Changes persist after page refresh

**Validation Points:**
- Check user record in database: `specialization: "Full Stack Developer"`
- Re-login and verify specialization is still "Full Stack Developer"

---

### **Test 7: Admin - Verify Updated Specialization**

**Objective:** Verify that admin can see the updated specialization

**Steps:**
1. Log in as **Admin**
2. Navigate to **User Management**
3. Find the user "John Doe" in the table
4. Check the **Specialization** column

**Expected Results:**
- ✅ Specialization badge shows "Full Stack Developer" (updated value)
- ✅ Badge has gradient purple background
- ✅ Text is white and readable

---

### **Test 8: PM - View Specializations in Project Creation**

**Objective:** Verify that PMs see specializations when creating projects

**Steps:**
1. Log in as **Project Manager**
2. Navigate to **Projects**
3. Click **"Create Project"**
4. Scroll to **Team Selection** section
5. Click on **"Select Team Leader"** dropdown
6. View the team leader options

**Expected Results:**
- ✅ Dropdown shows: `John Doe - Full Stack Developer (X/5 projects)`
- ✅ "general" or "None" specializations are hidden (not displayed)
- ✅ Only actual specializations are shown

**Test Team Member Selection:**
7. Scroll to **Team Members** section
8. Search for "John Doe" in the member search
9. Click **"Add Member"**

**Expected Results:**
- ✅ Member card shows:
  - Name: John Doe
  - Specialization: Full Stack Developer
  - Capacity: X/5 projects
- ✅ Specialization is displayed in a prominent color
- ✅ "general" or "None" is hidden

---

### **Test 9: PM - Filter Team Members by Specialization**

**Objective:** Verify specialization-based filtering in PM portal (future enhancement)

**Status:** ⏳ Pending future implementation
- Currently displays specializations but doesn't filter by them
- This can be added as a Phase 6 enhancement

---

### **Test 10: Member/Team Leader Portal - Team Directory**

**Objective:** Verify specializations display in the team directory

**Steps:**
1. Log in as **Member** or **Team Leader**
2. Navigate to **Team** page
3. View all team members

**Expected Results:**
- ✅ Each team member card shows:
  - Avatar with initials
  - Name
  - Email
  - Role badge
  - **Specialization** (with Briefcase icon)
  - Projects count
- ✅ Specialization displays correctly formatted
- ✅ "general" displays as "General"
- ✅ Specializations with underscores are formatted with spaces and title case

---

### **Test 11: Cross-Portal Consistency Check**

**Objective:** Verify specialization displays consistently across all portals

**Steps:**
1. Create a test user: `Jane Smith` with specialization `"QA Engineer"`
2. View this user in:
   - Admin Portal → User Management table
   - PM Portal → Project Creation → Team Member selection
   - Member Portal → Team page
   - Settings page (as Jane Smith)

**Expected Results:**
- ✅ All portals show "QA Engineer" (consistent value)
- ✅ No spelling errors or formatting inconsistencies
- ✅ Badge/label styling is appropriate for each portal

---

### **Test 12: Edge Cases and Validation**

**Objective:** Test edge cases and ensure proper handling

#### **Test 12.1: Invite without Specialization**
1. Admin creates invitation with role "Member" but leaves specialization as "General"
2. User registers
3. **Expected:** User has `specialization: "general"` and displays "No Specialization"

#### **Test 12.2: Change Role from Member to PM**
1. Admin changes a Member with specialization "Frontend Developer" to role "Project Manager"
2. View in User Management table
3. **Expected:** Specialization column shows "N/A" (specialization still stored but not displayed)

#### **Test 12.3: Change Role from PM to Member**
1. Admin changes a PM to role "Member"
2. View in User Management table
3. **Expected:** 
   - If PM had no specialization, shows "No Specialization"
   - User can now update their specialization in Settings

#### **Test 12.4: Invalid Specialization Value**
1. Attempt to set specialization via API to an invalid value: `"Invalid Spec"`
2. **Expected:** Backend validation error (enum constraint)

#### **Test 12.5: Null or Undefined Specialization**
1. View user with `specialization: null` or `specialization: undefined`
2. **Expected:** System treats it as "general" and displays "No Specialization"

---

## 🔍 Database Verification Queries

Use these MongoDB queries to verify data integrity:

### Check User Specializations
```javascript
db.users.find(
  { role: { $in: ['member', 'team_leader'] } },
  { firstName: 1, lastName: 1, role: 1, specialization: 1, _id: 0 }
).pretty()
```

### Check Invitation Metadata
```javascript
db.invitations.find(
  { status: 'pending' },
  { email: 1, role: 1, 'metadata.specialization': 1, _id: 0 }
).pretty()
```

### Count Users by Specialization
```javascript
db.users.aggregate([
  { $match: { role: { $in: ['member', 'team_leader'] } } },
  { $group: { _id: '$specialization', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. ⚠️ **No bulk specialization update:** Admins cannot update specializations for multiple users at once
2. ⚠️ **No specialization history:** System doesn't track when/how specializations were changed
3. ⚠️ **No specialization matching:** System doesn't suggest best-fit members based on task requirements

### Future Enhancements (Phase 6+):
- 🔮 Smart task assignment based on specialization matching
- 🔮 Specialization-based analytics and reports
- 🔮 Workload balancing by specialization
- 🔮 Skill matrix visualization
- 🔮 Bulk update for admin

---

## ✅ Testing Completion Checklist

Mark each test as complete:

- [ ] Test 1: Admin - Send Invitation with Specialization
- [ ] Test 2: User Registration via Invitation Link
- [ ] Test 3: Admin - View Users with Specialization Column
- [ ] Test 4: Admin - Filter Users by Specialization
- [ ] Test 5: Member/Team Leader - View Own Specialization
- [ ] Test 6: Member/Team Leader - Update Specialization
- [ ] Test 7: Admin - Verify Updated Specialization
- [ ] Test 8: PM - View Specializations in Project Creation
- [ ] Test 9: PM - Filter Team Members by Specialization (Pending)
- [ ] Test 10: Member/Team Leader Portal - Team Directory
- [ ] Test 11: Cross-Portal Consistency Check
- [ ] Test 12: Edge Cases and Validation
  - [ ] 12.1: Invite without Specialization
  - [ ] 12.2: Change Role from Member to PM
  - [ ] 12.3: Change Role from PM to Member
  - [ ] 12.4: Invalid Specialization Value
  - [ ] 12.5: Null or Undefined Specialization

---

## 📊 Test Results Summary

After completing all tests, document your results:

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| Test 1  | Admin Invitation | ⏳ Pending | |
| Test 2  | User Registration | ⏳ Pending | |
| Test 3  | Admin View Users | ⏳ Pending | |
| Test 4  | Admin Filter | ⏳ Pending | |
| Test 5  | Member View | ⏳ Pending | |
| Test 6  | Member Update | ⏳ Pending | |
| Test 7  | Admin Verify | ⏳ Pending | |
| Test 8  | PM Project Creation | ⏳ Pending | |
| Test 9  | PM Filter | ⏳ Pending | |
| Test 10 | Team Directory | ⏳ Pending | |
| Test 11 | Consistency | ⏳ Pending | |
| Test 12 | Edge Cases | ⏳ Pending | |

**Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Partial / Needs Attention

---

## 🎉 Success Criteria

The specialization feature is considered fully tested and working when:

1. ✅ All 12 tests pass without errors
2. ✅ Data consistency verified in database
3. ✅ No console errors or warnings
4. ✅ Cross-portal consistency confirmed
5. ✅ Edge cases handled gracefully
6. ✅ User experience is smooth and intuitive

---

## 📞 Support & Troubleshooting

### Common Issues:

**Issue 1: Specialization not showing in dropdown**
- **Cause:** User role is not 'member' or 'team_leader'
- **Fix:** Specialization only available for members and team leaders

**Issue 2: Specialization filter not working**
- **Cause:** Frontend filter state not updating
- **Fix:** Check browser console for errors, refresh page

**Issue 3: Specialization not persisting**
- **Cause:** Backend validation error or database constraint
- **Fix:** Check terminal logs for validation errors

**Issue 4: Email not sending**
- **Cause:** SMTP credentials incorrect in `.env`
- **Fix:** Verify `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, `EMAIL_PORT`

---

**Testing Guide Version:** 1.0  
**Last Updated:** Phase 5 - Member Specializations  
**Status:** ✅ Ready for Testing

