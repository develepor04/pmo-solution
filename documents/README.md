# 📚 Theta PMO - Documentation Index

Welcome to the Theta PMO documentation! All project documentation is organized here for easy access.

## 📋 Documentation Overview

### 🚀 Getting Started

#### [QUICK_START.md](QUICK_START.md)
Quick start guide to get the application running in minutes.

#### [SETUP_GUIDE.md](SETUP_GUIDE.md)
Complete setup and installation instructions for developers.

#### [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)
Application launch instructions and server management.

#### [AI_SETUP.md](AI_SETUP.md)
AI integration and API configuration guide.

---

### 📊 Usage & Processing

#### [PROCESSING_GUIDE.md](PROCESSING_GUIDE.md)
Comprehensive guide for file processing, algorithm detection, and output formats.

#### [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
Technical implementation details and feature summary.

---

### 🔧 Troubleshooting

#### [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
General troubleshooting guide for common issues.

#### [AUTH_TROUBLESHOOTING.md](AUTH_TROUBLESHOOTING.md)
Authentication and authorization troubleshooting.

#### [AUTH_FIX.md](AUTH_FIX.md)
Step-by-step fixes for authentication issues.

#### [SHEET_NAME_FIX.md](SHEET_NAME_FIX.md)
Solutions for Excel sheet name detection issues.

---

## 🎯 Quick Links

| Topic | Document |
|-------|----------|
| Installation | [SETUP_GUIDE.md](SETUP_GUIDE.md) |
| First Run | [QUICK_START.md](QUICK_START.md) |
| File Processing | [PROCESSING_GUIDE.md](PROCESSING_GUIDE.md) |
| Common Issues | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| AI Setup | [AI_SETUP.md](AI_SETUP.md) |

---

## 📁 Project Structure Reference

```
Theta PMO/
├── algorithm/          # Processing algorithms
├── database/          # Data storage
├── documents/         # 📚 YOU ARE HERE
├── frontend/          # React application
├── outputs/           # Processed files
└── uploads/           # Input files
```

---

## 🌟 Features Implemented

✅ Intelligent multi-sheet Excel processing  
✅ Automatic algorithm detection  
✅ User authentication & subscriptions  
✅ AI-powered chat assistant  
✅ Processing history tracking  
✅ Output preview & download  
✅ Modern React frontend  

---

*For the latest updates and version history, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)*

This automatically:
1. Checks Python 3.8+ and Node.js
2. Verifies dependencies
3. Starts Backend (Flask on port 5000)
4. Starts Frontend (Vite on port 3000)

### Option 2: Manual Launch
**Terminal 1 - Backend**:
```bash
python backend_server.py
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 🎯 Navigation Structure

All pages have consistent sidebar navigation:
```
📊 Data Processing (Dashboard)
📜 Reports Archive (History)
👑 Subscription Plans
⚡ API Connectivity (Coming Soon)
⚙️ Output Configuration
🚪 Logout
```

## 🛠️ System Architecture

### Backend (Flask)
- **File**: `backend_server.py`
- **Port**: 5000
- **Features**:
  - JWT Authentication
  - File upload & processing
  - Multi-sheet detection
  - Output preview endpoint
  - Download management
  - Subscription handling

### Frontend (React + Vite)
- **Port**: 3000/3001
- **Key Pages**:
  - `Dashboard.jsx` - File upload & processing
  - `History.jsx` - Processing history with preview
  - `Subscription.jsx` - Plan management
  - `ApiConnectivity.jsx` - Coming Soon features
- **Features**:
  - React Router v6
  - GSAP animations
  - Zustand state management
  - React Hot Toast notifications

### File Processors
- `App.py` - EDDR Processor
- `App2.py` - Project Management Processor
- `App3.py` - Weekly EDDR Processor
- `file_processor.py` - Unified processor with auto-detection

## 📊 Smart Algorithm Detection

The system detects which algorithm to use by analyzing data structure:

| Algorithm | Detection Columns | Detection Row |
|-----------|------------------|---------------|
| EDDR | D(4), J(10), W(23) | Row 12 |
| Project Management | D(4), F(6), K(11) | Row 10 |
| Weekly EDDR | F(6), G(7) | Row 4 |

**No sheet name matching required!** Works with any naming convention.

## 🎨 User Experience

### Dashboard
- Drag & drop file upload
- Multiple file support
- Real-time progress tracking
- Output configuration panel

### History
- Expandable sheet details
- 👁️ Preview button (view data table)
- ⬇️ Download button (individual sheets)
- 📦 Download All (ZIP for multiple sheets)

### API Connectivity
- "Coming Soon" gradient badge
- 6 premium integrations showcased
- Beautiful hover animations
- Call-to-action for premium upgrade

## 📝 File Structure

```
data/
├── run_app.py              ⭐ NEW - Unified launcher
├── LAUNCH_GUIDE.md         ⭐ NEW - Quick start guide
├── backend_server.py       - Flask API server
├── file_processor.py       - Multi-sheet processor
├── App.py                  - EDDR algorithm
├── App2.py                 - Project Management algorithm
├── App3.py                 - Weekly EDDR algorithm
├── requirements.txt        - Python dependencies
├── database/
│   ├── users.json
│   ├── subscriptions.json
│   └── history.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Subscription.jsx
│   │   │   ├── ApiConnectivity.jsx  ⭐ NEW
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js
│   │   └── store/
│   │       └── useStore.js
│   └── package.json
├── uploads/
└── outputs/
```

## 🔧 Troubleshooting

### Port Already in Use
- Backend: Kill process on port 5000
- Frontend: Vite auto-selects next available port

### Dependencies Missing
```bash
# Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Launcher Issues
The launcher checks:
- ✅ Python 3.8+
- ✅ Node.js installed
- ✅ Backend dependencies
- ✅ Frontend node_modules

## 🎉 Ready to Use!

Run the application:
```bash
python run_app.py
```

Then open: http://localhost:3000

**Test the new features**:
1. Click **⚡ API Connectivity** in sidebar
2. See "Coming Soon" page with premium integrations
3. Click **⚙️ Output Configuration** in Dashboard
4. See formatted column selector
5. Upload a file and view **👁️ Preview** in History

---

**System Status**: Production Ready ✅
**Last Updated**: 2026-02-17
