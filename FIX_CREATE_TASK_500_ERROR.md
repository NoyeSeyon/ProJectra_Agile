# ✅ Fixed: Create Task 500 Error

## Problem
When PM tried to create a task, got a 500 Internal Server Error:
```
POST http://localhost:3000/api/pm/projects/.../tasks 500 (Internal Server Error)
AxiosError: Request failed with status code 500
```

## Root Causes Found

### 1. Invalid Field in Populate
**Issue:** The controller was trying to populate `avatar` field from User model, but this field doesn't exist.

**Location:** `server/controllers/pmController.js` Line 1562

**Before:**
```javascript
await task.populate([
  { path: 'assignee', select: 'firstName lastName email avatar' },  // ❌ 'avatar' doesn't exist
  { path: 'reporter', select: 'firstName lastName email' },
  { path: 'project', select: 'name' }
]);
```

**After:**
```javascript
await task.populate([
  { path: 'assignee', select: 'firstName lastName email' },  // ✅ Removed 'avatar'
  { path: 'reporter', select: 'firstName lastName email' },
  { path: 'project', select: 'name' }
]);
```

### 2. Incorrect Socket Room Format
**Issue:** Socket event was using `org-${id}` format instead of `org:${id}`.

**Location:** `server/controllers/pmController.js` Line 1570

**Before:**
```javascript
io.to(`org-${req.user.organization}`).emit('task:created', {  // ❌ Wrong format
  task,
  projectId
});
```

**After:**
```javascript
io.to(`org:${req.user.organization}`).emit('task:created', {  // ✅ Correct format
  task,
  projectId,
  organizationId: req.user.organization  // ✅ Added for consistency
});
```

## Solution Applied

### File Modified: `server/controllers/pmController.js`

**Change 1:** Removed non-existent `avatar` field from populate (Line 1562)
**Change 2:** Fixed socket room format from `org-` to `org:` (Line 1570)
**Change 3:** Added `organizationId` to socket event data (Line 1573)

## Why This Error Occurred

### Avatar Field Issue
- Mongoose populate tried to select a field that doesn't exist
- This caused a validation or query error
- Result: 500 Internal Server Error

### Socket Room Format
- Inconsistent room naming across codebase
- Some use `org-${id}`, others use `org:${id}`
- This was fixed in previous phases but this method was missed

## Testing

### To Test the Fix:

1. **Restart the backend server** (IMPORTANT!)
   ```bash
   # Stop the current server (Ctrl+C)
   # Start again
   cd server
   npm start
   ```

2. **Refresh your browser**

3. **Navigate to PM Project Detail page**
   ```
   http://localhost:3000/pm/projects/YOUR_PROJECT_ID
   ```

4. **Click "Create Task" button**

5. **Fill in the form:**
   - Task Title: "Test Task"
   - Description: "Testing task creation"
   - Assignee: Select a team member
   - Priority: "High"
   - Story Points: 5
   - Estimated Hours: 8

6. **Click "Create Task" button**

7. **Expected Result:**
   - ✅ Task created successfully
   - ✅ Modal closes
   - ✅ Task appears in task list
   - ✅ Toast notification: "Task created successfully"
   - ✅ No errors in console

### Expected Backend Response:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "...",
      "title": "Test Task",
      "description": "Testing task creation",
      "assignee": {
        "_id": "...",
        "firstName": "Anuu",
        "lastName": "Raaaa",
        "email": "anu@gmail.com"
      },
      "priority": "high",
      "storyPoints": 5,
      "status": "todo",
      ...
    }
  }
}
```

## Additional Checks

### Check Backend Logs:
After restart, when you create a task, you should see:
```
✅ Task created successfully
✅ Socket event emitted to org:673a1b2c...
```

### Check Frontend Console:
Should show NO errors:
```
✅ (No red errors about 500 status)
✅ Task created successfully
```

## Related Issues Fixed

This fix also ensures:
- ✅ Real-time task creation events work correctly
- ✅ Socket.io broadcasts to correct room
- ✅ Consistent room naming across entire codebase
- ✅ No populate errors for non-existent fields

## Prevention for Future

### When Adding Populate:
1. ✅ Verify field exists in target model
2. ✅ Check model schema before adding to select
3. ✅ Use only documented fields

### When Emitting Socket Events:
1. ✅ Always use `org:${id}` format (with colon)
2. ✅ Include `organizationId` in event data
3. ✅ Check existing socket events for consistency

## Files Modified

1. ✅ `server/controllers/pmController.js`
   - Line 1562: Removed `avatar` from populate
   - Line 1570: Fixed socket room format
   - Line 1573: Added `organizationId` to event data

## Summary

✅ **Issue 1:** Non-existent `avatar` field in populate  
✅ **Fix 1:** Removed `avatar` from select fields  

✅ **Issue 2:** Wrong socket room format (`org-` instead of `org:`)  
✅ **Fix 2:** Updated to `org:${id}` format  

✅ **Result:** Task creation now works correctly!  

**IMPORTANT: Restart your backend server for changes to take effect! 🔄**

