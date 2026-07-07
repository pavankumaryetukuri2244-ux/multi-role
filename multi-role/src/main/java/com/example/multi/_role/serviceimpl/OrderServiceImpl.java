package com.example.multi._role.serviceimpl;

import com.example.multi._role.entity.Order;
import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.OrderRepository;
import com.example.multi._role.repository.ProductRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Order placeOrder(Long productId, Integer quantity, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Tenant tenant = user.getTenant();
        if (tenant == null) {
            throw new RuntimeException("User is not associated with any tenant");
        }

        if (!product.getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized: Product does not belong to your tenant");
        }

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }

        // Decrement stock
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);

        // Place order
        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setTotalPrice(product.getPrice() * quantity);
        order.setOrderDate(LocalDateTime.now());
        order.setTenant(tenant);

        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByTenant(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            return Collections.emptyList();
        }
        return orderRepository.findByTenant(tenant);
    }
}
