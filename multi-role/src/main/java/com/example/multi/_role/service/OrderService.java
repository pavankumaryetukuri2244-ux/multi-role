package com.example.multi._role.service;

import com.example.multi._role.entity.Order;
import java.util.List;

public interface OrderService {
    Order placeOrder(Long productId, Integer quantity, String userEmail);
    List<Order> getOrdersByUser(String userEmail);
    List<Order> getOrdersByTenant(String adminEmail);
}
