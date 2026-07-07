package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.request.CartItemRequest;
import com.example.multi._role.dto.response.CartItemResponse;
import com.example.multi._role.dto.response.CartResponse;
import com.example.multi._role.entity.CartItem;
import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.User;
import com.example.multi._role.exception.CartItemNotFoundException;
import com.example.multi._role.exception.DuplicateCartItemException;
import com.example.multi._role.exception.InsufficientStockException;
import com.example.multi._role.exception.UnauthorizedTenantAccessException;
import com.example.multi._role.repository.CartItemRepository;
import com.example.multi._role.repository.ProductRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponse addProductToCart(CartItemRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Validate tenant isolation
        if (user.getTenant() == null || product.getTenant() == null ||
                !user.getTenant().getId().equals(product.getTenant().getId())) {
            throw new UnauthorizedTenantAccessException("Unauthorized: Product does not belong to your tenant");
        }

        // Validate stock
        if (product.getStock() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock. Available stock: " + product.getStock());
        }

        // Prevent duplicate items
        cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId())
                .ifPresent(existing -> {
                    throw new DuplicateCartItemException("Product is already in your cart. Update the quantity instead.");
                });

        CartItem cartItem = new CartItem();
        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);
        return getCart(userEmail);
    }

    @Override
    @Transactional
    public CartResponse updateCartItemQuantity(Long cartItemId, Integer quantity, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        // Validate stock
        if (cartItem.getProduct().getStock() < quantity) {
            throw new InsufficientStockException("Insufficient stock. Available stock: " + cartItem.getProduct().getStock());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return getCart(userEmail);
    }

    @Override
    @Transactional
    public CartResponse removeProductFromCart(Long cartItemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(cartItem);
        return getCart(userEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findAllByUserId(user.getId());

        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .price(item.getProduct().getPrice())
                        .quantity(item.getQuantity())
                        .subTotal(item.getProduct().getPrice() * item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        Double totalAmount = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubTotal)
                .sum();

        return CartResponse.builder()
                .items(itemResponses)
                .totalAmount(totalAmount)
                .build();
    }

    @Override
    @Transactional
    public void clearCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        cartItemRepository.deleteAllByUserId(user.getId());
    }
}
