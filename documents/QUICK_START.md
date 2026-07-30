# 🚀 Quick Start Guide - Theta PMO Application

## Starting the Application

### Option 1: Using PowerShell Script (Recommended)
```powershell
# From the project root directory
.\start.ps1
```

This script will:
1. Start the backend server on port 5000
2. Start the frontend dev server on port 3000
3. Both will run in separate terminals

### Option 2: Manual Start

#### Terminal 1 - Backend Server
```powershell
# Start Python backend
python backend_server.py
```
The backend will run on: `http://localhost:5000`

#### Terminal 2 - Frontend Dev Server
```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```
The frontend will run on: `http://localhost:3000`

## Accessing the Application

Once both servers are running:

1. **Main Application**: http://localhost:3000
2. **Login Page**: http://localhost:3000/login
3. **Dashboard**: http://localhost:3000/dashboard (after login)
4. **Reports Archive**: http://localhost:3000/history
5. **API Connectivity**: http://localhost:3000/api-connectivity
6. **Subscription Plans**: http://localhost:3000/subscription

## Troubleshooting

### "Page Not Found" Error on `/api-connectivity`

**Cause**: Frontend dev server is not running or you're accessing the backend URL instead of frontend URL.

**Solution**:
1. Ensure frontend dev server is running: `cd frontend && npm run dev`
2. Access the application through port 3000 (frontend), not 5000 (backend)
3. Use: `http://localhost:3000/api-connectivity` ✅
4. NOT: `http://localhost:5000/api-connectivity` ❌

### Backend Not Responding

**Check**:
```powershell
# Verify backend is running
curl http://localhost:5000/api/health
```

**If not running**:
```powershell
# Restart backend
python backend_server.py
```

### Frontend Build Errors

```powershell
# Clear node modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Port Already in Use

**Backend (Port 5000)**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart backend
python backend_server.py
```

**Frontend (Port 3000)**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Restart frontend
cd frontend
npm run dev
```

## New Features

### 🤖 AI Planning Assistant (ChatBot)

The application now includes an intelligent chatbot that can:

- **Analyze Processed Sheets**: Select your processed input/output sheets
- **Answer Project Questions**: Ask about delays, milestones, critical paths
- **Planning Support**: Get forecasts, risk analysis, and resource optimization
- **Quick Actions**: One-click access to common queries

**How to Use**:
1. Click the blue chat button at the bottom right
2. Select sheets from the dropdown to analyze
3. Type your question or use quick action buttons
4. Get instant insights about your project data

**Example Questions**:
- "Show me all delayed activities"
- "What's the critical path?"
- "Give me a project summary"
- "Identify risks in my project"
- "Compare actual vs baseline"

### 📊 Excel-Like Output Viewer

View your processed data in a professional spreadsheet interface:

- **Excel-style grid** with column letters and row numbers
- **Search and filter** data in real-time
- **Sort columns** by clicking headers
- **Zoom controls** (50% - 150%)
- **Fullscreen mode** for detailed analysis
- **Sticky headers** for easy navigation

## API Endpoints

Backend API is available at `http://localhost:5000/api/`

Key endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `POST /api/upload` - Upload project files
- `POST /api/process` - Process uploaded files
- `GET /api/history` - Get processing history
- `GET /api/download/<job_id>` - Download processed files
- `GET /api/preview/<job_id>/<sheet_name>` - Preview output data

## Default Credentials

For testing purposes:
- Email: test@example.com
- Password: password123

## Environment Requirements

- Python 3.8+
- Node.js 16+
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Need Help?

Check the following guides:
- `SETUP_GUIDE.md` - Initial setup instructions
- `LAUNCH_GUIDE.md` - Detailed launch procedures
- `PROCESSING_GUIDE.md` - File processing guide
- `AUTH_TROUBLESHOOTING.md` - Authentication issues

## Development Mode

Both servers run in development mode with:
- **Hot reload**: Changes reflect immediately
- **Debug mode**: Detailed error messages
- **CORS enabled**: Frontend can communicate with backend

## Production Deployment

For production deployment:

1. Build frontend:
```powershell
cd frontend
npm run build
```

2. Serve static files from Flask backend
3. Update security settings (SECRET_KEY, CORS origins)
4. Use production WSGI server (gunicorn, waitress)
5. Set up proper database (PostgreSQL, MySQL)

---

**Need more help?** Check the documentation or contact support.
