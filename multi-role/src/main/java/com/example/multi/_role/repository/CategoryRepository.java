package com.example.multi._role.repository;

import com.example.multi._role.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
    Optional<Category> findByCategoryCode(String categoryCode);
    boolean existsByCategoryCode(String categoryCode);

    // Tenant-specific query methods
    Optional<Category> findByNameAndTenantId(String name, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
    Optional<Category> findByCategoryCodeAndTenantId(String categoryCode, Long tenantId);
    boolean existsByCategoryCodeAndTenantId(String categoryCode, Long tenantId);
    List<Category> findAllByTenantId(Long tenantId);
    List<Category> findAllByTenantIdAndStatus(Long tenantId, String status);
    Optional<Category> findByIdAndTenantId(Long id, Long tenantId);
}
