package com.example.multi._role.controller;

import com.example.multi._role.dto.request.LoginRequest;
import com.example.multi._role.dto.request.RegisterAdminRequest;
import com.example.multi._role.dto.request.ForgotPasswordRequest;
import com.example.multi._role.dto.request.ResetPasswordRequest;
import com.example.multi._role.dto.request.UserRegisterRequest;
import com.example.multi._role.dto.request.LogoutRequest;
import com.example.multi._role.dto.response.LoginResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.dto.response.LogoutResponse;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Login API
     *
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid
            @RequestBody
            LoginRequest request
    ) {
        LoginResponse response =
                authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Admin Login API - Only for ADMIN and SUPER_ADMIN roles
     *
     * POST /api/v1/auth/admin-login
     */
    @PostMapping("/admin-login")
    public ResponseEntity<LoginResponse> adminLogin(
            @Valid
            @RequestBody
            LoginRequest request
    ) {
        LoginResponse response =
                authService.adminLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Forgot Password - generate OTP and send (console in dev)
     *
     * POST /api/v1/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.generatePasswordResetOtp(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("OTP generated and sent to registered email (development: logged to console)")
                .build());
    }

    /**
     * Reset Password - verify OTP and set new password
     *
     * POST /api/v1/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Password reset successful")
                .build());
    }

    /**
     * Logout API
     *
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(
            @Valid
            @RequestBody
            LogoutRequest request
    ) {
        LogoutResponse response = authService.logout(request);
        return ResponseEntity.ok(response);
    }

    /**
     * User Registration API
     *
     * POST /api/v1/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid
            @RequestBody
            UserRegisterRequest request
    ) {
        UserResponse response = authService.registerUser(request);
        return ResponseEntity.ok(response);
    }
}
