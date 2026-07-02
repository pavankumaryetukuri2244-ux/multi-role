package com.example.multi._role.service;

import com.example.multi._role.dto.request.LoginRequest;
import com.example.multi._role.dto.request.RegisterAdminRequest;
import com.example.multi._role.dto.request.ForgotPasswordRequest;
import com.example.multi._role.dto.request.ResetPasswordRequest;
import com.example.multi._role.dto.request.UserRegisterRequest;
import com.example.multi._role.dto.request.LogoutRequest;
import com.example.multi._role.dto.response.LoginResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.dto.response.LogoutResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse adminLogin(LoginRequest request);

    UserResponse registerAdmin(RegisterAdminRequest request);

    UserResponse registerUser(UserRegisterRequest request);

    LogoutResponse logout(LogoutRequest request);

    void generatePasswordResetOtp(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    boolean isTokenBlacklisted(String token);
}
