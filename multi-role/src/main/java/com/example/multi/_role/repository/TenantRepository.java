package com.example.multi._role.repository;

import com.example.multi._role.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findBySubdomain(String subdomain);
    boolean existsBySubdomain(String subdomain);
    Optional<Tenant> findByCustomDomain(String customDomain);
    boolean existsByCustomDomain(String customDomain);
    Optional<Tenant> findByTenantCode(String tenantCode);
    boolean existsByTenantCode(String tenantCode);
}
