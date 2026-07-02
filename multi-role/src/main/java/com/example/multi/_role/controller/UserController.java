package com.example.multi._role.controller;

import com.example.multi._role.dto.request.UpdateProfileRequest;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/user")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get logged-in User's own profile
     *
     * GET /api/v1/user/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Principal principal) {
        UserResponse response = userService.getProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile retrieved successfully")
                .data(response)
                .build());
    }

    /**
     * Get logged-in User's tenant information (Tenant Portal)
     *
     * GET /api/v1/user/tenant
     */
    @GetMapping("/tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantInfo(Principal principal) {
        TenantResponse response = userService.getTenantInfo(principal.getName());
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant information retrieved successfully")
                .data(response)
                .build());
    }

    /**
     * Update logged-in User's own profile (firstName, lastName)
     *
     * PUT /api/v1/user/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Principal principal
    ) {
        UserResponse response = userService.updateProfile(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(response)
                .build());
    }
}
