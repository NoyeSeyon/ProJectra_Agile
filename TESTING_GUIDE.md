# Complete Testing Guide - Days 1-4 Implementation

## 🚀 Quick Start

### Servers Started:
- ✅ **Backend:** http://localhost:5001
- ✅ **Frontend:** http://localhost:3000

---

## 📋 Test Accounts

### Super Admin
```
Email: superadmin@projectra.com
Password: SuperAdmin@123
```
**Access:** Full system control
**Dashboard:** `/super-admin/dashboard`

### Organization Admin
You'll need to create this using Super Admin panel or create manually in database.

---

## 🧪 Testing Workflow

### Phase 1: Super Admin Testing (Day 1-2)

#### Test 1.1: Super Admin Login
1. Go to: http://localhost:3000/login
2. Login with Super Admin credentials
3. **Expected:** Auto-redirect to `/super-admin/dashboard`
4. **Verify:** Different layout, separate navigation

#### Test 1.2: Create Organization
1. Navigate to Organizations page
2. Click "Create Organization"
3. Fill form:
   - Name: "Test Company"
   - Slug: "test-company"
   - Description: "Test organization"
   - Plan: "Pro"
4. Click Create
5. **Expected:** Organization appears in list
6. **Verify:** Can view organization details

#### Test 1.3: Create Admin for Organization
1. Navigate to Admin Management
2. Click "Create Admin"
3. Fill form:
   - Email: admin@testcompany.com
   - Password: Admin@123
   - First Name: Test
   - Last Name: Admin
   - Organization: Test Company
4. Click Create
5. **Expected:** Admin created successfully
6. **Verify:** Admin appears in list

#### Test 1.4: Super Admin Analytics
1. Navigate to Dashboard
2. **Verify:**
   - Total Organizations count
   - Total Users count
   - Total Projects count
   - Total Admins count
   - Recent organizations list

---

### Phase 2: Admin Testing (Day 3-4)

#### Test 2.1: Admin Login
1. Logout from Super Admin
2. Login as: admin@testcompany.com / Admin@123
3. **Expected:** Auto-redirect to `/admin/dashboard`
4. **Verify:** Different dashboard than Super Admin

#### Test 2.2: Admin Dashboard
1. View organization statistics:
   - Total Users
   - Project Managers
   - Team Members
   - Total Projects
   - Active Projects
   - Completed Projects
2. **Verify:** All stats show correct data
3. Check Recent Users section
4. Check Organization Insights

#### Test 2.3: Invite Team Member
1. Navigate to `/admin/users`
2. Click "Invite User"
3. Fill form:
   - Email: member@testcompany.com
   - First Name: Team
   - Last Name: Member
   - Role: Member
4. Click Send Invitation
5. **Expected:** 
   - User appears in table
   - Temp password shown (for testing)
6. **Verify:** User in database

#### Test 2.4: Assign Project Manager
1. Navigate to `/admin/pm-management`
2. Click "Assign New PM"
3. Search and select the member created above
4. Set Max Projects: 10
5. Click "Assign as PM"
6. **Expected:**
   - PM appears in PM list
   - Capacity bar shows 0/10
   - Success notification
7. **Verify:** User role changed in database

#### Test 2.5: Update PM Capacity
1. In PM list, find the PM
2. Click "Edit Capacity"
3. Change to 15
4. Click Update
5. **Expected:**
   - Capacity updates to 0/15
   - Success notification
6. **Verify:** Capacity saved

#### Test 2.6: Change User Role
1. Navigate to `/admin/users`
2. Find a member user
3. Change role dropdown from "Member" to "Team Leader"
4. Confirm change
5. **Expected:**
   - Role updates immediately
   - Success notification
6. **Verify:** Role changed in database

#### Test 2.7: Toggle User Status
1. In User Management, find a user
2. Click toggle status button
3. Confirm action
4. **Expected:**
   - Status badge changes
   - User deactivated
5. Click toggle again
6. **Expected:** User reactivated

#### Test 2.8: Search and Filter
1. In PM Management:
   - Test search by name
   - Test search by email
2. In User Management:
   - Filter by role (Admin, PM, Member)
   - Filter by status (Active, Inactive)
   - Combine search + filters
3. **Verify:** Results update correctly

---

## 🔍 API Testing

### Using Browser DevTools

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform any action
4. **Verify:**
   - API calls use correct endpoints
   - Status codes are 200/201
   - JWT token in Authorization header
   - Response data is correct

### Sample API Calls

#### Super Admin APIs
```bash
# Get system analytics
GET http://localhost:5001/api/super-admin/analytics

# Get all organizations
GET http://localhost:5001/api/super-admin/organizations

# Create organization
POST http://localhost:5001/api/super-admin/organizations
Body: { name, slug, description }
```

#### Admin APIs
```bash
# Get organization users
GET http://localhost:5001/api/admin/users

# Assign PM
POST http://localhost:5001/api/admin/assign-pm
Body: { userId, maxProjects }

# Get PMs
GET http://localhost:5001/api/admin/pms

# Update PM capacity
PUT http://localhost:5001/api/admin/pm/:userId/capacity
Body: { maxProjects }
```

---

## ✅ Testing Checklist

### Day 1-2: Super Admin
- [ ] Super Admin can login
- [ ] Redirects to `/super-admin/dashboard`
- [ ] Can view system analytics
- [ ] Can create organization
- [ ] Can edit organization
- [ ] Can delete organization
- [ ] Can create admin for organization
- [ ] Can view all admins
- [ ] Separate layout renders correctly
- [ ] Navigation works

### Day 3-4: Admin Frontend
- [ ] Admin can login
- [ ] Redirects to `/admin/dashboard`
- [ ] Dashboard shows organization stats
- [ ] Can view organization users
- [ ] Can invite new user
- [ ] Can assign user as PM
- [ ] Can set PM capacity
- [ ] Can update PM capacity
- [ ] Can remove PM role
- [ ] Can change user roles
- [ ] Can toggle user status
- [ ] Search functionality works
- [ ] Filter functionality works
- [ ] Modals open/close correctly
- [ ] Form validation works
- [ ] Error messages display
- [ ] Success notifications show
- [ ] Loading states appear

---

## 🐛 Common Issues & Solutions

### Issue: "Port 5001 already in use"
**Solution:**
```powershell
taskkill /F /IM node.exe
cd server
node index.js
```

### Issue: "Network Error" in frontend
**Solution:**
- Check backend is running on port 5001
- Check `.env` file has correct `REACT_APP_API_URL`
- Open DevTools → Network tab to see exact error

### Issue: "401 Unauthorized"
**Solution:**
- Token might be expired
- Logout and login again
- Check localStorage has token

### Issue: "403 Forbidden - Admin access required"
**Solution:**
- User doesn't have admin role
- Login with correct admin account
- Check user role in database

### Issue: Modal not opening
**Solution:**
- Check browser console for errors
- Verify CSS files loaded
- Check z-index in CSS

### Issue: Data not loading
**Solution:**
- Check API is running
- Check network tab for failed requests
- Verify API endpoint URLs
- Check authentication token

---

## 📊 Expected Results

### Super Admin Dashboard
- Shows 1+ organizations
- Shows total users across all orgs
- Shows all admins
- Recent organizations list

### Admin Dashboard
- Shows organization-specific stats
- Recent users from organization only
- Organization insights calculated
- Quick actions work

### PM Management
- Shows only organization's PMs
- Capacity bars animate
- Can assign/update/remove PMs
- Search filters correctly

### User Management
- Shows only organization users
- Can invite users
- Inline role changes work
- Status toggle works
- Filters combine correctly

---

## 🎯 Demo Flow for Viva

### Flow 1: Super Admin Power (2 min)
1. Login as Super Admin
2. Show system dashboard
3. Create new organization
4. Create admin for that org
5. Show analytics

### Flow 2: Admin → PM Assignment (3 min)
1. Login as Admin
2. Show admin dashboard
3. Invite new member
4. Assign member as PM with capacity
5. Show PM in list with capacity bar
6. Update PM capacity
7. Show notification received

### Flow 3: User Management (2 min)
1. Show user table
2. Change user roles
3. Filter by different roles
4. Toggle user status
5. Search functionality

---

## 📝 Notes

### Temp Passwords
When inviting users, the system returns a temp password. In production:
- Send via email only
- Don't show in API response
- Force password change on first login

### Validations
- PM can't be removed if they have active projects
- Capacity can't be less than active projects
- Super admin role can't be changed
- Email must be unique

### Notifications
All role changes create notifications:
- PM assignment
- PM removal
- Role changes
- User invitation
- Status changes

---

## 🚀 Ready to Test!

1. **Backend:** Running on http://localhost:5001
2. **Frontend:** Running on http://localhost:3000
3. **Super Admin:** superadmin@projectra.com / SuperAdmin@123

Start testing and verify all features work as expected!

If you encounter any issues, check the Common Issues section above.

**Good luck with your viva! 🎉**

