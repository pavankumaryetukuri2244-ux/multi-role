package com.example.multi._role.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String planCode; // FREE, STARTER, BUSINESS, PRO, ENTERPRISE

    private String description;

    @Column(nullable = false)
    private BigDecimal price; // Standard monthly price (fallback)

    @Column(nullable = false)
    private BigDecimal monthlyPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal yearlyPrice = BigDecimal.ZERO;

    private Integer durationDays = 30;

    @Column(nullable = false)
    private Boolean active = true;

    private String features;

    // SaaS resource limits
    private Integer maxAdmins = 1;
    private Integer maxUsers = 10;
    private Integer maxProducts = 100;
    private Long storageLimit = 1024L; // in MB
    private Integer aiRequestLimit = 0;
    
    // Feature enablement flags
    private Boolean customDomainEnabled = false;
    private Boolean analyticsEnabled = false;
    private Boolean apiAccessEnabled = false;
}
