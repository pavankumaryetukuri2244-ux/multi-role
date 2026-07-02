package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.request.CreateUserRequest;
import com.example.multi._role.dto.request.UpdateUserRequest;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.entity.Role;
import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request, String adminEmail) {
        User admin = getAdminAndValidateTenant(adminEmail);
        Tenant tenant = admin.getTenant();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }

        Role userRole = roleRepository.findByRoleName(RoleType.USER)
                .orElseThrow(() -> new RuntimeException("USER role not found"));

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.setApproved(true);
        user.setRole(userRole);
        user.setTenant(tenant);

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, String adminEmail) {
        User admin = getAdminAndValidateTenant(adminEmail);
        Tenant tenant = admin.getTenant();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTenant() == null || !user.getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Access denied: User does not belong to your tenant");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, String adminEmail) {
        User admin = getAdminAndValidateTenant(adminEmail);
        Tenant tenant = admin.getTenant();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTenant() == null || !user.getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Access denied: User does not belong to your tenant");
        }

        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String adminEmail) {
        User admin = getAdminAndValidateTenant(adminEmail);
        Tenant tenant = admin.getTenant();

        return userRepository.findByTenantIdAndRoleRoleName(tenant.getId(), RoleType.USER).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantInfo(String adminEmail) {
        User admin = getAdminAndValidateTenant(adminEmail);
        Tenant tenant = admin.getTenant();
        return mapToTenantResponse(tenant);
    }

    // --- Private Helper Methods ---

    private User getAdminAndValidateTenant(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (admin.getRole().getRoleName() != RoleType.ADMIN) {
            throw new RuntimeException("User is not an Admin");
        }

        if (admin.getTenant() == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        return admin;
    }

    private UserResponse mapToUserResponse(User user) {
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
                .categories(Collections.emptySet())
                .build();
    }

    private TenantResponse mapToTenantResponse(Tenant tenant) {
        java.util.Set<String> categoryNames = new java.util.HashSet<>();
        if (tenant.getCategories() != null) {
            for (com.example.multi._role.entity.Category category : tenant.getCategories()) {
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
                .adminName("—")
                .categories(categoryNames)
                .build();
    }
}
