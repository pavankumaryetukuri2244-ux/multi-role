package com.example.multi._role.service;

import com.example.multi._role.dto.request.*;
import com.example.multi._role.dto.response.*;
import com.example.multi._role.entity.Category;
import com.example.multi._role.entity.PlatformSetting;
import com.example.multi._role.entity.SubscriptionPlan;
import java.util.List;
import java.util.Set;

public interface SuperAdminService {

    // Category Management
    Category createCategory(CategoryRequest request);
    Category updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    List<Category> getAllCategories();

    // Admin Account Management
    UserResponse createAdmin(CreateAdminWithTenantRequest request);
    UserResponse updateAdmin(Long id, UpdateAdminRequest request);
    UserResponse toggleAdminStatus(Long id, Boolean active);
    UserResponse approveAdmin(Long id);
    UserResponse assignCategoriesToAdmin(Long id, Set<Long> categoryIds);
    List<UserResponse> getAllAdmins();

    // Tenant Management
    TenantResponse createTenant(CreateTenantRequest request);
    List<TenantResponse> getAllTenants();
    TenantResponse updateTenantName(Long tenantId, String name);
    TenantResponse updateCustomDomain(Long tenantId, String customDomain);
    TenantResponse updateSubdomain(Long tenantId, String subdomain);
    TenantResponse toggleTenantStatus(Long tenantId, Boolean active);
    TenantResponse assignCategoriesToTenant(Long tenantId, Set<Long> categoryIds);
    TenantResponse assignSubscriptionPlanToTenant(Long tenantId, Long planId);
    void deleteTenant(Long tenantId);

    // Subscription Plan Management
    SubscriptionPlan createSubscriptionPlan(SubscriptionPlanRequest request);
    SubscriptionPlan updateSubscriptionPlan(Long id, SubscriptionPlanRequest request);
    void deleteSubscriptionPlan(Long id);
    List<SubscriptionPlan> getAllSubscriptionPlans();

    // Platform Analytics
    AnalyticsResponse getPlatformAnalytics();

    // Platform Settings
    List<PlatformSetting> getAllSettings();
    PlatformSetting updateSetting(PlatformSettingRequest request);
}
