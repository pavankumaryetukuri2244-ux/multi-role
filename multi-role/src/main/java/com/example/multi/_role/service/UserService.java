package com.example.multi._role.service;

import com.example.multi._role.dto.request.UpdateProfileRequest;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;

public interface UserService {

    UserResponse getProfile(String email);

    TenantResponse getTenantInfo(String email);

    UserResponse updateProfile(UpdateProfileRequest request, String email);

    void changePassword(com.example.multi._role.dto.request.ChangePasswordRequest request, String email);
}
