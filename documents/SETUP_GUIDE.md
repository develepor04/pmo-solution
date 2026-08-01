# PMO EDDR Data Processing Application - Setup Guide

## 🚀 Quick Start

The fastest way to get started is using the automated start script:

```powershell
.\start.ps1
```

This script will:
- ✅ Check Python and Node.js installations
- ✅ Install all dependencies (Python + Node)
- ✅ Start the Flask backend server on port 5000
- ✅ Start the React frontend dev server on port 3000
- ✅ Open separate terminal windows for each server

After running, open your browser to: **http://localhost:3000**

---

## 📋 Prerequisites

Before running the application, ensure you have:

1. **Python 3.8+** - [Download](https://python.org/downloads)
2. **Node.js 16+** - [Download](https://nodejs.org)
3. **Git** (optional) - For version control

Check your installations:
```powershell
python --version
node --version
npm --version
```

---

## 🔧 Manual Setup

If you prefer to set up manually or the quick start script fails:

### Step 1: Install Python Dependencies

```powershell
pip install -r requirements.txt
```

This installs:
- Flask 3.0 (Web framework)
- Flask-CORS 4.0 (CORS handling)
- PyJWT 2.8 (Authentication)
- openpyxl 3.1.2 (Excel file processing)
- werkzeug 3.0.1 (Security utilities)

### Step 2: Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

This installs:
- React 18.2 + React Router 6.21
- Vite 5.0 (Build tool)
- Zustand 4.4.7 (State management)
- Axios 1.6.5 (HTTP client)
- GSAP 3.12.4 (Animations)
- React Hot Toast 2.4.1 (Notifications)
- Framer Motion 10.18 (UI animations)
- Lucide React 0.309 (Icons)

### Step 3: Start Backend Server

```powershell
python backend_server.py
```

The Flask API will start on **http://localhost:5000**

Backend features:
- JWT-based authentication
- JSON file-based database
- RESTful API endpoints
- File upload and processing
- History tracking

### Step 4: Start Frontend Dev Server

Open a **new terminal window** and run:

```powershell
cd frontend
npm run dev
```

The React app will start on **http://localhost:3000**

---

## 📁 Project Structure

```
d:\Anurag\PMO\data\
├── frontend/                  # React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Output.jsx
│   │   │   └── Subscription.jsx
│   │   ├── services/         # API integration
│   │   │   └── api.js
│   │   ├── store/            # State management
│   │   │   └── useStore.js
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Build configuration
│   └── .env                  # Environment variables
│
├── database/                  # JSON database files (auto-created)
│   ├── users.json
│   ├── history.json
│   └── subscriptions.json
│
├── uploads/                   # Uploaded files (auto-created)
├── outputs/                   # Processed output files (auto-created)
│
├── backend_server.py          # Flask API server
├── App.py                     # Original EDDR processor
├── Main.py                    # Original main script
├── requirements.txt           # Python dependencies
├── start.ps1                  # Quick start script
├── README.md                  # Main documentation
├── QUICKSTART.md              # Quick reference
├── BACKEND_INTEGRATION.md     # API documentation
└── SETUP_GUIDE.md             # This file
```

---

## 🔐 Default Accounts

For testing, you can create an account through the sign-up page, or use these test accounts:

**Free Plan:**
- Email: `test@example.com`
- Password: (create your own)
- Limits: 1 upload/day, 3 total uploads

**Pro Plan:**
- Email: `pro@example.com`
- Password: (create your own)
- Limits: Unlimited uploads

**Enterprise Plan:**
- Email: `enterprise@example.com`
- Password: (create your own)
- Limits: Unlimited + advanced features

---

## 🌐 Application URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React UI |
| Backend API | http://localhost:5000/api | REST API |
| Health Check | http://localhost:5000/api/health | Server status |
| API Stats | http://localhost:5000/api/stats | Statistics |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Subscription
- `GET /api/subscription` - Get subscription status
- `POST /api/subscription/upgrade` - Upgrade plan

### File Operations
- `POST /api/upload` - Upload and process EDDR file
- `GET /api/download/<job_id>` - Download processed file

### History
- `GET /api/history` - Get all processing jobs
- `GET /api/history/<job_id>` - Get specific job details

---

## 🎨 Features

### Frontend
✅ Professional UI with Smartsheet-inspired design
✅ GSAP animations and smooth transitions
✅ JWT authentication with protected routes
✅ Real-time file upload progress bars
✅ Toast notifications for user feedback
✅ Responsive design (mobile/tablet/desktop)
✅ Subscription tier management
✅ File processing history with download
✅ React Router for client-side navigation
✅ Zustand for state management

### Backend
✅ Flask RESTful API
✅ JWT token-based authentication
✅ JSON file-based database
✅ File upload and validation
✅ Excel EDDR data processing
✅ Subscription limit enforcement
✅ History tracking and storage
✅ Error handling and logging

---

## 🐛 Troubleshooting

### Backend won't start

**Issue:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```powershell
pip install -r requirements.txt
```

---

### Frontend won't start

**Issue:** `Cannot find module 'react'`

**Solution:**
```powershell
cd frontend
npm install
```

---

### Port already in use

**Issue:** `Address already in use: Port 5000`

**Solution:**
1. Find process using port:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Kill the process:
   ```powershell
   taskkill /PID <process_id> /F
   ```

Or change the port in `backend_server.py`:
```python
app.run(debug=True, port=5001)  # Use 5001 instead
```

---

### API requests failing

**Issue:** `Network Error` or `CORS policy error`

**Solution:**
1. Ensure backend is running on port 5000
2. Check `.env` file in `frontend/` folder:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. Restart both servers

---

### File upload not working

**Issue:** Upload fails or hangs

**Solution:**
1. Check file is valid Excel format (.xlsx, .xls)
2. Ensure file size < 10MB
3. Check subscription limits (free: 1/day, 3 total)
4. Verify `uploads/` folder exists and is writable

---

## 📝 Development Tips

### Hot Reload
Both servers support hot reload:
- **Frontend:** Vite HMR updates instantly
- **Backend:** Flask debug mode auto-reloads

### Clear Database
To reset all data:
```powershell
Remove-Item -Recurse -Force database/
Remove-Item -Recurse -Force uploads/
Remove-Item -Recurse -Force outputs/
```
Folders will be recreated on next server start.

### API Testing
Use tools like **Postman** or **curl** to test API:

```powershell
# Login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'

# Get current user
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer <your_token>"
```

---

## 🚢 Production Deployment

### Build Frontend
```powershell
cd frontend
npm run build
```
This creates an optimized production build in `frontend/dist/`

### Serve Frontend
You can serve the built files with:
- **Nginx**
- **Apache**
- **Vercel** (recommended)
- **Netlify**

### Deploy Backend
For production, use:
- **Gunicorn** (WSGI server for Flask)
- **Docker** (containerization)
- **Heroku** / **AWS** / **Azure** (cloud platforms)

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend_server:app
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Vite Documentation](https://vitejs.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [JWT Authentication](https://jwt.io/introduction)

---

## 💡 Next Steps

1. **Customize Branding:** Update colors, logo, and text
2. **Add Features:** Implement additional EDDR processing options
3. **Payment Integration:** Connect Stripe/PayPal for subscriptions
4. **Email Notifications:** Add email service for alerts
5. **Advanced Analytics:** Real-time processing statistics
6. **API Documentation:** Generate Swagger/OpenAPI docs

---

## 📧 Support

For issues or questions:
1. Check this guide first
2. Review `README.md` for detailed documentation
3. Check `BACKEND_INTEGRATION.md` for API details
4. Contact: your-email@example.com

---

**Happy Coding! 🎉**
