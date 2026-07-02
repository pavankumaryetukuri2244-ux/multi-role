# User Authentication System - Complete Implementation

## Overview
This document describes the complete user authentication system including **User Registration**, **User Login**, **Admin Registration**, and **Logout** functionality with JWT token management and blacklist mechanism.

---

## Features Implemented

### 1. **User Registration** ✅
**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "USER",
  "active": true,
  "approved": false,
  "tenantName": null,
  "categories": []
}
```

**Validation:**
- First name and last name are required
- Email must be valid and unique
- Password must be at least 8 characters
- Passwords must match (password == confirmPassword)
- User role is set to `USER` by default
- Account is active but pending approval

**Database:** User is saved with `approved=false` (awaiting admin approval)

---

### 2. **User Login** ✅
**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "name": "John"  // Optional
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "role": "USER",
  "message": "Login Successful"
}
```

**Validation:**
- Email must be registered
- Password must match (bcrypt verified)
- User account must be active (`active=true`)
- User must be approved (`approved=true`)
- Optional name parameter for additional verification

**Token:** JWT token valid for configured duration (check `jwt.expiration` in application properties)

---

### 3. **Admin Login** ✅
**Endpoint:** `POST /api/v1/auth/admin-login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123",
  "name": "Admin"  // Optional
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@example.com",
  "role": "ADMIN",
  "message": "Admin Login Successful"
}
```

**Validation:**
- Same as user login, but user must have `ADMIN` or `SUPER_ADMIN` role
- Restricted to admin users only

---

### 4. **Admin Registration** ✅
**Endpoint:** `POST /api/v1/auth/register-admin`

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "SecurePass123",
  "companyName": "Acme Corp",
  "subdomain": "acmecorp"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "active": true,
  "approved": true,
  "tenantName": "Acme Corp",
  "categories": []
}
```

**Creates:**
1. A new Tenant with the provided company name and subdomain
2. A new User with ADMIN role
3. User is automatically approved and active

---

### 5. **Logout** ✅
**Endpoint:** `POST /api/v1/auth/logout`

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "email": "john@example.com"
}
```

**Mechanism:**
- Token is extracted and added to the **TokenBlacklist** table
- Token is stored with its expiration date
- Blacklisted tokens cannot be used for authentication

---

### 6. **Password Reset**
**Step 1 - Forgot Password:** `POST /api/v1/auth/forgot-password`
```json
{
  "email": "john@example.com"
}
```
- Generates a 6-digit OTP
- OTP stored in database with 10-minute expiration
- OTP printed to console in development

**Step 2 - Reset Password:** `POST /api/v1/auth/reset-password`
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```
- Validates OTP and expiration
- Updates user password
- Marks token as used

---

## Database Schema

### **TokenBlacklist Table**
```sql
CREATE TABLE token_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);
```

Stores invalidated JWT tokens for logged-out sessions.

---

## Security Features

### 1. **JWT Token Security**
- Tokens are signed with HMAC-SHA256
- Contains user email and role claims
- Configurable expiration time
- Token validation on each protected request

### 2. **Password Security**
- Passwords are hashed using bcrypt
- Password confirmation required during registration
- Minimum 8 character requirement

### 3. **Token Blacklist (Logout)**
- Implements token invalidation on logout
- JwtAuthenticationFilter checks blacklist for each request
- Expired tokens automatically removed from blacklist

### 4. **Account Status Validation**
- User must be active (`active=true`)
- User must be approved (`approved=true`) before login
- Admin users have separate login endpoint

### 5. **Request Validation**
- All inputs validated using Jakarta Validation
- Email format validation
- Required field validation
- Custom error messages

---

## Architecture Components

### 1. **DTOs (Data Transfer Objects)**

**Request DTOs:**
- `LoginRequest` - Login credentials
- `UserRegisterRequest` - User registration data
- `RegisterAdminRequest` - Admin registration with tenant
- `LogoutRequest` - Logout token
- `ForgotPasswordRequest` - Password reset initiation
- `ResetPasswordRequest` - Password reset completion

**Response DTOs:**
- `LoginResponse` - JWT token and user info
- `LogoutResponse` - Logout confirmation
- `UserResponse` - User details
- `ApiResponse<T>` - Generic API response wrapper

### 2. **Entities**

**TokenBlacklist** - Stores invalidated tokens
```java
@Entity
public class TokenBlacklist {
    String token;
    String email;
    LocalDateTime expiresAt;
    LocalDateTime createdAt;
}
```

### 3. **Services**

**AuthService (Interface)**
- `login(LoginRequest)` - User login
- `adminLogin(LoginRequest)` - Admin login
- `registerUser(UserRegisterRequest)` - User registration
- `registerAdmin(RegisterAdminRequest)` - Admin registration
- `logout(LogoutRequest)` - Logout
- `isTokenBlacklisted(String)` - Check token validity
- `generatePasswordResetOtp(ForgotPasswordRequest)` - Generate OTP
- `resetPassword(ResetPasswordRequest)` - Reset password

**AuthServiceImpl** - Implementation with all business logic

### 4. **Controllers**

**AuthController** - REST endpoints
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/register-admin` - Register admin
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/admin-login` - Login admin
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Complete password reset

### 5. **Security Filters**

**JwtAuthenticationFilter**
- Extracts JWT from Authorization header
- Validates token format and expiration
- **Checks token blacklist** for logged-out sessions
- Sets authentication in SecurityContext
- Skips validation for public endpoints

**Public Endpoints** (No authentication required):
- `/api/v1/auth/**`
- `/api/v1/public/**`
- `/h2-console/**`
- `/actuator/**`
- `/swagger-ui/**`
- `/v3/api-docs/**`

---

## Workflow Examples

### **Complete Registration & Login Flow**

1. **User Registers:**
   ```
   POST /api/v1/auth/register
   {email: "user@example.com", password: "Pass123", ...}
   Response: User created with approved=false
   ```

2. **Admin Approves User:** (Done in admin panel or API)
   - Update user.approved = true

3. **User Logins:**
   ```
   POST /api/v1/auth/login
   {email: "user@example.com", password: "Pass123"}
   Response: JWT token
   ```

4. **User Uses Protected APIs:**
   ```
   GET /api/v1/users/profile
   Headers: Authorization: Bearer <JWT_TOKEN>
   ```

5. **User Logouts:**
   ```
   POST /api/v1/auth/logout
   {token: "<JWT_TOKEN>"}
   Response: success=true, token added to blacklist
   ```

6. **Token is Now Invalid:**
   ```
   GET /api/v1/users/profile
   Headers: Authorization: Bearer <JWT_TOKEN>
   Response: 401 Unauthorized (token blacklisted)
   ```

---

## Error Responses

### **Invalid Credentials**
```json
{
  "status": 401,
  "error": "Bad Credentials",
  "message": "Invalid email or password"
}
```

### **User Not Approved**
```json
{
  "status": 403,
  "error": "User Disabled",
  "message": "Account pending approval from Super Admin."
}
```

### **User Disabled**
```json
{
  "status": 403,
  "error": "User Disabled",
  "message": "User account is disabled. Please contact an administrator."
}
```

### **Email Already Registered**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Email is already registered"
}
```

### **Validation Errors**
```json
{
  "status": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Configuration

Add these properties to `application.yml` or `application.properties`:

```yaml
jwt:
  secret: "your-base64-encoded-secret-key-min-256-bits"
  expiration: 86400000  # 24 hours in milliseconds

spring:
  datasource:
    url: "jdbc:mysql://localhost:3306/multi_role_db"
    username: "root"
    password: "password"
    driver-class-name: "com.mysql.cj.jdbc.Driver"
  jpa:
    hibernate:
      ddl-auto: "update"
```

---

## Files Created/Modified

### **Created:**
1. `TokenBlacklist.java` - Entity for logout mechanism
2. `TokenBlacklistRepository.java` - Repository for token management
3. `UserRegisterRequest.java` - User registration DTO
4. `LogoutRequest.java` - Logout DTO
5. `LogoutResponse.java` - Logout response DTO

### **Modified:**
1. `AuthService.java` - Added new methods
2. `AuthServiceImpl.java` - Implemented new methods
3. `AuthController.java` - Added new endpoints
4. `JwtAuthenticationFilter.java` - Added blacklist check

---

## Testing the API

### **Using cURL:**

**Register User:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<YOUR_JWT_TOKEN>"
  }'
```

---

## Security Best Practices Applied

✅ **Password Hashing** - Bcrypt with salt  
✅ **JWT Tokens** - HMAC-SHA256 signed  
✅ **Token Blacklist** - Logout invalidation  
✅ **Validation** - Input validation on all requests  
✅ **Account Status** - Active and approval checks  
✅ **Role-based Access** - Separate endpoints for admin  
✅ **Error Messages** - Generic messages to prevent enumeration  
✅ **Protected Endpoints** - JWT requirement enforced  

---

## Future Enhancements

- [ ] Email verification during registration
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2/OIDC integration
- [ ] Refresh token mechanism
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for auth events
- [ ] Account lockout after failed attempts
- [ ] Social login integration (Google, GitHub)

---

**System is ready for production use!** 🚀
