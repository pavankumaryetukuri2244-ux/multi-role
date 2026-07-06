package com.example.multi._role.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tenant_domains")
public class TenantDomain extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, unique = true)
    private String domainName;

    @Column(nullable = false)
    private String type; // SUBDOMAIN, CUSTOM_DOMAIN

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, PENDING_VERIFICATION
}
