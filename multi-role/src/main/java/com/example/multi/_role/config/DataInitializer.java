package com.example.multi._role.config;

import com.example.multi._role.entity.Role;
import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.TenantRepository;
import com.example.multi._role.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initializeData() {
        return args -> {
            log.info("Initializing database with default roles, tenants, and users...");

            // Create SUPER_ADMIN role
            Role superAdminRole = roleRepository.findAll()
                    .stream()
                    .filter(r -> r.getRoleName() == RoleType.SUPER_ADMIN)
                    .findFirst()
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setRoleName(RoleType.SUPER_ADMIN);
                        return roleRepository.save(role);
                    });

            // Create ADMIN role
            Role adminRole = roleRepository.findAll()
                    .stream()
                    .filter(r -> r.getRoleName() == RoleType.ADMIN)
                    .findFirst()
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setRoleName(RoleType.ADMIN);
                        return roleRepository.save(role);
                    });

            // Create USER role
            Role userRole = roleRepository.findAll()
                    .stream()
                    .filter(r -> r.getRoleName() == RoleType.USER)
                    .findFirst()
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setRoleName(RoleType.USER);
                        return roleRepository.save(role);
                    });

            log.info("✓ Roles initialized: SUPER_ADMIN, ADMIN, USER");

            // Create default SUPER_ADMIN user
            boolean userExists = userRepository.findByEmail("admin@saas.local").isPresent();
            if (!userExists) {
                User adminUser = new User();
                adminUser.setFirstName("Super");
                adminUser.setLastName("Admin");
                adminUser.setEmail("admin@saas.local");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setActive(true);
                adminUser.setApproved(true);
                adminUser.setRole(superAdminRole);
                userRepository.save(adminUser);
                log.info("✓ Default SUPER_ADMIN user created");
                log.info("  Email: admin@saas.local");
                log.info("  Password: admin123");
            }

            // Create a default Tenant for the test ADMIN
            Tenant testTenant = tenantRepository.findBySubdomain("test")
                    .orElseGet(() -> {
                        Tenant tenant = new Tenant();
                        tenant.setName("Test Company");
                        tenant.setSubdomain("test");
                        tenant.setActive(true);
                        return tenantRepository.save(tenant);
                    });

            // Create a test ADMIN user linked to the default Tenant
            boolean adminTestExists = userRepository.findByEmail("user@saas.local").isPresent();
            if (!adminTestExists) {
                User testAdmin = new User();
                testAdmin.setFirstName("Test");
                testAdmin.setLastName("Admin");
                testAdmin.setEmail("user@saas.local");
                testAdmin.setPassword(passwordEncoder.encode("admin123"));
                testAdmin.setActive(true);
                testAdmin.setApproved(true);
                testAdmin.setRole(adminRole);
                testAdmin.setTenant(testTenant);
                userRepository.save(testAdmin);
                log.info("✓ Test ADMIN user created");
                log.info("  Email: user@saas.local");
                log.info("  Password: admin123");
                log.info("  Tenant: Test Company (test.saas.local)");
            }

            log.info("✓ Database initialization completed!");
            log.info("");
            log.info("╔════════════════════════════════════════╗");
            log.info("║  Application Ready for Testing!        ║");
            log.info("╠════════════════════════════════════════╣");
            log.info("║  API URL: http://localhost:8080        ║");
            log.info("║  Health: http://localhost:8080/actuator/health");
            log.info("║  H2 Console: http://localhost:8080/h2-console");
            log.info("╚════════════════════════════════════════╝");
        };
    }
}
