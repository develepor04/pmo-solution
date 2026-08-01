# 🔧 Server Verification & Troubleshooting Guide

## ⚠️ IMPORTANT: Fix for "Not Found" Error on `/api-connectivity`

### The Problem
If you see this error when accessing `http://localhost:3000/api-connectivity`:
```
Not Found
The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.
```

**This means you're hitting the Flask backend (port 5000) instead of the React frontend (port 3000).**

### The Solution

#### Step 1: Verify Frontend Server is Running

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

If you see NO OUTPUT, the frontend is NOT running!

#### Step 2: Start Frontend Server

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

#### Step 3: Access the Correct URL

✅ **CORRECT**: `http://localhost:3000/api-connectivity`  
❌ **WRONG**: `http://localhost:5000/api-connectivity`

---

## 🚀 Complete Startup Checklist

### 1. Install Python Dependencies

```powershell
# Make sure you have the latest requirements
pip install -r requirements.txt
```

**New dependencies added**:
- `python-dotenv` - For loading .env variables
- `groq` - For AI chatbot functionality

### 2. Verify .env File Exists

Check that `.env` file exists in the **root directory** (not in `database/`):

```
d:\Anurag\PMO\data\.env
```

Should contain:
```env
SECRET_KEY=your-secret-key-change-in-production-to-something-secure
GROQ_API_KEY=your-groq-api-key
FLASK_ENV=development
FLASK_DEBUG=True
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Start Backend Server (Terminal 1)

```powershell
python backend_server.py
```

**Look for these success messages**:
```
✅ Groq AI initialized successfully
========================================
PMO Backend Server Starting...
========================================
Server: http://localhost:5000
API Docs: http://localhost:5000/api/health
========================================
```

**If you see**: `⚠️  GROQ_API_KEY not found in .env file`
- Check that `.env` file exists in root directory
- Verify GROQ_API_KEY is set correctly

### 4. Start Frontend Server (Terminal 2)

```powershell
cd frontend
npm run dev
```

**Look for**:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:3000/
```

### 5. Verify Both Servers

#### Backend Health Check:
```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "PMO Backend is running",
  "timestamp": "2026-02-17T..."
}
```

#### Frontend Check:
Open browser: `http://localhost:3000`

You should see the landing page, NOT a Flask error.

---

## 🤖 Testing AI Chatbot

### 1. Login to Application
Go to `http://localhost:3000/login`

### 2. Navigate to Dashboard
After login: `http://localhost:3000/dashboard`

### 3. Click Chat Button
- Blue floating button in bottom-right corner
- Should open chat interface

### 4. Test AI Response

Try these questions:
- "What can you help me with?"
- "Show me delayed activities"
- "Analyze the critical path"
- "Generate a project summary"

**Expected Behavior**:
- Typing indicator appears
- AI responds with intelligent answer
- Suggestions show below message

**If chatbot says "AI service is not available"**:
1. Check backend console for Groq initialization message
2. Verify .env file has GROQ_API_KEY
3. Restart backend server
4. Check internet connection (Groq API is cloud-based)

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Port Already in Use

**Symptom**: Error when starting server

**Solution**:
```powershell
# Find process using the port
netstat -ano | findstr :3000    # For frontend
netstat -ano | findstr :5000    # For backend

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Issue 2: Module Not Found Errors

**Backend**:
```powershell
pip install -r requirements.txt
```

**Frontend**:
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue 3: CORS Errors in Browser Console

**Symptom**: 
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked
```

**Solution**:
- Backend server must be running
- CORS is configured in backend_server.py
- Restart backend server
- Clear browser cache

### Issue 4: 404 on All Routes

**Symptom**: Every route shows "Not Found"

**Problem**: Frontend dev server not running

**Solution**: 
```powershell
cd frontend
npm run dev
```

### Issue 5: Chatbot Not Responding

**Check**:
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Send a chat message
4. Look for `/api/chat` request

**If request fails**:
- Check backend is running
- Verify you're logged in (token exists)
- Check backend console for errors

**If request succeeds but no AI response**:
- Check backend console for Groq errors
- Verify GROQ_API_KEY is valid
- Check internet connection

---

## 📊 Port Reference

| Service | Port | URL |
|---------|------|-----|
| **Frontend (React/Vite)** | 3000 | http://localhost:3000 |
| **Backend (Flask)** | 5000 | http://localhost:5000 |

**ALL user-facing pages use port 3000!**

---

## ✅ Quick Verification Commands

### One-Line Check
```powershell
# Check if both servers are running
netstat -ano | findstr ":3000 :5000"
```

If you see two results, both servers are running!

### Backend API Test
```powershell
# Test health endpoint
curl http://localhost:5000/api/health

# Test with authentication
$token = "your-auth-token-here"
curl -H "Authorization: Bearer $token" http://localhost:5000/api/stats
```

### Frontend Test
Just open: `http://localhost:3000` in your browser

---

## 🎯 Correct URL Structure

### Frontend Routes (Port 3000)
- ✅ `http://localhost:3000/` - Landing page
- ✅ `http://localhost:3000/login` - Login
- ✅ `http://localhost:3000/dashboard` - Dashboard
- ✅ `http://localhost:3000/history` - Reports Archive
- ✅ `http://localhost:3000/api-connectivity` - API Settings
- ✅ `http://localhost:3000/subscription` - Subscription

### Backend API Routes (Port 5000)
- ✅ `http://localhost:5000/api/health` - Health check
- ✅ `http://localhost:5000/api/auth/login` - Login API
- ✅ `http://localhost:5000/api/upload` - Upload files
- ✅ `http://localhost:5000/api/chat` - AI Chatbot

**Remember**: Frontend routes are accessed by users, backend routes are called by the frontend via AJAX/Axios.

---

## 🆘 Still Having Issues?

### Full Reset

```powershell
# Kill all processes
Get-Process python,node | Stop-Process -Force

# Backend - Reinstall dependencies
pip install -r requirements.txt

# Frontend - Reinstall dependencies
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Start servers
# Terminal 1:
python backend_server.py

# Terminal 2:
cd frontend
npm run dev
```

### Check Logs

**Backend logs**: Watch the terminal where `python backend_server.py` is running

**Frontend logs**: 
- Terminal where `npm run dev` is running
- Browser DevTools Console (F12)

**Network logs**: 
- Browser DevTools Network tab (F12)
- Shows all API requests/responses

---

## 📝 Environment Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] `.env` file exists in root directory
- [ ] GROQ_API_KEY is set in `.env`
- [ ] `pip install -r requirements.txt` completed
- [ ] `cd frontend && npm install` completed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access `http://localhost:3000`
- [ ] Chatbot responds to messages

---

**Last Updated**: February 17, 2026  
**AI Feature**: ✅ Groq Integration Active
