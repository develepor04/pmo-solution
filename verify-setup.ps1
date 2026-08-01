# PowerShell script to verify and start servers
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Theta PMO - Server Verification Script  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green
    
    # Check for GROQ_API_KEY
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "GROQ_API_KEY") {
        Write-Host "  ✓ GROQ_API_KEY found in .env" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ GROQ_API_KEY not found in .env - AI features will not work" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ .env file missing! Creating from template..." -ForegroundColor Red
    @"
SECRET_KEY=your-secret-key-change-in-production-to-something-secure
GROQ_API_KEY=your-groq-api-key
FLASK_ENV=development
FLASK_DEBUG=True
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "  ✓ .env file created" -ForegroundColor Green
}

# Check if ports are available
Write-Host "Checking ports..." -ForegroundColor Yellow

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "  ⚠ Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "    Backend may already be running" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Port 5000 is available" -ForegroundColor Green
}

if ($port3000) {
    Write-Host "  ⚠ Port 3000 is already in use" -ForegroundColor Yellow
    Write-Host "    Frontend may already be running" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Port 3000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Ready to Start Servers  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Ask user if they want to start servers
$response = Read-Host "Start servers now? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Write-Host "  URL: http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend_server.py"
    
    Start-Sleep -Seconds 3
    
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    
    Start-Sleep -Seconds 2
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  Servers Starting...  " -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access the application at:" -ForegroundColor Yellow
    Write-Host "  http://localhost:3000" -ForegroundColor White -BackgroundColor Blue
    Write-Host ""
    Write-Host "Press any key to open in browser..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Start-Process "http://localhost:3000"
} else {
    Write-Host ""
    Write-Host "Servers not started." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start manually:" -ForegroundColor Gray
    Write-Host "  Terminal 1: python backend_server.py" -ForegroundColor Gray
    Write-Host "  Terminal 2: cd frontend; npm run dev" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "For troubleshooting, see TROUBLESHOOTING.md" -ForegroundColor Gray
Write-Host ""
