# Build Stage
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle clean build -x test --no-daemon

# Runtime Stage
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy the built JAR from builder
COPY --from=builder /app/build/libs/multi-role-*.jar app.jar

# Create a non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD java -cp app.jar org.springframework.boot.loader.JarLauncher -c "curl -f http://localhost:8080/actuator/health || exit 1" || exit 1

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
