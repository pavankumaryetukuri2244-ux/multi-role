package com.example.multi._role.controller;

import com.example.multi._role.dto.request.CartItemRequest;
import com.example.multi._role.dto.response.ApiResponse;
import com.example.multi._role.dto.response.CartResponse;
import com.example.multi._role.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/user/cart")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addProductToCart(
            @Valid @RequestBody CartItemRequest request,
            Principal principal
    ) {
        CartResponse response = cartService.addProductToCart(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Product added to cart successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItemQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Principal principal
    ) {
        CartResponse response = cartService.updateCartItemQuantity(cartItemId, quantity, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart item quantity updated successfully")
                .data(response)
                .build());
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeProductFromCart(
            @PathVariable Long cartItemId,
            Principal principal
    ) {
        CartResponse response = cartService.removeProductFromCart(cartItemId, principal.getName());
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Product removed from cart successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Principal principal) {
        CartResponse response = cartService.getCart(principal.getName());
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart retrieved successfully")
                .data(response)
                .build());
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Cart cleared successfully")
                .build());
    }
}
