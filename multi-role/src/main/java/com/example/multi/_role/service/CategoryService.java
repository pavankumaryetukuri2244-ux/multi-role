package com.example.multi._role.service;

import com.example.multi._role.dto.request.CategoryRequest;
import com.example.multi._role.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request, String adminEmail);
    CategoryResponse updateCategory(Long id, CategoryRequest request, String adminEmail);
    void deleteCategory(Long id, String adminEmail);
    CategoryResponse getCategoryById(Long id, String adminEmail);
    List<CategoryResponse> getAllCategories(String adminEmail);
    CategoryResponse toggleCategoryStatus(Long id, String status, String adminEmail);
    List<CategoryResponse> getActiveCategories(String userEmail);
}
