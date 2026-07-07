package com.example.multi._role.controller;

import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.CategoryResponse;
import com.example.multi._role.dto.response.UserCategoryResponse;
import com.example.multi._role.service.CategoryService;
import com.example.multi._role.service.UserCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/user/categories")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserCategoryController {

    private final CategoryService categoryService;
    private final UserCategoryService userCategoryService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories(Principal principal) {
        List<CategoryResponse> categories = categoryService.getActiveCategories(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .message("Active categories retrieved successfully")
                .data(categories)
                .build());
    }

    @PostMapping("/select/{categoryId}")
    public ResponseEntity<ApiResponse<UserCategoryResponse>> selectCategory(
            @PathVariable Long categoryId,
            Principal principal
    ) {
        UserCategoryResponse response = userCategoryService.selectCategory(categoryId, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserCategoryResponse>builder()
                .success(true)
                .message("Category selected successfully")
                .data(response)
                .build());
    }

    @GetMapping("/selected")
    public ResponseEntity<ApiResponse<List<UserCategoryResponse>>> getSelectedCategories(Principal principal) {
        List<UserCategoryResponse> responses = userCategoryService.getSelectedCategories(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<UserCategoryResponse>>builder()
                .success(true)
                .message("Selected categories retrieved successfully")
                .data(responses)
                .build());
    }

    @DeleteMapping("/select/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deselectCategory(
            @PathVariable Long categoryId,
            Principal principal
    ) {
        userCategoryService.deselectCategory(categoryId, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Category deselected successfully")
                .build());
    }
}
