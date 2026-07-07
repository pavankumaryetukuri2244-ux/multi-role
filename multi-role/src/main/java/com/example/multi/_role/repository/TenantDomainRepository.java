package com.example.multi._role.repository;

import com.example.multi._role.entity.TenantDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TenantDomainRepository extends JpaRepository<TenantDomain, Long> {
    List<TenantDomain> findByTenantId(Long tenantId);
    Optional<TenantDomain> findByDomainName(String domainName);
    boolean existsByDomainName(String domainName);
}
