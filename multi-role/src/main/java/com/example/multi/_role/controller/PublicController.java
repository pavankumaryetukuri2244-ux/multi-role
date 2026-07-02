package com.example.multi._role.controller;

import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.entity.Category;
import com.example.multi._role.entity.SubscriptionPlan;
import com.example.multi._role.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final SuperAdminService superAdminService;

    /**
     * Get All Categories (PUBLIC - No Authentication Required)
     * 
     * GET /api/v1/public/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = superAdminService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.<List<Category>>builder()
                .success(true)
                .message("Categories retrieved successfully")
                .data(categories)
                .build());
    }

    /**
     * Get All Subscription Plans (PUBLIC - No Authentication Required)
     * 
     * GET /api/v1/public/subscription-plans
     */
    @GetMapping("/subscription-plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlan>>> getAllSubscriptionPlans() {
        List<SubscriptionPlan> plans = superAdminService.getAllSubscriptionPlans();
        return ResponseEntity.ok(ApiResponse.<List<SubscriptionPlan>>builder()
                .success(true)
                .message("Subscription Plans retrieved successfully")
                .data(plans)
                .build());
    }
}
