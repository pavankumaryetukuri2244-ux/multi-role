package com.example.multi._role.controller;

import com.example.multi._role.dto.request.CreateUserRequest;
import com.example.multi._role.dto.request.UpdateUserRequest;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Create User in ADMIN's Tenant
     *
     * POST /api/v1/admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            Principal principal
    ) {
        UserResponse response = adminService.createUser(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User created successfully in your tenant")
                .data(response)
                .build());
    }

    /**
     * Update User in ADMIN's Tenant
     *
     * PUT /api/v1/admin/users/{id}
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            Principal principal
    ) {
        UserResponse response = adminService.updateUser(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User updated successfully")
                .data(response)
                .build());
    }

    /**
     * Delete/Disable User from ADMIN's Tenant
     *
     * DELETE /api/v1/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            Principal principal
    ) {
        adminService.deleteUser(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("User deleted successfully from your tenant")
                .build());
    }

    /**
     * Get All Users in ADMIN's Tenant
     *
     * GET /api/v1/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(Principal principal) {
        List<UserResponse> users = adminService.getAllUsers(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Users retrieved successfully")
                .data(users)
                .build());
    }

    /**
     * Get ADMIN's own Tenant Info
     *
     * GET /api/v1/admin/tenant
     */
    @GetMapping("/tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantInfo(Principal principal) {
        TenantResponse tenant = adminService.getTenantInfo(principal.getName());
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant information retrieved successfully")
                .data(tenant)
                .build());
    }
}
