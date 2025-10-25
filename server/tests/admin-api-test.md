# Admin API Testing Documentation

## Base URL
`http://localhost:5001/api/admin`

## Authentication
All endpoints require:
- Bearer token in Authorization header
- User must have 'admin' role

## Endpoints

### 1. Get Organization Users
**GET** `/users`

Query Parameters:
- `role` (optional): Filter by role (member, project_manager, etc.)
- `search` (optional): Search by name or email
- `isActive` (optional): Filter by active status (true/false)

**Example Request:**
```bash
GET /api/admin/users?role=member&isActive=true
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "member",
      "isActive": true,
      "capacity": {
        "maxProjects": 4,
        "currentProjects": 2
      }
    }
  ]
}
```

---

### 2. Assign User as Project Manager
**POST** `/assign-pm`

**Request Body:**
```json
{
  "userId": "USER_ID",
  "maxProjects": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "User successfully assigned as Project Manager",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "role": "project_manager",
    "capacity": {
      "maxProjects": 10
    }
  }
}
```

**Error Cases:**
- 400: User is already a PM
- 403: User not in same organization
- 404: User not found

---

### 3. Get All Project Managers
**GET** `/pms`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "project_manager",
      "capacity": {
        "maxProjects": 10
      },
      "projectsCount": 8,
      "activeProjectsCount": 5,
      "capacityUsage": 50
    }
  ]
}
```

---

### 4. Remove PM Role
**DELETE** `/unassign-pm/:userId`

**Response:**
```json
{
  "success": true,
  "message": "PM role removed successfully",
  "data": {
    "_id": "...",
    "role": "member"
  }
}
```

**Error Cases:**
- 400: User has active projects (must reassign first)
- 400: User is not a PM
- 404: User not found

---

### 5. Update PM Capacity
**PUT** `/pm/:userId/capacity`

**Request Body:**
```json
{
  "maxProjects": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "PM capacity updated successfully",
  "data": {
    "_id": "...",
    "capacity": {
      "maxProjects": 15
    }
  }
}
```

**Validation:**
- maxProjects must be between 1 and 20
- Cannot be less than current active projects

---

### 6. Get PM's Projects
**GET** `/pm/:userId/projects`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Project Alpha",
      "status": "in-progress",
      "team": {
        "members": [...]
      }
    }
  ]
}
```

---

### 7. Change User Role
**PUT** `/users/:userId/role`

**Request Body:**
```json
{
  "role": "project_manager"
}
```

**Valid Roles:**
- member
- team_leader
- project_manager
- admin

**Response:**
```json
{
  "success": true,
  "message": "User role changed successfully",
  "data": {
    "_id": "...",
    "role": "project_manager"
  }
}
```

---

### 8. Invite New User
**POST** `/users/invite`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User invited successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "newuser@example.com",
      "firstName": "New",
      "lastName": "User",
      "role": "member"
    },
    "tempPassword": "TempPass123!"
  }
}
```

**Note:** In production, the temporary password should be sent via email only, not returned in the API response.

---

### 9. Toggle User Status (Activate/Deactivate)
**PATCH** `/users/:userId/status`

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "_id": "...",
    "isActive": false
  }
}
```

---

### 10. Get Organization Analytics
**GET** `/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 25,
      "projectManagers": 5,
      "members": 20
    },
    "projects": {
      "total": 15,
      "active": 10,
      "completed": 5
    },
    "recentUsers": [...]
  }
}
```

---

## Testing Workflow

### Test 1: Basic PM Assignment
1. GET `/users` - Get list of members
2. POST `/assign-pm` - Assign a member as PM
3. GET `/pms` - Verify PM appears in list
4. Verify notification was sent to the user

### Test 2: PM Capacity Management
1. POST `/assign-pm` with maxProjects: 5
2. PUT `/pm/:userId/capacity` - Update to 10
3. GET `/pms` - Verify updated capacity

### Test 3: PM Removal
1. DELETE `/unassign-pm/:userId` - Remove PM role
2. GET `/pms` - Verify PM is removed from list
3. Verify user role changed back to 'member'

### Test 4: User Invitation
1. POST `/users/invite` - Invite new user
2. GET `/users` - Verify user appears in list
3. Check notification for invited user

### Test 5: Role Management
1. PUT `/users/:userId/role` - Change member to team_leader
2. PUT `/users/:userId/role` - Change team_leader to project_manager
3. Verify notifications sent for each change

### Test 6: User Status Management
1. PATCH `/users/:userId/status` - Deactivate user
2. GET `/users?isActive=false` - Verify deactivated
3. PATCH `/users/:userId/status` - Reactivate user

---

## Error Handling

All endpoints follow this error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (no token or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

---

## Notifications

The following notifications are automatically created:

1. **PM Assignment:**
   - Type: team_invitation
   - Priority: high
   - Message: Role assignment details

2. **PM Removal:**
   - Type: team_left
   - Priority: medium
   - Message: Role removal notice

3. **Capacity Update:**
   - Type: system_update
   - Priority: low
   - Message: Capacity change details

4. **Role Change:**
   - Type: team_invitation
   - Priority: high
   - Message: Role change details

5. **User Invitation:**
   - Type: team_invitation
   - Priority: high
   - Message: Welcome message with temp password

6. **Status Toggle:**
   - Type: security_alert
   - Priority: high
   - Message: Account activation/deactivation notice

---

## Security Notes

1. All routes require authentication
2. Only users with 'admin' role can access
3. Admins can only manage users in their organization
4. Super Admin role cannot be modified
5. PMs with active projects cannot be removed
6. Capacity cannot be set below current active projects

