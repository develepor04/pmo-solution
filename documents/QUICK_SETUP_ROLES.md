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
    "password": "scrypt:32768:8:1$4qI116WMAsNswS7L$ec4f39071f577cef973aa9ca7f80494de4d3e48234d0119857194490983f5d3269ed3783f0ec7e37806d836540db34b34db2e30ec546ed4722aebec0a9531003",
    "created_at": "2026-02-17T01:26:21.307757"
  },
  {
    "id": "fe28f572-1d9d-4657-a6ec-9f22e3dcdc3f",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user",
    "password": "scrypt:32768:8:1$9f0rcs0PpWK0170m$0a77a39be263183abe46537900d6c41b4a60c34b6ff46c0d8075ef47c226cafbbd4aac96cc7d15598172978c90a7d0e3e5f241189e6b2c877ba3cfc351f4994e",
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
