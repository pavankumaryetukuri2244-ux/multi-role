package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.request.*;
import com.example.multi._role.dto.response.*;
import com.example.multi._role.entity.*;
import com.example.multi._role.repository.*;
import com.example.multi._role.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final CategoryRepository categoryRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PlatformSettingRepository platformSettingRepository;
    private final PasswordEncoder passwordEncoder;

    // --- Category Management ---

    @Override
    @Transactional
    public Category createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exists");
        }
        Category category = new Category();
        category.setName(request.getName());
        category.setCategoryCode(request.getCategoryCode());
        category.setDescription(request.getDescription());
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        categoryRepository.findByName(request.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Category name already exists");
            }
        });

        category.setName(request.getName());
        category.setCategoryCode(request.getCategoryCode());
        category.setDescription(request.getDescription());
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // --- Admin Account Management ---

    @Override
    @Transactional
    public UserResponse createAdmin(CreateAdminWithTenantRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }

        Tenant tenant;
        if (request.getTenantId() != null) {
            tenant = tenantRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
        } else {
            if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
                throw new RuntimeException("Company name is required for new tenant");
            }
            if (request.getSubdomain() == null || request.getSubdomain().isBlank()) {
                throw new RuntimeException("Subdomain is required for new tenant");
            }
            if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
                throw new RuntimeException("Subdomain is already taken");
            }

            // Create Tenant (Active)
            tenant = new Tenant();
            tenant.setName(request.getCompanyName());
            tenant.setSubdomain(request.getSubdomain());
            
            String tCode = request.getTenantCode();
            if (tCode == null || tCode.isBlank()) {
                tCode = "T-" + request.getSubdomain().toUpperCase();
            }
            tenant.setTenantCode(tCode);
            tenant.setActive(true);

            if (request.getPlanId() != null) {
                SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getPlanId())
                        .orElseThrow(() -> new RuntimeException("Subscription Plan not found"));
                tenant.setSubscriptionPlan(plan);
            }

            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                tenant.getCategories().add(category);
            }

            tenant = tenantRepository.save(tenant);
        }

        // Fetch ADMIN role
        Role adminRole = roleRepository.findByRoleName(RoleType.ADMIN)
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        // Create Admin (Active & Approved)
        User admin = new User();
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setActive(true);
        admin.setApproved(true);
        admin.setRole(adminRole);
        admin.setTenant(tenant);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            admin.getCategories().add(category);
        }

        User savedAdmin = userRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    @Override
    @Transactional
    public UserResponse updateAdmin(Long id, UpdateAdminRequest request) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));
        
        if (admin.getRole().getRoleName() != RoleType.ADMIN) {
            throw new RuntimeException("Selected user is not an Admin");
        }

        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        if (request.getActive() != null) {
            admin.setActive(request.getActive());
            // Sync active status with tenant if disabling admin
            if (admin.getTenant() != null) {
                admin.getTenant().setActive(request.getActive());
                tenantRepository.save(admin.getTenant());
            }
        }

        User savedAdmin = userRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    @Override
    @Transactional
    public UserResponse toggleAdminStatus(Long id, Boolean active) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));

        if (admin.getRole().getRoleName() != RoleType.ADMIN) {
            throw new RuntimeException("Selected user is not an Admin");
        }

        admin.setActive(active);
        if (admin.getTenant() != null) {
            admin.getTenant().setActive(active);
            tenantRepository.save(admin.getTenant());
        }

        User savedAdmin = userRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    @Override
    @Transactional
    public UserResponse approveAdmin(Long id) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));

        if (admin.getRole().getRoleName() != RoleType.ADMIN) {
            throw new RuntimeException("Selected user is not an Admin");
        }

        admin.setApproved(true);
        admin.setActive(true);
        if (admin.getTenant() != null) {
            admin.getTenant().setActive(true);
            tenantRepository.save(admin.getTenant());
        }

        User savedAdmin = userRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    @Override
    @Transactional
    public UserResponse assignCategoriesToAdmin(Long id, Set<Long> categoryIds) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));

        if (admin.getRole().getRoleName() != RoleType.ADMIN) {
            throw new RuntimeException("Selected user is not an Admin");
        }

        List<Category> categories = categoryRepository.findAllById(categoryIds);
        admin.setCategories(new HashSet<>(categories));

        User savedAdmin = userRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllAdmins() {
        return userRepository.findByRoleRoleName(RoleType.ADMIN).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    // --- Tenant Management ---

    @Override
    @Transactional
    public TenantResponse createTenant(CreateTenantRequest request) {
        if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
            throw new RuntimeException("Subdomain is already taken");
        }
        if (request.getCustomDomain() != null && !request.getCustomDomain().isBlank()
                && tenantRepository.existsByCustomDomain(request.getCustomDomain())) {
            throw new RuntimeException("Custom domain is already taken");
        }

        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setSubdomain(request.getSubdomain());
        if (request.getCustomDomain() != null && !request.getCustomDomain().isBlank()) {
            tenant.setCustomDomain(request.getCustomDomain());
        }
        tenant.setActive(true);
        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(this::mapToTenantResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenantResponse updateTenantName(Long tenantId, String name) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenant.setName(name);
        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public TenantResponse updateCustomDomain(Long tenantId, String customDomain) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (customDomain != null && !customDomain.isBlank()) {
            tenantRepository.findByCustomDomain(customDomain).ifPresent(existing -> {
                if (!existing.getId().equals(tenantId)) {
                    throw new RuntimeException("Custom domain already exists on another tenant");
                }
            });
            tenant.setCustomDomain(customDomain);
        } else {
            tenant.setCustomDomain(null);
        }

        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public TenantResponse updateSubdomain(Long tenantId, String subdomain) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        tenantRepository.findBySubdomain(subdomain).ifPresent(existing -> {
            if (!existing.getId().equals(tenantId)) {
                throw new RuntimeException("Subdomain already exists on another tenant");
            }
        });

        tenant.setSubdomain(subdomain);
        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public TenantResponse toggleTenantStatus(Long tenantId, Boolean active) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenant.setActive(active);
        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public TenantResponse assignCategoriesToTenant(Long tenantId, Set<Long> categoryIds) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        List<Category> categories = categoryRepository.findAllById(categoryIds);
        tenant.setCategories(new HashSet<>(categories));

        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public TenantResponse assignSubscriptionPlanToTenant(Long tenantId, Long planId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        SubscriptionPlan plan = null;
        if (planId != null) {
            plan = subscriptionPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Subscription Plan not found"));
        }
        tenant.setSubscriptionPlan(plan);
        Tenant savedTenant = tenantRepository.save(tenant);
        return mapToTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public void deleteTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Check if any users are linked to this tenant
        List<User> tenantUsers = userRepository.findByTenantId(tenantId);
        if (!tenantUsers.isEmpty()) {
            throw new RuntimeException("Cannot delete tenant: " + tenantUsers.size() + " user(s) are still linked to it");
        }

        tenantRepository.delete(tenant);
    }

    // --- Subscription Plan Management ---

    @Override
    @Transactional
    public SubscriptionPlan createSubscriptionPlan(SubscriptionPlanRequest request) {
        if (subscriptionPlanRepository.existsByName(request.getName())) {
            throw new RuntimeException("Subscription Plan name already exists");
        }

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(request.getName());
        plan.setPrice(request.getPrice());
        plan.setFeatures(request.getFeatures());
        plan.setDurationDays(request.getDurationDays());
        plan.setActive(request.getActive() != null ? request.getActive() : true);

        return subscriptionPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public SubscriptionPlan updateSubscriptionPlan(Long id, SubscriptionPlanRequest request) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription Plan not found"));

        subscriptionPlanRepository.findByName(request.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Subscription Plan name already exists");
            }
        });

        plan.setName(request.getName());
        plan.setPrice(request.getPrice());
        plan.setFeatures(request.getFeatures());
        plan.setDurationDays(request.getDurationDays());
        if (request.getActive() != null) {
            plan.setActive(request.getActive());
        }

        return subscriptionPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public void deleteSubscriptionPlan(Long id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription Plan not found"));
        subscriptionPlanRepository.delete(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlan> getAllSubscriptionPlans() {
        return subscriptionPlanRepository.findAll();
    }

    // --- Platform Analytics ---

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getPlatformAnalytics() {
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.findAll().stream().filter(Tenant::getActive).count();
        long totalAdmins = userRepository.findByRoleRoleName(RoleType.ADMIN).size();
        long totalUsers = userRepository.findByRoleRoleName(RoleType.USER).size();
        long totalCategories = categoryRepository.count();
        long totalSubscriptionPlans = subscriptionPlanRepository.count();

        return AnalyticsResponse.builder()
                .totalTenants(totalTenants)
                .activeTenants(activeTenants)
                .totalAdmins(totalAdmins)
                .totalUsers(totalUsers)
                .totalCategories(totalCategories)
                .totalSubscriptionPlans(totalSubscriptionPlans)
                .build();
    }

    // --- Platform Settings ---

    @Override
    @Transactional(readOnly = true)
    public List<PlatformSetting> getAllSettings() {
        return platformSettingRepository.findAll();
    }

    @Override
    @Transactional
    public PlatformSetting updateSetting(PlatformSettingRequest request) {
        PlatformSetting setting = platformSettingRepository.findBySettingKey(request.getSettingKey())
                .orElseGet(PlatformSetting::new);

        setting.setSettingKey(request.getSettingKey());
        setting.setSettingValue(request.getSettingValue());
        setting.setDescription(request.getDescription());

        return platformSettingRepository.save(setting);
    }

    private UserResponse mapToUserResponse(User user) {
        Set<String> categoryNames = new HashSet<>();
        if (user.getCategories() != null) {
            for (Category category : user.getCategories()) {
                categoryNames.add(category.getName());
            }
        }
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getRoleName().name())
                .active(user.getActive())
                .approved(user.getApproved())
                .tenantName(user.getTenant() != null ? user.getTenant().getName() : null)
                .companyName(user.getTenant() != null ? user.getTenant().getName() : null)
                .subdomain(user.getTenant() != null ? user.getTenant().getSubdomain() : null)
                .tenantCode(user.getTenant() != null ? user.getTenant().getTenantCode() : null)
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .categories(categoryNames)
                .build();
    }

    private TenantResponse mapToTenantResponse(Tenant tenant) {
        List<User> admins = userRepository.findByTenantIdAndRoleRoleName(tenant.getId(), RoleType.ADMIN);
        String adminName = admins.stream()
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .collect(Collectors.joining(", "));

        Set<String> categoryNames = new HashSet<>();
        if (tenant.getCategories() != null) {
            for (Category category : tenant.getCategories()) {
                categoryNames.add(category.getName());
            }
        }

        return TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .companyName(tenant.getName())
                .subdomain(tenant.getSubdomain())
                .customDomain(tenant.getCustomDomain())
                .active(tenant.getActive())
                .tenantUrl(tenant.getTenantUrl())
                .adminName(adminName.isEmpty() ? "—" : adminName)
                .categories(categoryNames)
                .subscriptionPlan(tenant.getSubscriptionPlan() != null ? tenant.getSubscriptionPlan().getName() : null)
                .build();
    }
}
