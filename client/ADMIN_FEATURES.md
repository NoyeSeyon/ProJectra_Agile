# Admin Features Guide

## 🎯 Quick Access

- **Admin Dashboard:** `http://localhost:3000/admin/dashboard`
- **PM Management:** `http://localhost:3000/admin/pm-management`
- **User Management:** `http://localhost:3000/admin/users`

---

## 1. Admin Dashboard (`/admin/dashboard`)

### Features:
✅ Organization Statistics
- Total Users
- Project Managers count
- Team Members count
- Total Projects
- Active Projects
- Completed Projects

✅ Recent Users Section
- Last 5 users joined
- Shows avatar, name, email, role
- Join date

✅ Organization Insights
- Project completion rate
- Active work count
- Projects per PM average

✅ Quick Actions
- Invite User button
- Manage PMs button

### Navigation Links:
- View all users → `/admin/users`
- View all PMs → `/admin/pm-management`
- View analytics → `/analytics`

---

## 2. PM Management (`/admin/pm-management`)

### Features:
✅ PM Statistics
- Total PMs in organization
- Total active projects
- Average capacity usage

✅ PM List
Each PM card shows:
- Avatar with initials
- Full name and email
- Active projects / Max projects
- Capacity bar (visual progress)
- Percentage usage

✅ Assign New PM
- Search available users
- Select user from dropdown
- Set maximum projects (1-20)
- Sends notification to user

✅ Update PM Capacity
- Shows current active projects
- Set new max projects
- Must be >= active projects
- Updates in real-time

✅ Remove PM Role
- Confirmation required
- Validates no active projects
- Reverts role to member
- Sends notification

### Search & Filter:
- Search by PM name or email
- Real-time filtering

---

## 3. User Management (`/admin/users`)

### Features:
✅ User Statistics Bar
- Total users count
- Admins count
- Project Managers count
- Active users count

✅ User Table
Columns:
- User (avatar + name)
- Email address
- Role (inline dropdown)
- Status badge
- Actions (toggle status)

✅ Invite New User
Form fields:
- Email address*
- First name*
- Last name*
- Role (member/team leader/PM/admin)
- Auto-generates temp password

✅ Change User Role
- Dropdown in table
- Options: Admin, PM, Team Leader, Member
- Confirmation dialog
- Immediate update

✅ Toggle User Status
- Activate/Deactivate button
- Visual toggle icon
- Updates status badge
- Sends notification

### Search & Filter:
- Search by name or email
- Filter by role (all/admin/PM/leader/member)
- Filter by status (all/active/inactive)
- Combines all filters

---

## 🎨 UI Elements

### Color Scheme:
- Primary: Indigo (#4f46e5)
- Success: Green (#10b981)
- Warning: Orange (#f97316)
- Error: Red (#ef4444)
- Gradients for special cards

### Components:
- **Stat Cards:** Colored icons, numbers, labels
- **User Avatars:** Gradient background with initials
- **Role Badges:** Color-coded by role
- **Status Badges:** Green (active) / Red (inactive)
- **Capacity Bars:** Gradient from green → blue → red
- **Modals:** Full-screen on mobile, centered on desktop
- **Tables:** Hover effects, alternating rows

### Icons:
- Users, UserPlus, UserCog
- Briefcase, TrendingUp, Activity
- Search, Filter, Edit, Trash
- CheckCircle, AlertCircle, X

---

## 🔐 Access Control

### Who Can Access:
- Users with role = 'admin'
- Users with role = 'super_admin' (full access)

### Redirect Rules:
1. Not authenticated → `/login`
2. Authenticated but not admin → `/dashboard`
3. Admin on login → `/admin/dashboard`
4. Super Admin on login → `/super-admin/dashboard`

---

## 📱 Responsive Design

### Desktop (>1024px):
- Full sidebar + main content
- Multi-column grids
- Wide tables
- Side-by-side modals

### Tablet (768px-1024px):
- Collapsible sidebar
- 2-column grids
- Full-width tables with scroll

### Mobile (<768px):
- Hidden sidebar
- Single column
- Stacked cards
- Full-screen modals
- Touch-optimized buttons

---

## 🚀 Workflows

### Workflow 1: Assign a Project Manager
1. Go to `/admin/pm-management`
2. Click "Assign New PM"
3. Search for user
4. Select from dropdown
5. Set max projects (default: 10)
6. Click "Assign as PM"
7. User receives notification
8. PM appears in PM list

### Workflow 2: Invite New User
1. Go to `/admin/users`
2. Click "Invite User"
3. Fill in email, name, role
4. Click "Send Invitation"
5. User created with temp password
6. User appears in table
7. User receives notification

### Workflow 3: Change User Role
1. Go to `/admin/users`
2. Find user in table
3. Click role dropdown
4. Select new role
5. Confirm change
6. Role updates immediately
7. User receives notification

### Workflow 4: Manage PM Capacity
1. Go to `/admin/pm-management`
2. Find PM in list
3. Click "Edit Capacity"
4. Enter new max projects
5. Click "Update Capacity"
6. Capacity bar updates
7. PM receives notification

---

## 💡 Best Practices

### For Admins:
1. **Start with members** - Assign PM role to experienced members
2. **Set realistic capacity** - Consider workload, not just numbers
3. **Monitor usage** - Check capacity bars regularly
4. **Remove carefully** - Ensure no active projects before removing PM
5. **Invite properly** - Use correct roles from the start

### For Development:
1. **Always validate** - Check inputs before API calls
2. **Handle errors** - Show user-friendly messages
3. **Confirm actions** - Use dialogs for destructive operations
4. **Update immediately** - Refresh data after changes
5. **Show feedback** - Loading states and success/error messages

---

## 🎓 Tips & Tricks

### Quick Actions:
- Use search to find users/PMs quickly
- Combine filters for precise results
- Click stat cards to navigate
- Use modals for focused tasks

### Keyboard Shortcuts:
- Tab through form fields
- Enter to submit forms
- Esc to close modals

### Visual Indicators:
- Green capacity bar = under 50%
- Blue capacity bar = 50-80%
- Red capacity bar = over 80%
- Active badge = green
- Inactive badge = red

---

## ⚠️ Important Notes

### PM Removal:
- Cannot remove PM with active projects
- Must reassign projects first
- System prevents data loss

### Capacity Limits:
- Minimum: 1 project
- Maximum: 20 projects
- Must be >= current active projects
- Consider PM workload

### User Status:
- Inactive users cannot login
- Existing sessions remain valid
- Reactivation is instant
- Cannot deactivate super admins

### Role Changes:
- Super admin role cannot be changed
- PM → Member requires no active projects
- Changes are immediate
- Notifications sent automatically

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API is running (port 5001)
3. Check user has correct permissions
4. Review error messages
5. Contact super admin if needed

---

Built with ❤️ for final viva presentation

