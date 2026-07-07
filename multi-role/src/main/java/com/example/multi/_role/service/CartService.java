package com.example.multi._role.service;

import com.example.multi._role.dto.request.CartItemRequest;
import com.example.multi._role.dto.response.CartResponse;

public interface CartService {
    CartResponse addProductToCart(CartItemRequest request, String userEmail);
    CartResponse updateCartItemQuantity(Long cartItemId, Integer quantity, String userEmail);
    CartResponse removeProductFromCart(Long cartItemId, String userEmail);
    CartResponse getCart(String userEmail);
    void clearCart(String userEmail);
}
