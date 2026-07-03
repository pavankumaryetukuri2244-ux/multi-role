package com.example.multi._role.controller;

import com.example.multi._role.dto.request.CreateUserRequest;
import com.example.multi._role.dto.request.UpdateUserRequest;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.TenantResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.Order;
import com.example.multi._role.service.AdminService;
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
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final OrderService orderService;

    /**
     * Create User in ADMIN's Tenant
     *
     * POST /api/v1/admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            Principal principal
    ) {
        UserResponse response = adminService.createUser(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User created successfully in your tenant")
                .data(response)
                .build());
    }

    /**
     * Update User in ADMIN's Tenant
     *
     * PUT /api/v1/admin/users/{id}
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            Principal principal
    ) {
        UserResponse response = adminService.updateUser(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User updated successfully")
                .data(response)
                .build());
    }

    /**
     * Delete/Disable User from ADMIN's Tenant
     *
     * DELETE /api/v1/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            Principal principal
    ) {
        adminService.deleteUser(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("User deleted successfully from your tenant")
                .build());
    }

    /**
     * Get All Users in ADMIN's Tenant
     *
     * GET /api/v1/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(Principal principal) {
        List<UserResponse> users = adminService.getAllUsers(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Users retrieved successfully")
                .data(users)
                .build());
    }

    /**
     * Get ADMIN's own Tenant Info
     *
     * GET /api/v1/admin/tenant
     */
    @GetMapping("/tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenantInfo(Principal principal) {
        TenantResponse tenant = adminService.getTenantInfo(principal.getName());
        return ResponseEntity.ok(ApiResponse.<TenantResponse>builder()
                .success(true)
                .message("Tenant information retrieved successfully")
                .data(tenant)
                .build());
    }

    /**
     * Get all products for admin's tenant
     *
     * GET /api/v1/admin/products
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
     * Create product for admin's tenant
     *
     * POST /api/v1/admin/products
     */
    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @Valid @RequestBody Product product,
            Principal principal
    ) {
        Product created = productService.createProduct(product, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Product>builder()
                .success(true)
                .message("Product created successfully")
                .data(created)
                .build());
    }

    /**
     * Update product in admin's tenant
     *
     * PUT /api/v1/admin/products/{id}
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product,
            Principal principal
    ) {
        Product updated = productService.updateProduct(id, product, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Product>builder()
                .success(true)
                .message("Product updated successfully")
                .data(updated)
                .build());
    }

    /**
     * Delete product from admin's tenant
     *
     * DELETE /api/v1/admin/products/{id}
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            Principal principal
    ) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Product deleted successfully")
                .build());
    }

    /**
     * Get all orders placed in admin's tenant
     *
     * GET /api/v1/admin/orders
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getTenantOrders(Principal principal) {
        List<Order> orders = orderService.getOrdersByTenant(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<Order>>builder()
                .success(true)
                .message("Orders retrieved successfully")
                .data(orders)
                .build());
    }
}
