package com.example.multi._role.repository;

import com.example.multi._role.entity.Order;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTenant(Tenant tenant);
    List<Order> findByUser(User user);
}
