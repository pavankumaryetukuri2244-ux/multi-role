package com.example.multi._role.service;

import com.example.multi._role.dto.request.CreateUserRequest;
import com.example.multi._role.dto.request.UpdateUserRequest;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import java.util.List;

public interface AdminService {

    UserResponse createUser(CreateUserRequest request, String adminEmail);

    UserResponse updateUser(Long id, UpdateUserRequest request, String adminEmail);

    void deleteUser(Long id, String adminEmail);

    List<UserResponse> getAllUsers(String adminEmail);

    TenantResponse getTenantInfo(String adminEmail);
}
