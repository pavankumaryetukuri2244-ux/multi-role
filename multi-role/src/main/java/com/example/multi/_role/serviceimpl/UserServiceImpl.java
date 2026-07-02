package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.request.UpdateProfileRequest;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.entity.Category;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = findUserByEmail(email);
        return mapToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantInfo(String email) {
        User user = findUserByEmail(email);

        if (user.getTenant() == null) {
            throw new RuntimeException("You are not associated with any tenant");
        }

        return mapToTenantResponse(user.getTenant());
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, String email) {
        User user = findUserByEmail(email);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    // --- Private Helpers ---

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
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
                .categories(categoryNames)
                .build();
    }

    private TenantResponse mapToTenantResponse(Tenant tenant) {
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
                .adminName("—")
                .categories(categoryNames)
                .build();
    }
}
