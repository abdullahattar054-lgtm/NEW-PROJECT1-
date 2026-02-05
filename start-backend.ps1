# TECH.PK - Automated Setup Script
# This script will install dependencies and start the backend server
# Run this AFTER installing Node.js

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TECH.PK Backend Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Download the LTS version" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Restart this terminal" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Navigate to backend directory
Write-Host "Navigating to backend directory..." -ForegroundColor Yellow
Set-Location -Path "c:\ANTIGRAVITY\tech-pk-backend"

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies (this may take 3-5 minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# Seed database
Write-Host "Seeding database with sample data..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠ Database seeding failed (MongoDB might not be running)" -ForegroundColor Yellow
    Write-Host "  Make sure MongoDB is installed and running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev
