# Theta PMO - Launch Guide

## Quick Start - Single Command Launch

### Windows
```powershell
python run_app.py
```

### Linux/Mac
```bash
python3 run_app.py
```

This will automatically:
1. ✅ Check Python and Node.js versions
2. ✅ Verify all dependencies are installed
3. ✅ Start Backend server (Flask on port 5000)
4. ✅ Start Frontend server (Vite on port 3000)
5. ✅ Open your application in the browser

## Stopping the Application

Press **`Ctrl+C`** in the terminal to stop both servers gracefully.

## Manual Launch (Alternative)

If you prefer to run servers separately:

### Backend Only
```powershell
python backend_server.py
```

### Frontend Only
```powershell
cd frontend
npm run dev
```

## First Time Setup

### 1. Install Backend Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```powershell
cd frontend
npm install
```

### 3. Run Application
```powershell
python run_app.py
```

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
- Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- Vite will automatically use the next available port (3001, 3002, etc.)

### Dependencies Missing
Run the setup commands in "First Time Setup" section above.

### Python Version Error
Ensure you have Python 3.8 or higher:
```powershell
python --version
```

### Node.js Not Found
Download and install from: https://nodejs.org/

## Features

- 📊 Multi-sheet Excel processing with intelligent algorithm detection
- 🔍 Output preview with interactive data tables
- 📥 Direct Excel downloads (no ZIP for single sheets)
- 📜 Processing history with expandable sheet details
- ⚡ API Connectivity (Coming Soon - Premium)
- 👤 User authentication and subscription management

## Need Help?

Check the error messages in the terminal for detailed information about any issues.
