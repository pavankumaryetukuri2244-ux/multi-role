package com.example.multi._role.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import lombok.Getter;
import lombok.Setter;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "tenants")
public class Tenant extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String subdomain;

    @Column(nullable = false, unique = true)
    private String tenantCode;

    @Column(unique = true)
    private String customDomain;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(nullable = false)
    private Boolean active = true;

    @jakarta.persistence.OneToMany(mappedBy = "tenant", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private Set<Category> categories = new HashSet<>();

    @jakarta.persistence.ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_plan_id")
    private SubscriptionPlan subscriptionPlan;

    public String getTenantUrl() {
        return "http://" + subdomain + ".saas.local:8080";
    }
}
