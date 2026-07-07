package com.example.multi._role.controller;

import com.example.multi._role.dto.request.CategoryRequest;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.CategoryResponse;
import com.example.multi._role.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            Principal principal
    ) {
        CategoryResponse response = categoryService.createCategory(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category created successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            Principal principal
    ) {
        CategoryResponse response = categoryService.updateCategory(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category updated successfully")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            Principal principal
    ) {
        categoryService.deleteCategory(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Category deleted successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable Long id,
            Principal principal
    ) {
        CategoryResponse response = categoryService.getCategoryById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(Principal principal) {
        List<CategoryResponse> categories = categoryService.getAllCategories(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .message("Categories retrieved successfully")
                .data(categories)
                .build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleCategoryStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal
    ) {
        CategoryResponse response = categoryService.toggleCategoryStatus(id, status, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Category status updated successfully")
                .data(response)
                .build());
    }
}
