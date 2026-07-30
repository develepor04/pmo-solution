# Authentication Troubleshooting Guide

## ✅ Backend is Working Correctly

The backend has been tested and confirmed working with:
- ✓ Signup endpoint returns 201 status code
- ✓ Login endpoint returns 200 status code  
- ✓ JWT tokens are being generated correctly
- ✓ CORS is properly configured
- ✓ Database operations are working

## 🔍 Testing Steps

### 1. Check if Both Servers are Running

**Backend**: http://localhost:5000
```powershell
# Should see this message
============================================================
PMO Backend Server Starting...
============================================================
Server: http://localhost:5000
API Docs: http://localhost:5000/api/health
============================================================
```

**Frontend**: http://localhost:3001 (or 3000)
```powershell
# Should see
➜  Local:   http://localhost:3001/
➜  Network: use --host to expose
```

### 2. Test Backend Directly

Open PowerShell and run:
```powershell
python test_auth.py
```

You should see:
- Signup: Status Code 201 ✓
- Login: Status Code 200 ✓

### 3. Clear Browser Data

**Important**: Clear your browser cache and localStorage:

1. Open Developer Tools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check all boxes
5. Click "Clear site data"
6. Refresh the page (Ctrl + F5)

### 4. Test Signup Process

1. Go to http://localhost:3001/signup
2. Open Developer Tools (F12) → Console tab
3. Fill in the signup form:
   - Name: Test User
   - Email: test@example.com
   - Password: testpass123
   - Confirm Password: testpass123
4. Check "I agree to terms"
5. Click "Create Account"

**Watch the Console for errors**

### 5. Check Network Requests

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to signup/login
4. Look for the request to `/api/auth/signup` or `/api/auth/login`
5. Check:
   - **Status**: Should be 200 or 201
   - **Response**: Should contain `token` and `user`
   - **Headers**: Content-Type should be `application/json`

### 6. Check localStorage

After successful login/signup:
1. Open Developer Tools (F12)
2. Go to **Application** → **Local Storage** → http://localhost:3001
3. Verify `token` exists

## 🐛 Common Issues & Solutions

### Issue 1: "Signup failed. Please try again"

**Possible Causes:**
- Email already registered
- Network error
- Backend not running

**Solutions:**
1. Try with a different email address
2. Check if backend is running: http://localhost:5000/api/health
3. Clear browser cache and localStorage
4. Check console for specific error message

### Issue 2: "User not found" on Login

**Possible Causes:**
- Email not registered yet
- Wrong password
- Database file corrupted

**Solutions:**
1. Verify the email is in database:
   - Open `database/users.json`
   - Search for your email
2. Try signing up first
3. If email exists but login fails, password might be wrong

### Issue 3: Infinite Loading

**Possible Causes:**
- Backend not running
- CORS error
- Network timeout

**Solutions:**
1. Check backend logs for errors
2. Restart both backend and frontend
3. Clear browser cache

### Issue 4: Token Expired

**Symptom:** Redirected to login after being logged in

**Solution:**
- Tokens expire after 7 days
- Simply login again

## 📊 Backend Logging

The backend now has enhanced logging. Check the terminal running `python backend_server.py` to see:

```
[SIGNUP] Received data: {'name': 'Test User', 'email': 'test@example.com', 'password': '***'}
[SIGNUP] User created successfully: test@example.com
[SIGNUP] Subscription created for user: xxxxx-xxxxx
[SIGNUP] Token generated successfully
```

or for login:

```
[LOGIN] Received data: {'email': 'test@example.com', 'password': '***'}
[LOGIN] Searching for user: test@example.com
[LOGIN] Total users in DB: 5
[LOGIN] User found, checking password
[LOGIN] Login successful for: test@example.com
```

## 🔧 Manual Database Check

Check existing users:
```powershell
Get-Content database/users.json | ConvertFrom-Json | Format-Table email, name, created_at
```

## 🆘 If Nothing Works

1. **Stop all processes:**
   ```powershell
   # Kill all Python processes
   Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
   
   # Kill all Node processes  
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Clear database (WARNING: This deletes all users):**
   ```powershell
   "[]" | Out-File -FilePath database/users.json -Encoding UTF8
   "[]" | Out-File -FilePath database/subscriptions.json -Encoding UTF8
   "[]" | Out-File -FilePath database/history.json -Encoding UTF8
   ```

3. **Restart everything:**
   ```powershell
   # Terminal 1: Start backend
   python backend_server.py
   
   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

4. **Try signup again with a fresh email**

## 📞 Support

If you continue to experience issues:

1. Check the browser console (F12) for JavaScript errors
2. Check the backend terminal for Python errors
3. Verify both servers are running on correct ports
4. Ensure no firewall is blocking localhost connections

## ✨ Current Status

- ✅ Backend: Running on http://localhost:5000
- ✅ Frontend: Running on http://localhost:3001
- ✅ Database files exist and are readable
- ✅ CORS properly configured
- ✅ Auth endpoints tested and working
- ✅ 4 users currently in database
