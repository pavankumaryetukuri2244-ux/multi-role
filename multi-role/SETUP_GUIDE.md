# Multi-Tenant SaaS Platform - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Java 21+
- PostgreSQL 15+ (or Docker)
- Redis 7+ (or Docker)
- Gradle 8.5+

### Option 1: Run with Docker Compose (Recommended)

#### Using only Database + Redis (Dev Mode)
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# The app will connect to these services
# Then build and run the app:
./gradlew bootRun
```

#### Full Stack with Docker (Production Mode)
```bash
# Start everything including the app
docker-compose -f docker-compose-full.yml up -d

# View logs
docker-compose -f docker-compose-full.yml logs -f app
```

### Option 2: Run Locally with Gradle

#### Prerequisites
1. **PostgreSQL** - Install locally or use Docker
2. **Redis** - Install locally or use Docker

#### Setup Database
```bash
# If using Docker for just database
docker run -d \
  --name postgres \
  -e POSTGRES_DB=saas_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine

# Load schema
psql -h localhost -U postgres -d saas_platform -f database-setup.sql
```

#### Setup Redis
```bash
# Using Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### Build and Run
```bash
# Build the project
./gradlew clean build -x test

# Run the application
./gradlew bootRun

# Or run the JAR directly
java -jar build/libs/multi-role-*.jar
```

## 🔐 Default Credentials

```
Email: admin@saas.local
Password: admin123
Role: SUPER_ADMIN
```

## 📡 API Endpoints

### Authentication
- **POST** `/api/v1/auth/login` - Login with email and password

### Response Example
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@saas.local",
  "role": "SUPER_ADMIN",
  "message": "Login successful"
}
```

## 🛠️ Configuration

The application can be configured via:
1. `application.properties` (dev)
2. Environment variables (prod)
3. Docker environment variables

### Key Configuration Variables
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/saas_platform
spring.datasource.username=postgres
spring.datasource.password=password

# JWT
jwt.secret=MyVeryLongSecretKeyForJWTTokenGenerationAndValidationPurposesOnly1234567890
jwt.expiration=3600000

# Redis
spring.redis.host=localhost
spring.redis.port=6379

# Server
server.port=8080
```

## 📊 Monitoring & Management

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Metrics
```bash
curl http://localhost:8080/actuator/metrics
```

### pgAdmin (Database Management)
- **URL:** http://localhost:5050
- **Email:** admin@admin.com
- **Password:** admin

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Failed
1. Verify PostgreSQL is running
2. Check credentials in `application.properties`
3. Ensure database `saas_platform` exists

### Redis Connection Failed
1. Verify Redis is running on port 6379
2. Check Redis is accessible: `redis-cli ping`

## 📝 Project Structure

```
multi-role/
├── src/
│   ├── main/
│   │   ├── java/com/example/multi/_role/
│   │   │   ├── controller/       # REST Controllers
│   │   │   ├── service/          # Business Logic
│   │   │   ├── serviceimpl/      # Service Implementations
│   │   │   ├── repository/       # Data Access
│   │   │   ├── entity/           # JPA Entities
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── security/         # Security Config & JWT
│   │   │   └── MultiRoleApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/...
├── build.gradle
├── Dockerfile
├── docker-compose.yml
├── docker-compose-full.yml
└── database-setup.sql
```

## 🔄 CI/CD Deployment

### GitHub Actions Example
```yaml
name: Deploy SaaS Platform

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
      - run: ./gradlew clean build -x test
      - run: docker build -t saas-app:latest .
      - run: docker push saas-app:latest
```

## 📚 Additional Resources

- [Spring Boot 3 Documentation](https://docs.spring.io/spring-boot/docs/3.5.3/reference/html/)
- [Spring Security 6](https://docs.spring.io/spring-security/reference/index.html)
- [JWT Guide](https://tools.ietf.org/html/rfc7519)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎯 Next Steps

1. ✅ Verify the app runs successfully
2. ⏭️ Customize roles and permissions
3. ⏭️ Add more entities and business logic
4. ⏭️ Set up CI/CD pipeline
5. ⏭️ Deploy to production

---

**Need Help?** Check the logs:
```bash
# Docker logs
docker-compose logs -f app

# Local logs
tail -f logs/application.log
```
