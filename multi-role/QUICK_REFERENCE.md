# 🎯 Quick Reference - SaaS Platform Implementation

## ✅ Currently Working

### 1. **Authentication** ✅
- ✅ Login API (`POST /api/v1/auth/login`)
- ✅ JWT Token Generation (HS384)
- ✅ Password Hashing (BCrypt)
- ✅ User Loading from Database
- ✅ Role-based user creation

### 2. **Database** ✅
- ✅ User Entity with relationships
- ✅ Role Entity with RoleType enum
- ✅ Automatic schema generation
- ✅ Automatic data seeding
- ✅ H2 in-memory + PostgreSQL support

### 3. **Security** ✅
- ✅ Spring Security 6 configuration
- ✅ Stateless JWT authentication
- ✅ CSRF protection disabled
- ✅ Public login endpoint
- ✅ Protected API endpoints

### 4. **Infrastructure** ✅
- ✅ Spring Boot application running
- ✅ Docker Compose files ready
- ✅ Health check endpoint
- ✅ Actuator metrics available
- ✅ H2 console accessible

---

## 🎨 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  HTTP Request                       │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  AuthController      │
         │ /api/v1/auth/login   │
         └───────────┬───────────┘
                     │
         ┌───────────▼──────────┐
         │  AuthServiceImpl      │
         │ - Validate email     │
         │ - Check password     │
         │ - Generate JWT       │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────────┐
         │  JwtService              │
         │ - Generate token         │
         │ - Sign with secret       │
         │ - Add claims             │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────────────┐
         │  JWT Token Response              │
         │ {token, email, role, message}    │
         └─────────────────────────────────┘
```

---

## 📝 Code Examples

### Adding a New Endpoint

**Example: Get current user profile**

1. **Add to Controller:**
```java
@GetMapping("/profile")
public ResponseEntity<UserResponseDTO> getProfile(
    @RequestHeader("Authorization") String token
) {
    String email = jwtService.extractUsername(token);
    User user = userRepository.findByEmail(email).orElseThrow();
    return ResponseEntity.ok(new UserResponseDTO(user));
}
```

2. **Add to Service:**
```java
public UserResponseDTO getCurrentUser(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return mapToDTO(user);
}
```

3. **Update SecurityConfig:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/**").permitAll()
    .requestMatchers("/api/v1/user/profile").authenticated()
    .anyRequest().authenticated()
)
```

---

## 🔐 Authentication Flow

```
1. User Credentials
   ↓
2. AuthController.login()
   ↓
3. Find user by email
   ↓
4. Verify password (BCrypt)
   ↓
5. Generate JWT Token
   Subject: email
   Role: user.role.name
   Expiration: 1 hour
   ↓
6. Return LoginResponse
   {token, email, role, message}
```

---

## 🗂️ Key Files & Responsibilities

| File | Responsibility |
|------|-----------------|
| `AuthController.java` | REST endpoint for login |
| `AuthService.java` | Interface for auth operations |
| `AuthServiceImpl.java` | Login logic implementation |
| `JwtService.java` | JWT token generation & validation |
| `SecurityConfig.java` | Spring Security configuration |
| `CustomUserDetailsService.java` | Load user details for auth |
| `User.java` | User entity |
| `Role.java` | Role entity |
| `DataInitializer.java` | Seed default data on startup |

---

## 🚀 Next Implementation Tasks

### Priority 1: User Management
```java
// ✅ Already have
- User entity
- User repository
- User creation in DataInitializer

// 🔄 Need to add
- UserService interface
- UserServiceImpl class
- User CRUD endpoints
- User validation rules
- User update profile endpoint
```

### Priority 2: Refresh Tokens
```java
// 🔄 Need to implement
- RefreshToken entity
- Token refresh endpoint
- Token rotation logic
- Token expiry checks
```

### Priority 3: Multi-Tenancy
```java
// 🔄 Need to implement
- Tenant entity
- Subdomain resolution filter
- Tenant context holder
- Tenant request mapping
- Tenant data isolation
```

### Priority 4: RBAC (Role-Based Access Control)
```java
// ✅ Already have
- Role entity with RoleType enum
- Role-User relationship
- Role in JWT claims

// 🔄 Need to add
- Permission entity
- RolePermission mapping
- @Secured annotation usage
- Permission check filters
- Endpoint authorization rules
```

---

## 🧪 Testing Endpoints

### Using PowerShell
```powershell
# Login
$body = '{"email":"admin@saas.local","password":"admin123"}'
$response = Invoke-WebRequest -Uri http://localhost:8080/api/v1/auth/login `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$response.Content | ConvertFrom-Json
```

### Using CURL
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saas.local","password":"admin123"}'
```

### Using cURL (Windows)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@saas.local\",\"password\":\"admin123\"}"
```

### Using Postman
1. Create new POST request to `http://localhost:8080/api/v1/auth/login`
2. Set Content-Type to `application/json`
3. Body (raw):
```json
{
  "email": "admin@saas.local",
  "password": "admin123"
}
```
4. Send and view JWT token response

---

## 🛠️ Development Setup

### Required Tools
- Java 21 (or compatible)
- Gradle 8.5+
- Git
- IDE (IntelliJ IDEA, VS Code)
- Postman (optional, for testing)

### Project Setup
```bash
# Clone repository
git clone <repo-url>

# Navigate to project
cd multi-role

# Build without tests
gradlew clean build -x test

# Run application
gradlew bootRun

# Access application
# http://localhost:8080
```

---

## 📊 Database Schema

### Users Table
- `id` (BIGINT, PK, Auto-increment)
- `first_name` (VARCHAR, NOT NULL)
- `last_name` (VARCHAR, NOT NULL)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password` (VARCHAR, NOT NULL, BCrypt hashed)
- `active` (BOOLEAN, DEFAULT true)
- `role_id` (BIGINT, FK → roles.id)
- `created_at` (TIMESTAMP, auto-generated)
- `updated_at` (TIMESTAMP, auto-updated)

### Roles Table
- `id` (BIGINT, PK, Auto-increment)
- `role_name` (VARCHAR, UNIQUE, ENUM: SUPER_ADMIN, ADMIN, USER)
- `created_at` (TIMESTAMP, auto-generated)
- `updated_at` (TIMESTAMP, auto-updated)

---

## 🔐 JWT Token Structure

**Header:**
```json
{
  "alg": "HS384"
}
```

**Payload:**
```json
{
  "sub": "admin@saas.local",
  "role": "SUPER_ADMIN",
  "iat": 1782802809,
  "exp": 1782806409
}
```

**Signature:**
```
HMAC-SHA384(base64(header) + "." + base64(payload), secret)
```

---

## 🎯 Common Tasks

### Add a New Role
1. Add to `RoleType` enum:
```java
public enum RoleType {
    SUPER_ADMIN,
    ADMIN,
    USER,
    CUSTOMER  // ← Add new role
}
```

2. Update DataInitializer (auto-creates at startup)

### Change JWT Expiration
1. Update `application.properties`:
```properties
jwt.expiration=7200000  # 2 hours instead of 1
```

2. Rebuild and restart

### Add Password Validation
1. Create custom validation annotation
2. Use in LoginRequest DTO
3. Update SecurityConfig if needed

### Enable PostgreSQL
1. Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/saas_platform
spring.datasource.username=postgres
spring.datasource.password=password
```

2. Start PostgreSQL
3. Create database: `CREATE DATABASE saas_platform;`
4. Run setup script if needed

---

## 🐛 Debugging Tips

### View SQL Queries
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
```

### View Security Logs
```properties
logging.level.org.springframework.security=DEBUG
```

### Access H2 Console
```
http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:testdb
User: sa
Password: (leave blank)
```

### View Application Logs
```bash
# Docker
docker-compose logs -f app

# Local
tail -f logs/application.log
```

---

## 📦 Adding Dependencies

### Via build.gradle
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-mail'
}
```

### Then rebuild
```bash
gradlew clean build -x test
```

---

## 🚀 Deployment Checklist

- [ ] Update `application.properties` with production settings
- [ ] Set strong JWT secret
- [ ] Configure PostgreSQL connection
- [ ] Enable Redis caching
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Enable HTTPS/SSL
- [ ] Set up CI/CD pipeline
- [ ] Test authentication flow
- [ ] Load testing
- [ ] Security audit

---

**Last Updated:** 2026-06-30  
**Version:** 1.0.0  
**Status:** ✅ READY FOR FEATURE DEVELOPMENT
