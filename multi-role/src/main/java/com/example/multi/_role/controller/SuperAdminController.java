package com.example.multi._role.controller;

import com.example.multi._role.dto.request.*;
import com.example.multi._role.dto.response.*;
import com.example.multi._role.entity.Category;
import com.example.multi._role.entity.PlatformSetting;
import com.example.multi._role.entity.SubscriptionPlan;
import com.example.multi._role.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    // --- Category Management ---

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        Category category = superAdminService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.<Category>builder()
                .success(true)
                .message("Category created successfully")
                .data(category)
                .build());
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        Category category = superAdminService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.<Category>builder()
                .success(true)
                .message("Category updated successfully")
                .data(category)
                .build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        superAdminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Category deleted successfully")
                .build());
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = superAdminService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.<List<Category>>builder()
                .success(true)
                .message("Categories retrieved successfully")
                .data(categories)
                .build());
    }

    // --- Admin Account Management ---

    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<UserResponse>> createAdmin(
            @Valid @RequestBody CreateAdminWithTenantRequest request
    ) {
        UserResponse response = superAdminService.createAdmin(request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Admin account created successfully")
                .data(response)
                .build());
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminRequest request
    ) {
        UserResponse response = superAdminService.updateAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Admin account updated successfully")
                .data(response)
                .build());
    }

    @PutMapping("/admins/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleAdminStatus(
            @PathVariable Long id,
            @RequestParam Boolean active
    ) {
        UserResponse response = superAdminService.toggleAdminStatus(id, active);
        String msg = active ? "Admin account enabled" : "Admin account disabled";
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message(msg)
                .data(response)
                .build());
    }

    @PutMapping("/admins/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approveAdmin(@PathVariable Long id) {
        UserResponse response = superAdminService.approveAdmin(id);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Admin registration approved successfully")
                .data(response)
                .build());
    }

    @PutMapping("/admins/{id}/categories")
    public ResponseEntity<ApiResponse<UserResponse>> assignCategories(
            @PathVariable Long id,
            @Valid @RequestBody AssignCategoriesRequest request
    ) {
        UserResponse response = superAdminService.assignCategoriesToAdmin(id, request.getCategoryIds());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Categories assigned to Admin successfully")
                .data(response)
                .build());
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllAdmins() {
        List<UserResponse> admins = superAdminService.getAllAdmins();
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Admin accounts retrieved successfully")
                .data(admins)
                .build());
    }

    // --- Tenant Management ---

    @PostMapping("/tenants")
    public ResponseEntity<ApiResponse<TenantResponse>> createTenant(
            @Valid @RequestBody CreateTenantRequest request
    ) {
        TenantResponse response = superAdminService.createTenant(request);
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant created successfully")
                .data(response)
                .build());
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAllTenants() {
        List<TenantResponse> tenants = superAdminService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.<List<TenantResponse>>builder()
                .success(true)
                .message("Tenants retrieved successfully")
                .data(tenants)
                .build());
    }

    @PutMapping("/tenants/{id}/name")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenantName(
            @PathVariable Long id,
            @RequestParam String name
    ) {
        TenantResponse response = superAdminService.updateTenantName(id, name);
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant name updated successfully")
                .data(response)
                .build());
    }

    @PutMapping("/tenants/{id}/custom-domain")
    public ResponseEntity<ApiResponse<TenantResponse>> updateCustomDomain(
            @PathVariable Long id,
            @Valid @RequestBody CustomDomainRequest request
    ) {
        TenantResponse response = superAdminService.updateCustomDomain(id, request.getCustomDomain());
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant custom domain updated successfully")
                .data(response)
                .build());
    }

    @PutMapping("/tenants/{id}/subdomain")
    public ResponseEntity<ApiResponse<TenantResponse>> updateSubdomain(
            @PathVariable Long id,
            @RequestParam String subdomain
    ) {
        TenantResponse response = superAdminService.updateSubdomain(id, subdomain);
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant subdomain updated successfully")
                .data(response)
                .build());
    }

    @PutMapping("/tenants/{id}/status")
    public ResponseEntity<ApiResponse<TenantResponse>> toggleTenantStatus(
            @PathVariable Long id,
            @RequestParam Boolean active
    ) {
        TenantResponse response = superAdminService.toggleTenantStatus(id, active);
        String msg = active ? "Tenant enabled" : "Tenant disabled";
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message(msg)
                .data(response)
                .build());
    }

    @PutMapping("/tenants/{id}/categories")
    public ResponseEntity<ApiResponse<TenantResponse>> assignCategoriesToTenant(
            @PathVariable Long id,
            @Valid @RequestBody AssignCategoriesRequest request
    ) {
        TenantResponse response = superAdminService.assignCategoriesToTenant(id, request.getCategoryIds());
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Categories assigned to Tenant successfully")
                .data(response)
                .build());
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable Long id) {
        superAdminService.deleteTenant(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Tenant deleted successfully")
                .build());
    }

    // --- Subscription Plan Management ---

    @PostMapping("/subscription-plans")
    public ResponseEntity<ApiResponse<SubscriptionPlan>> createSubscriptionPlan(
            @Valid @RequestBody SubscriptionPlanRequest request
    ) {
        SubscriptionPlan plan = superAdminService.createSubscriptionPlan(request);
        return ResponseEntity.ok(ApiResponse.<SubscriptionPlan>builder()
                .success(true)
                .message("Subscription Plan created successfully")
                .data(plan)
                .build());
    }

    @PutMapping("/subscription-plans/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlan>> updateSubscriptionPlan(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionPlanRequest request
    ) {
        SubscriptionPlan plan = superAdminService.updateSubscriptionPlan(id, request);
        return ResponseEntity.ok(ApiResponse.<SubscriptionPlan>builder()
                .success(true)
                .message("Subscription Plan updated successfully")
                .data(plan)
                .build());
    }

    @DeleteMapping("/subscription-plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubscriptionPlan(@PathVariable Long id) {
        superAdminService.deleteSubscriptionPlan(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Subscription Plan deleted successfully")
                .build());
    }

    @GetMapping("/subscription-plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getAllSubscriptionPlans() {
        List<SubscriptionPlan> plans = superAdminService.getAllSubscriptionPlans();
        return ResponseEntity.ok(ApiResponse.<List<SubscriptionPlan>>builder()
                .success(true)
                .message("Subscription Plans retrieved successfully")
                .data(plans)
                .build());
    }

    // --- Platform Analytics ---

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getPlatformAnalytics() {
        AnalyticsResponse response = superAdminService.getPlatformAnalytics();
        return ResponseEntity.ok(ApiResponse.<AnalyticsResponse>builder()
                .success(true)
                .message("Platform analytics retrieved successfully")
                .data(response)
                .build());
    }

    // --- Platform Settings ---

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<PlatformSetting>>> getAllSettings() {
        List<PlatformSetting> settings = superAdminService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.<List<PlatformSetting>>builder()
                .success(true)
                .message("Platform settings retrieved successfully")
                .data(settings)
                .build());
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<PlatformSetting>> updateSetting(
            @Valid @RequestBody PlatformSettingRequest request
    ) {
        PlatformSetting setting = superAdminService.updateSetting(request);
        return ResponseEntity.ok(ApiResponse.<PlatformSetting>builder()
                .success(true)
                .message("Platform setting updated successfully")
                .data(setting)
                .build());
    }
}
