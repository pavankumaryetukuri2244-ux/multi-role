package com.example.multi._role.config;

import com.example.multi._role.entity.*;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.SubscriptionPlanRepository;
import com.example.multi._role.repository.TenantRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.repository.ProductRepository;
import com.example.multi._role.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final ProductRepository productRepository;
    private final SubscriptionPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initializeData() {
        return args -> {
            log.info("Initializing database...");
            seedPlan("Free Tier", "FREE", "Basic access", BigDecimal.ZERO, BigDecimal.ZERO, 1, 5, 20, 100L, 0, false, false, false);
            seedPlan("Starter Tier", "STARTER", "Small teams", new BigDecimal("19.00"), new BigDecimal("190.00"), 1, 10, 100, 1024L, 100, false, true, false);
            seedPlan("Business Tier", "BUSINESS", "Growing enterprises", new BigDecimal("49.00"), new BigDecimal("490.00"), 3, 50, 500, 5120L, 500, true, true, true);
            seedPlan("Pro Tier", "PRO", "Power users", new BigDecimal("99.00"), new BigDecimal("990.00"), 5, 200, 2000, 20480L, 2000, true, true, true);
            seedPlan("Enterprise Tier", "ENTERPRISE", "Custom scale", new BigDecimal("299.00"), new BigDecimal("2990.00"), 20, 1000, 10000, 102400L, 10000, true, true, true);

            Role superAdminRole = roleRepository.findAll().stream()
                    .filter(r -> r.getRoleName() == RoleType.SUPER_ADMIN).findFirst()
                    .orElseGet(() -> { Role r = new Role(); r.setRoleName(RoleType.SUPER_ADMIN); return roleRepository.save(r); });

            Role adminRole = roleRepository.findAll().stream()
                    .filter(r -> r.getRoleName() == RoleType.ADMIN).findFirst()
                    .orElseGet(() -> { Role r = new Role(); r.setRoleName(RoleType.ADMIN); return roleRepository.save(r); });

            Role userRole = roleRepository.findAll().stream()
                    .filter(r -> r.getRoleName() == RoleType.USER).findFirst()
                    .orElseGet(() -> { Role r = new Role(); r.setRoleName(RoleType.USER); return roleRepository.save(r); });

            if (userRepository.findByEmail("admin@saas.local").isEmpty()) {
                User u = new User();
                u.setFirstName("Super"); u.setLastName("Admin");
                u.setEmail("admin@saas.local");
                u.setPassword(passwordEncoder.encode("admin123"));
                u.setActive(true); u.setApproved(true);
                u.setPhone("+15550100"); u.setStatus("ACTIVE");
                u.setRole(superAdminRole);
                userRepository.save(u);
                log.info("Default SUPER_ADMIN created");
            }

            Tenant testTenant = tenantRepository.findBySubdomain("test").orElseGet(() -> {
                Tenant t = new Tenant();
                t.setName("Test Company"); t.setSubdomain("test");
                t.setTenantCode("T-TEST"); t.setStatus("ACTIVE"); t.setActive(true);
                planRepository.findByName("Free Tier").ifPresent(t::setSubscriptionPlan);
                return tenantRepository.save(t);
            });
            if (testTenant.getTenantCode() == null) {
                testTenant.setTenantCode("T-TEST"); testTenant.setStatus("ACTIVE");
                testTenant = tenantRepository.save(testTenant);
            }

            // Create a test USER (Customer) user linked to the default Tenant
            boolean customerExists = userRepository.findByEmail("customer@saas.local").isPresent();
            if (!customerExists) {
                User testUser = new User();
                testUser.setFirstName("Customer");
                testUser.setLastName("User");
                testUser.setEmail("customer@saas.local");
                testUser.setPassword(passwordEncoder.encode("admin123"));
                testUser.setActive(true);
                testUser.setApproved(true);
                testUser.setRole(userRole);
                testUser.setTenant(testTenant);
                userRepository.save(testUser);
                log.info("✓ Test USER user created");
                log.info("  Email: customer@saas.local");
                log.info("  Password: admin123");
            }

            // Seed default products for testTenant
            if (productRepository != null && productRepository.count() == 0) {
                Product p1 = new Product();
                p1.setName("Wireless Headphones");
                p1.setDescription("Premium noise-cancelling over-ear headphones.");
                p1.setPrice(129.99);
                p1.setStock(50);
                p1.setTenant(testTenant);
                productRepository.save(p1);

                Product p2 = new Product();
                p2.setName("Smart Watch");
                p2.setDescription("Fitness tracker with heart rate monitor.");
                p2.setPrice(199.99);
                p2.setStock(30);
                p2.setTenant(testTenant);
                productRepository.save(p2);

                Product p3 = new Product();
                p3.setName("Mechanical Keyboard");
                p3.setDescription("RGB backlit mechanical keyboard with blue switches.");
                p3.setPrice(89.99);
                p3.setStock(100);
                p3.setTenant(testTenant);
                productRepository.save(p3);

                Product p4 = new Product();
                p4.setName("Leather Wallet");
                p4.setDescription("Genuine leather bi-fold wallet.");
                p4.setPrice(34.99);
                p4.setStock(15);
                p4.setTenant(testTenant);
                productRepository.save(p4);

                log.info("✓ Sample products seeded for Test Company");
            }

            if (userRepository.findByEmail("user@saas.local").isEmpty()) {
                User u = new User();
                u.setFirstName("Test"); u.setLastName("Admin");
                u.setEmail("user@saas.local");
                u.setPassword(passwordEncoder.encode("admin123"));
                u.setActive(true); u.setApproved(true);
                u.setPhone("+15550200"); u.setStatus("ACTIVE");
                u.setRole(adminRole); u.setTenant(testTenant);
                userRepository.save(u);
                log.info("Test ADMIN created");
            }
            log.info("Database initialization completed!");
        };
    }

    private void seedPlan(String name, String code, String description,
                          BigDecimal monthlyPrice, BigDecimal yearlyPrice,
                          int maxAdmins, int maxUsers, int maxProducts,
                          long storageLimit, int aiLimit,
                          boolean customDomain, boolean analytics, boolean apiAccess) {
        try {
            if (!planRepository.existsByName(name)) {
                SubscriptionPlan plan = new SubscriptionPlan();
                plan.setName(name); plan.setPlanCode(code);
                plan.setDescription(description);
                plan.setPrice(monthlyPrice);
                plan.setMonthlyPrice(monthlyPrice);
                plan.setYearlyPrice(yearlyPrice);
                plan.setMaxAdmins(maxAdmins); plan.setMaxUsers(maxUsers);
                plan.setMaxProducts(maxProducts);
                plan.setStorageLimit(storageLimit);
                plan.setAiRequestLimit(aiLimit);
                plan.setCustomDomainEnabled(customDomain);
                plan.setAnalyticsEnabled(analytics);
                plan.setApiAccessEnabled(apiAccess);
                plan.setActive(true);
                planRepository.save(plan);
                log.info("Seeded plan: {}", code);
            }
        } catch (Exception ex) {
            log.warn("Could not seed plan {}: {}", code, ex.getMessage());
        }
    }
}