@echo off
REM GitHub Architecture Inference - Windows Testing Script
REM Run this to test the GitHub repository analysis feature

setlocal enabledelayedexpansion

echo.
echo ==================================================
echo GitHub Architecture Inference - Testing Guide
echo ==================================================
echo.

REM Configuration
set API_URL=http://localhost:4000/api/github/analyze-repo
set HEALTH_URL=http://localhost:4000/api/health

REM Check if server is running
echo [CHECK 1] Verifying backend server is running...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%HEALTH_URL%' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; Write-Host 'Backend server is running' -ForegroundColor Green } catch { Write-Host 'Backend server is NOT running' -ForegroundColor Red; Write-Host 'Start it with: cd server ^&^& npm start' -ForegroundColor Yellow; exit 1 }"

echo.
echo [CHECK 2] Testing GitHub endpoint...

REM Test 1: Invalid URL
echo.
echo Test 1: Invalid URL (should fail)
powershell -Command "
$body = @{ repoUrl = 'invalid-url' } | ConvertTo-Json
Invoke-WebRequest -Uri '%API_URL%' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
"

REM Test 2: Simple React Repository
echo.
echo Test 2: React Repository (facebook/react)
powershell -Command "
$body = @{ repoUrl = 'https://github.com/facebook/react' } | ConvertTo-Json
Invoke-WebRequest -Uri '%API_URL%' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30 | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
"

REM Test 3: Node.js API
echo.
echo Test 3: Node.js API (expressjs/express)
powershell -Command "
$body = @{ repoUrl = 'https://github.com/expressjs/express' } | ConvertTo-Json
Invoke-WebRequest -Uri '%API_URL%' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30 | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
"

REM Test 4: Python Repository
echo.
echo Test 4: Python Project (pallets/flask)
powershell -Command "
$body = @{ repoUrl = 'https://github.com/pallets/flask' } | ConvertTo-Json
Invoke-WebRequest -Uri '%API_URL%' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30 | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
"

echo.
echo ==================================================
echo Testing Complete!
echo ==================================================
echo.
echo Expected Results:
echo - Invalid URLs should return status: 'error'
echo - Valid repos should return status: 'success'
echo - Each success should include 'architecture' with nodes and edges
echo - Frontend libs should detect Framework correctly
echo - Backend APIs should detect Runtime
echo.
echo If all tests passed with status 'success', the feature is working!
echo.

pause
