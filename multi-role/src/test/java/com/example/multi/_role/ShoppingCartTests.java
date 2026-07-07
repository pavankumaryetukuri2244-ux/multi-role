package com.example.multi._role;

import com.example.multi._role.dto.request.CartItemRequest;
import com.example.multi._role.dto.response.CartResponse;
import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.Role;
import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.exception.DuplicateCartItemException;
import com.example.multi._role.exception.InsufficientStockException;
import com.example.multi._role.exception.UnauthorizedTenantAccessException;
import com.example.multi._role.repository.ProductRepository;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.TenantRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShoppingCartTests {

    @Autowired
    private CartService cartService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProductRepository productRepository;

    private User tenant1User;
    private User tenant2User;
    private Product tenant1Product;
    private Product tenant2Product;
    private Product lowStockProduct;

    @BeforeEach
    void setUp() {
        Role userRole = roleRepository.findByRoleName(RoleType.USER)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName(RoleType.USER);
                    return roleRepository.save(r);
                });

        Tenant tenant1 = new Tenant();
        tenant1.setName("Tenant A");
        tenant1.setSubdomain("tenanta");
        tenant1.setTenantCode("TA");
        tenant1 = tenantRepository.save(tenant1);

        Tenant tenant2 = new Tenant();
        tenant2.setName("Tenant B");
        tenant2.setSubdomain("tenantb");
        tenant2.setTenantCode("TB");
        tenant2 = tenantRepository.save(tenant2);

        tenant1User = new User();
        tenant1User.setFirstName("User");
        tenant1User.setLastName("A");
        tenant1User.setEmail("user@tenanta.com");
        tenant1User.setPassword("password");
        tenant1User.setRole(userRole);
        tenant1User.setTenant(tenant1);
        tenant1User = userRepository.save(tenant1User);

        tenant2User = new User();
        tenant2User.setFirstName("User");
        tenant2User.setLastName("B");
        tenant2User.setEmail("user@tenantb.com");
        tenant2User.setPassword("password");
        tenant2User.setRole(userRole);
        tenant2User.setTenant(tenant2);
        tenant2User = userRepository.save(tenant2User);

        tenant1Product = new Product();
        tenant1Product.setName("Laptop");
        tenant1Product.setPrice(1200.0);
        tenant1Product.setStock(5);
        tenant1Product.setTenant(tenant1);
        tenant1Product = productRepository.save(tenant1Product);

        tenant2Product = new Product();
        tenant2Product.setName("Phone");
        tenant2Product.setPrice(800.0);
        tenant2Product.setStock(10);
        tenant2Product.setTenant(tenant2);
        tenant2Product = productRepository.save(tenant2Product);

        lowStockProduct = new Product();
        lowStockProduct.setName("Low Stock Item");
        lowStockProduct.setPrice(10.0);
        lowStockProduct.setStock(1);
        lowStockProduct.setTenant(tenant1);
        lowStockProduct = productRepository.save(lowStockProduct);
    }

    @Test
    void testAddProductToCartAndStockValidation() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(tenant1Product.getId());
        request.setQuantity(2);

        CartResponse cart = cartService.addProductToCart(request, tenant1User.getEmail());
        assertEquals(1, cart.getItems().size());
        assertEquals(2400.0, cart.getTotalAmount());

        // Attempting to add duplicate item should fail
        assertThrows(DuplicateCartItemException.class, () ->
                cartService.addProductToCart(request, tenant1User.getEmail())
        );

        // Attempting to add quantity exceeding stock should fail
        CartItemRequest overStockRequest = new CartItemRequest();
        overStockRequest.setProductId(lowStockProduct.getId());
        overStockRequest.setQuantity(10);
        assertThrows(InsufficientStockException.class, () ->
                cartService.addProductToCart(overStockRequest, tenant1User.getEmail())
        );
    }

    @Test
    void testTenantIsolation() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(tenant2Product.getId());
        request.setQuantity(1);

        // Tenant 1 User attempting to add Tenant 2 Product should fail
        assertThrows(UnauthorizedTenantAccessException.class, () ->
                cartService.addProductToCart(request, tenant1User.getEmail())
        );
    }

    @Test
    void testUpdateAndRemoveAndClearCart() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(tenant1Product.getId());
        request.setQuantity(1);

        CartResponse cart = cartService.addProductToCart(request, tenant1User.getEmail());
        Long cartItemId = cart.getItems().get(0).getId();

        // Update quantity
        cart = cartService.updateCartItemQuantity(cartItemId, 3, tenant1User.getEmail());
        assertEquals(3, cart.getItems().get(0).getQuantity());
        assertEquals(3600.0, cart.getTotalAmount());

        // Remove item
        cart = cartService.removeProductFromCart(cartItemId, tenant1User.getEmail());
        assertTrue(cart.getItems().isEmpty());
        assertEquals(0.0, cart.getTotalAmount());

        // Clear cart
        cartService.addProductToCart(request, tenant1User.getEmail());
        cartService.clearCart(tenant1User.getEmail());
        CartResponse finalCart = cartService.getCart(tenant1User.getEmail());
        assertTrue(finalCart.getItems().isEmpty());
    }
}
