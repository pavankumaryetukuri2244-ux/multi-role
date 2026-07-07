package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.request.CategoryRequest;
import com.example.multi._role.dto.response.CategoryResponse;
import com.example.multi._role.entity.Category;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.exception.*;
import com.example.multi._role.repository.CategoryRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        // Unique check within tenant
        if (categoryRepository.existsByNameAndTenantId(request.getName(), tenant.getId())) {
            throw new DuplicateCategoryException("Category name already exists in this tenant");
        }
        if (categoryRepository.existsByCategoryCodeAndTenantId(request.getCategoryCode(), tenant.getId())) {
            throw new DuplicateCategoryException("Category code already exists in this tenant");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setCategoryCode(request.getCategoryCode());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        category.setTenant(tenant);

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        if (!category.getTenant().getId().equals(tenant.getId())) {
            throw new UnauthorizedTenantAccessException("Unauthorized: Category does not belong to your tenant");
        }

        // Unique checks within tenant (excluding this category itself)
        categoryRepository.findByNameAndTenantId(request.getName(), tenant.getId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateCategoryException("Category name already exists in this tenant");
                    }
                });

        categoryRepository.findByCategoryCodeAndTenantId(request.getCategoryCode(), tenant.getId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateCategoryException("Category code already exists in this tenant");
                    }
                });

        category.setName(request.getName());
        category.setCategoryCode(request.getCategoryCode());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        if (!category.getTenant().getId().equals(tenant.getId())) {
            throw new UnauthorizedTenantAccessException("Unauthorized: Category does not belong to your tenant");
        }

        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        if (!category.getTenant().getId().equals(tenant.getId())) {
            throw new UnauthorizedTenantAccessException("Unauthorized: Category does not belong to your tenant");
        }

        return mapToResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        return categoryRepository.findAllByTenantId(tenant.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse toggleCategoryStatus(Long id, String status, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        if (!category.getTenant().getId().equals(tenant.getId())) {
            throw new UnauthorizedTenantAccessException("Unauthorized: Category does not belong to your tenant");
        }

        if (!"ACTIVE".equalsIgnoreCase(status) && !"INACTIVE".equalsIgnoreCase(status)) {
            throw new RuntimeException("Invalid status value. Must be ACTIVE or INACTIVE");
        }

        category.setStatus(status.toUpperCase());
        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Tenant tenant = user.getTenant();
        if (tenant == null) {
            throw new RuntimeException("User is not associated with any tenant");
        }

        return categoryRepository.findAllByTenantIdAndStatus(tenant.getId(), "ACTIVE").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .categoryCode(category.getCategoryCode())
                .description(category.getDescription())
                .icon(category.getIcon())
                .status(category.getStatus())
                .tenantId(category.getTenant().getId())
                .build();
    }
}
