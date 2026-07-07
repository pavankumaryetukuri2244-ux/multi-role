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
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.multi._role.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

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

    @Override
    @Transactional
    public void changePassword(com.example.multi._role.dto.request.ChangePasswordRequest request, String email) {
        User user = findUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse uploadProfileImage(MultipartFile file, String email) {
        User user = findUserByEmail(email);
        String imagePath = fileStorageService.storeFile(file);
        user.setProfileImage(imagePath);
        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public void deleteAccount(String email) {
        User user = findUserByEmail(email);
        user.setActive(false);
        user.setStatus("DELETED");
        userRepository.save(user);
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
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
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
