package com.example.multi._role.repository;

import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByTenant(Tenant tenant);
}
