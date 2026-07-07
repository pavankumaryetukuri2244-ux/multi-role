package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.response.UserCategoryResponse;
import com.example.multi._role.entity.Category;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.entity.UserCategory;
import com.example.multi._role.exception.CategoryNotFoundException;
import com.example.multi._role.exception.UnauthorizedTenantAccessException;
import com.example.multi._role.repository.CategoryRepository;
import com.example.multi._role.repository.UserCategoryRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.UserCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserCategoryServiceImpl implements UserCategoryService {

    private final UserCategoryRepository userCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserCategoryResponse selectCategory(Long categoryId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Tenant tenant = user.getTenant();
        if (tenant == null) {
            throw new RuntimeException("User is not associated with any tenant");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        // Validate tenant isolation
        if (!category.getTenant().getId().equals(tenant.getId())) {
            throw new UnauthorizedTenantAccessException("Unauthorized: You cannot select a category belonging to another tenant");
        }

        // Validate category status
        if (!"ACTIVE".equalsIgnoreCase(category.getStatus())) {
            throw new RuntimeException("Cannot select an inactive category");
        }

        // Check if already selected
        UserCategory userCategory = userCategoryRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                .orElseGet(() -> {
                    UserCategory uc = new UserCategory();
                    uc.setUser(user);
                    uc.setCategory(category);
                    return userCategoryRepository.save(uc);
                });

        return mapToResponse(userCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserCategoryResponse> getSelectedCategories(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userCategoryRepository.findAllByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deselectCategory(Long categoryId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserCategory userCategory = userCategoryRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Selected category mapping not found"));

        userCategoryRepository.delete(userCategory);
    }

    private UserCategoryResponse mapToResponse(UserCategory userCategory) {
        return UserCategoryResponse.builder()
                .id(userCategory.getId())
                .userId(userCategory.getUser().getId())
                .categoryId(userCategory.getCategory().getId())
                .categoryName(userCategory.getCategory().getName())
                .categoryCode(userCategory.getCategory().getCategoryCode())
                .build();
    }
}
