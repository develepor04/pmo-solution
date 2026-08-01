# Notification System Setup Guide

## Overview
This guide explains how to set up and use the notification system that sends alerts to admins and managers when users upload files.

## What's Been Implemented

### Backend Changes
1. **Notifications Database** (`database/notifications.json`)
   - Stores all notifications with read status
   - Tracks notification metadata (job ID, user info, etc.)

2. **Helper Functions** (in `backend_server.py`)
   - `create_notification()` - Creates a notification for a specific user
   - `notify_admins_and_managers()` - Sends notifications to all admin/manager users

3. **API Endpoints**
   - `GET /api/notifications` - Get all notifications for current user
   - `PUT /api/notifications/<id>/read` - Mark a notification as read
   - `PUT /api/notifications/read-all` - Mark all notifications as read
   - `DELETE /api/notifications/<id>` - Delete a notification

4. **Upload Endpoint Updated**
   - After successful file upload, automatically notifies all admins and managers

### Frontend Changes
1. **Notification Service** (`frontend/src/services/api.js`)
   - API methods for fetching and managing notifications

2. **NotificationBell Component** (`frontend/src/components/NotificationBell.jsx`)
   - Bell icon with unread count badge
   - Dropdown showing all notifications
   - Mark as read and delete functionality
   - Auto-refresh every 30 seconds
   - Animated bell shake for new notifications

3. **Dashboard Integration**
   - NotificationBell added to dashboard header (visible only to admin/manager)

## Setup Instructions

### Step 1: Add Roles to Users

Since the user database doesn't have roles yet, you need to manually add a `role` field to users.

1. Open `database/users.json`
2. For each user, add a `"role"` field with one of these values:
   - `"admin"` - Full access, receives all notifications
   - `"manager"` - Receives all notifications
   - `"user"` - Regular user, doesn't receive notifications

**Example:**
```json
[
  {
    "id": "3d245b71-7095-48ea-a979-6058bc5e54cd",
    "email": "sdk@xmail.com",
    "name": "Anurag Katre",
    "role": "admin",
    "password": "...",
    "created_at": "2026-02-17T01:26:21.307757"
  },
  {
    "id": "fe28f572-1d9d-4657-a6ec-9f22e3dcdc3f",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user",
    "password": "...",
    "created_at": "2026-02-17T02:28:56.273224"
  }
]
```

### Step 2: Restart the Backend Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart
python run_app.py
```

### Step 3: Test the Notification System

1. **Login as Admin/Manager:**
   - Login with a user account that has role `"admin"` or `"manager"`
   - You should see a bell icon in the dasboard header

2. **Create a Test Upload (as a regular user):**
   - Login with a different account (can be same browser, incognito mode)
   - Upload an Excel file
   - Process it successfully

3. **Check Notifications (as Admin/Manager):**
   - Go back to the admin/manager account
   - Click the bell icon
   - You should see a notification about the upload
   - The notification includes:
     - User who uploaded
     - Filename
     - Number of sheets processed
     - Timestamp

## How It Works

### Notification Flow

```
User uploads file
    ↓
Backend processes file
    ↓
On success, backend calls notify_admins_and_managers()
    ↓
System finds all users with role='admin' or role='manager'
    ↓
Creates notification for each admin/manager
    ↓
Saves to notifications.json
    ↓
Frontend polls for notifications every 30 seconds
    ↓
Admin/Manager sees notification in bell dropdown
```

### Notification Data Structure

```json
{
  "id": "unique-notification-id",
  "user_id": "admin-user-id",
  "title": "New File Upload",
  "message": "Anurag Katre uploaded 'Project_Data.xlsx' - 3 sheet(s) processed successfully",
  "type": "info",
  "metadata": {
    "job_id": "uuid-of-processing-job",
    "filename": "Project_Data.xlsx",
    "user_id": "uploader-user-id",
    "user_name": "Anurag Katre",
    "total_sheets": 3,
    "success_count": 3,
    "error_count": 0
  },
  "read": false,
  "created_at": "2026-02-20T..."
}
```

## Features

### For Admin/Manager Users

1. **Real-time Notifications**
   - See new uploads immediately (polls every 30 seconds)
   - Bell icon shakes when new notification arrives
   - Red badge shows unread count

2. **Notification Actions**
   - Click to mark individual notifications as read
   - "Mark all as read" button
   - Delete individual notifications
   - View notification details

3. **Notification Types**
   - Info (blue icon) - file uploads
   - Success (green icon) - successful operations
   - Error (red icon) - failures

### For Regular Users

- No notification bell displayed
- Can upload files normally
- Their uploads trigger notifications to admins/managers

## Customization

### Change Polling Interval

In `frontend/src/components/NotificationBell.jsx`, line 20:
```javascript
// Poll for new notifications every 30 seconds
const interval = setInterval(fetchNotifications, 30000);
```

Change `30000` to your desired interval in milliseconds.

### Add Email Notifications

To send emails when notifications are created:

1. Install email library:
```bash
pip install flask-mail
```

2. Add to `backend_server.py`:
```python
from flask_mail import Mail, Message

# Configure email
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-app-password'
mail = Mail(app)

# Update notify_admins_and_managers function
def notify_admins_and_managers(title, message, notification_type='info', metadata=None):
    users = read_db(USERS_DB)
    notifications_created = []
    
    for user in users:
        if user.get('role') in ['admin', 'manager']:
            notification = create_notification(...)
            notifications_created.append(notification)
            
            # Send email
            msg = Message(
                title,
                sender='your-email@gmail.com',
                recipients=[user['email']]
            )
            msg.body = message
            mail.send(msg)
    
    return notifications_created
```

### Add Web Push Notifications

For real-time browser notifications, consider implementing:
- WebSocket connections with Flask-SocketIO
- Service Workers for push notifications
- Firebase Cloud Messaging (FCM)

## Troubleshooting

### Notifications Not Showing

1. **Check user role:**
   - Open browser console
   - Type: `localStorage.getItem('token')`
   - Decode the JWT token to verify role
   - Or check `database/users.json` directly

2. **Check backend logs:**
   - Look for notification creation messages
   - Verify notifications are being saved to `database/notifications.json`

3. **Check network requests:**
   - Open browser DevTools → Network tab
   - Look for `/api/notifications` requests
   - Verify they return 200 status

### Bell Not Visible

The NotificationBell only shows if:
```javascript
(user?.role === 'admin' || user?.role === 'manager')
```

Make sure:
- User object in store has the `role` field
- Backend returns role in `/api/auth/me` endpoint

To fix, update `backend_server.py`:
```python
@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user['id'],
        'email': current_user['email'],
        'name': current_user['name'],
        'role': current_user.get('role', 'user'),  # Add this line
        'created_at': current_user['created_at']
    })
```

## Next Steps

Consider implementing:

1. **Notification Preferences**
   - Let users choose which notifications they want
   - Email vs in-app notifications

2. **Notification History**
   - Archive old notifications
   - Search and filter notifications

3. **More Notification Types**
   - Processing failures
   - System updates
   - User registrations
   - Subscription changes

4. **Rich Notifications**
   - Add action buttons (e.g., "View File", "Download")
   - Include file previews
   - Link to specific sheets/outputs

## Support

For issues or questions:
- Check the console for errors
- Review `database/notifications.json` structure
- Verify API endpoints are returning correct data
- Check that the frontend is polling for updates
