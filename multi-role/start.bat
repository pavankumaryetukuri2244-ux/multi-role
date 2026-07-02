@echo off
REM ===========================
REM Multi-Tenant SaaS Platform
REM Quick Start Script for Windows
REM ===========================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════╗
echo ║  Multi-Tenant SaaS Platform - Setup   ║
echo ╚════════════════════════════════════════╝
echo.

:menu
echo.
echo Choose an option:
echo 1. Start Database + Redis with Docker
echo 2. Build the Application (Gradle)
echo 3. Run Application (Gradle)
echo 4. Build and Run Application
echo 5. Build Docker Image
echo 6. Start Full Stack with Docker
echo 7. Stop All Containers
echo 8. View Docker Logs
echo 9. Exit
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto startServices
if "%choice%"=="2" goto buildApp
if "%choice%"=="3" goto runApp
if "%choice%"=="4" goto buildAndRun
if "%choice%"=="5" goto buildDocker
if "%choice%"=="6" goto fullStack
if "%choice%"=="7" goto stopServices
if "%choice%"=="8" goto viewLogs
if "%choice%"=="9" goto exit
echo Invalid choice. Please try again.
goto menu

:startServices
echo.
echo Starting PostgreSQL and Redis...
docker-compose up -d
if errorlevel 1 (
    echo Error: Docker not found or failed to start containers
    echo Make sure Docker Desktop is installed and running
    pause
    goto menu
)
echo.
echo ✓ Services started successfully!
echo   PostgreSQL: localhost:5432
echo   Redis: localhost:6379
echo.
echo Loading database schema...
timeout /t 5 /nobreak
docker exec saas-postgres psql -U postgres -d saas_platform -f /docker-entrypoint-initdb.d/init.sql 2>nul || (
    echo Note: Schema will be loaded on first startup
)
echo.
pause
goto menu

:buildApp
echo.
echo Building the application...
call gradlew clean build -x test
if errorlevel 1 (
    echo Build failed!
    pause
    goto menu
)
echo.
echo ✓ Build completed successfully!
echo JAR file: build\libs\multi-role-*.jar
echo.
pause
goto menu

:runApp
echo.
echo Starting the application...
echo Make sure PostgreSQL and Redis are running!
echo.
call gradlew bootRun
pause
goto menu

:buildAndRun
echo.
echo Building and running the application...
echo.
call gradlew clean build -x test bootRun
pause
goto menu

:buildDocker
echo.
echo Building Docker image...
docker build -t saas-app:latest .
if errorlevel 1 (
    echo Docker build failed!
    pause
    goto menu
)
echo.
echo ✓ Docker image built successfully!
echo.
pause
goto menu

:fullStack
echo.
echo Starting full stack (PostgreSQL, Redis, App)...
docker-compose -f docker-compose-full.yml up -d
if errorlevel 1 (
    echo Error: Failed to start containers
    pause
    goto menu
)
echo.
echo ✓ Full stack started!
echo   Application: http://localhost:8080
echo   pgAdmin: http://localhost:5050
echo   Health Check: http://localhost:8080/actuator/health
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak
echo.
echo ✓ Services should be ready now!
echo.
pause
goto menu

:stopServices
echo.
echo Stopping all containers...
docker-compose down
docker-compose -f docker-compose-full.yml down 2>nul
echo ✓ All containers stopped
echo.
pause
goto menu

:viewLogs
echo.
echo Choose logs to view:
echo 1. Application logs
echo 2. Database logs
echo 3. Redis logs
echo 4. All logs
echo.
set /p logchoice="Enter choice (1-4): "

if "%logchoice%"=="1" docker-compose logs -f app
if "%logchoice%"=="2" docker-compose logs -f postgres
if "%logchoice%"=="3" docker-compose logs -f redis
if "%logchoice%"=="4" docker-compose logs -f

goto menu

:exit
echo.
echo Thank you for using SaaS Platform!
echo.
exit /b 0
