# Quick Start: Adding Roles to Users

## Step 1: Add Roles to Existing Users

Open `database/users.json` and add `"role"` field to each user:

```json
[
  {
    "id": "3d245b71-7095-48ea-a979-6058bc5e54cd",
    "email": "sdk@xmail.com",
    "name": "Anurag Katre",
    "role": "admin",
    "password": "<hashed-password-from-signup-or-admin>",
    "created_at": "2026-02-17T01:26:21.307757"
  },
  {
    "id": "fe28f572-1d9d-4657-a6ec-9f22e3dcdc3f",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user",
    "password": "<hashed-password-from-signup-or-admin>",
    "created_at": "2026-02-17T02:28:56.273224"
  }
]
```

**Role Types:**
- `"admin"` - Receives all notifications
- `"manager"` - Receives all notifications
- `"user"` - Regular user, no notifications

## Step 2: Restart Backend

```powershell
python run_app.py
```

## Step 3: Test

1. **Login as admin/manager** - You'll see a bell icon in the dashboard header
2. **Login as regular user** (in another browser/incognito) - Upload a file
3. **Check admin/manager dashboard** - Click bell to see the notification!

## Done! 🎉

Your notification system is now active. Admins and managers will be notified whenever any user uploads a file.
