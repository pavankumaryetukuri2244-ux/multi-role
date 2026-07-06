package com.example.multi._role.controller;

import com.example.multi._role.dto.request.UpdateProfileRequest;
import com.example.multi._role.dto.request.ChangePasswordRequest;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.Order;
import com.example.multi._role.service.UserService;
import com.example.multi._role.service.ProductService;
import com.example.multi._role.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/user")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;

    /**
     * Get logged-in User's own profile
     *
     * GET /api/v1/user/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Principal principal) {
        UserResponse response = userService.getProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile retrieved successfully")
                .data(response)
                .build());
    }

    /**
     * Get logged-in User's tenant information (Tenant Portal)
     *
     * GET /api/v1/user/tenant
     */
    @GetMapping("/tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantInfo(Principal principal) {
        TenantResponse response = userService.getTenantInfo(principal.getName());
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant information retrieved successfully")
                .data(response)
                .build());
    }

    /**
     * Update logged-in User's own profile (firstName, lastName)
     *
     * PUT /api/v1/user/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Principal principal
    ) {
        UserResponse response = userService.updateProfile(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(response)
                .build());
    }

    /**
<<<<<<< Updated upstream
     * Get all products available in user's tenant
     *
     * GET /api/v1/user/products
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<Product>>> getProducts(Principal principal) {
        List<Product> products = productService.getProductsByTenant(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<Product>>builder()
                .success(true)
                .message("Products retrieved successfully")
                .data(products)
                .build());
    }

    /**
     * Order Request DTO
     */
    public static class OrderRequest {
        public Long productId;
        public Integer quantity;
    }

    /**
     * Place an order (buy product)
     *
     * POST /api/v1/user/orders
     */
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<Order>> placeOrder(
            @Valid @RequestBody OrderRequest request,
            Principal principal
    ) {
        Order order = orderService.placeOrder(request.productId, request.quantity, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Order>builder()
                .success(true)
                .message("Order placed successfully")
                .data(order)
                .build());
    }

    /**
     * Get logged-in user's own orders
     *
     * GET /api/v1/user/orders
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(Principal principal) {
        List<Order> orders = orderService.getOrdersByUser(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<Order>>builder()
                .success(true)
                .message("Orders retrieved successfully")
                .data(orders)
=======
     * Change logged-in User's password
     *
     * PUT /api/v1/user/password
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal
    ) {
        userService.changePassword(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Password changed successfully")
>>>>>>> Stashed changes
                .build());
    }
}
