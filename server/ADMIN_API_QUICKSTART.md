# Admin API Quick Start Guide

## 🚀 Quick Setup & Testing

### Prerequisites
- Server running on port 5001
- MongoDB connected
- At least one admin user in database
- At least one member user in same organization

---

## Method 1: Using Postman (Recommended)

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select `server/tests/Admin-API.postman_collection.json`
4. Collection will be imported with all endpoints

### Step 2: Set Variables
1. Click on the collection
2. Go to "Variables" tab
3. Update if needed:
   - `baseUrl`: `http://localhost:5001/api` (default)
   - `adminToken`: Will be auto-filled after login
   - `userId`: Will be auto-filled after getting users

### Step 3: Login
1. Open "Authentication" → "Admin Login"
2. Update email and password in request body
3. Click "Send"
4. Token will be automatically saved to collection variables

### Step 4: Test Endpoints
1. All endpoints are now ready to use
2. Token is automatically included in headers
3. Run requests in any order

---

## Method 2: Using Automated Test Script

### Step 1: Configure Test
1. Open `server/tests/test-admin-workflow.js`
2. Update the CONFIG object:
```javascript
const CONFIG = {
  adminEmail: 'your-admin@example.com',
  adminPassword: 'your-password',
  testMemberEmail: 'member@example.com',
  newUserEmail: 'testuser@example.com'
};
```

### Step 2: Run Tests
```bash
cd server
node tests/test-admin-workflow.js
```

### Step 3: View Results
- Tests run automatically
- Color-coded output
- Success rate displayed
- Detailed error messages

---

## Method 3: Using cURL

### Step 1: Login and Get Token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Save the token from response.

### Step 2: Get Organization Users
```bash
curl -X GET "http://localhost:5001/api/admin/users?role=member" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Assign User as PM
```bash
curl -X POST http://localhost:5001/api/admin/assign-pm \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_STEP_2",
    "maxProjects": 10
  }'
```

### Step 4: Get All PMs
```bash
curl -X GET http://localhost:5001/api/admin/pms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Common Test Workflows

### Workflow 1: Basic PM Assignment
```
1. GET /api/admin/users
   → Find a member user
   
2. POST /api/admin/assign-pm
   → Assign as PM with capacity 10
   
3. GET /api/admin/pms
   → Verify PM appears in list
   
4. GET /api/admin/analytics
   → Check updated statistics
```

### Workflow 2: PM Capacity Management
```
1. POST /api/admin/assign-pm
   → Create PM with maxProjects: 5
   
2. PUT /api/admin/pm/:userId/capacity
   → Update to maxProjects: 15
   
3. GET /api/admin/pms
   → Verify capacity updated
```

### Workflow 3: Role Management
```
1. GET /api/admin/users?role=member
   → Get a member
   
2. PUT /api/admin/users/:userId/role
   → Change to team_leader
   
3. PUT /api/admin/users/:userId/role
   → Change to project_manager
   
4. DELETE /api/admin/unassign-pm/:userId
   → Remove PM role
```

### Workflow 4: User Invitation
```
1. POST /api/admin/users/invite
   → Invite new user
   
2. GET /api/admin/users
   → Verify user appears
   
3. PUT /api/admin/users/:userId/role
   → Assign role
```

---

## Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Troubleshooting

### Error: "Access denied. No token provided"
**Solution:** Include Authorization header with Bearer token

### Error: "Admin access required"
**Solution:** Ensure logged-in user has 'admin' role

### Error: "User does not belong to your organization"
**Solution:** Can only manage users in same organization

### Error: "User is already a Project Manager"
**Solution:** Check user's current role before assigning

### Error: "Cannot remove PM role. User has N active project(s)"
**Solution:** Reassign active projects before removing PM role

### Error: "Cannot set capacity to X. PM has Y active projects"
**Solution:** Capacity must be >= active projects count

---

## Testing Checklist

- [ ] Admin can login successfully
- [ ] Admin can view organization users
- [ ] Admin can filter users by role
- [ ] Admin can invite new users
- [ ] Admin can assign member as PM
- [ ] Admin can set PM capacity
- [ ] Admin can view all PMs with statistics
- [ ] Admin can update PM capacity
- [ ] Admin can view PM's projects
- [ ] Admin can change user roles
- [ ] Admin can toggle user status
- [ ] Admin can view organization analytics
- [ ] Admin can remove PM role (no active projects)
- [ ] PM removal is blocked when active projects exist
- [ ] Notifications are created for role changes
- [ ] Cross-organization access is blocked
- [ ] Super Admin role cannot be modified

---

## Sample Test Data

If you need to create test data:

### Create Admin User
```bash
node server/scripts/createSuperAdmin.js
# Then use Super Admin panel to create organization admin
```

### Create Test Members
Use the invite endpoint:
```bash
curl -X POST http://localhost:5001/api/admin/users/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testmember1@example.com",
    "firstName": "Test",
    "lastName": "Member1",
    "role": "member"
  }'
```

---

## Performance Notes

- All endpoints respond within 100-500ms (local)
- Database queries are optimized with indexes
- Pagination not yet implemented (coming in Day 5)
- Real-time notifications via Socket.io ready

---

## Security Reminders

1. Always use HTTPS in production
2. Rotate JWT secrets regularly
3. Implement rate limiting
4. Log all admin actions
5. Send temp passwords via email only
6. Implement MFA for admin accounts

---

## Next Steps

After testing backend:
1. Proceed to Day 4 (Admin Frontend)
2. Create UI for all endpoints
3. Add data visualization
4. Implement real-time updates
5. Add confirmation dialogs

---

## Support

For detailed API documentation, see:
- `server/tests/admin-api-test.md`

For automated testing:
- `server/tests/test-admin-workflow.js`

For Postman:
- `server/tests/Admin-API.postman_collection.json`

---

## 🎉 Happy Testing!

The Admin API is production-ready. Test thoroughly and report any issues!

