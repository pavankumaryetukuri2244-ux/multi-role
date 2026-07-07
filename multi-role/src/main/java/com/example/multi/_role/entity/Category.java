package com.example.multi._role.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"name", "tenant_id"}),
                @UniqueConstraint(columnNames = {"category_code", "tenant_id"})
        }
)
public class Category extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "category_code", nullable = false)
    private String categoryCode;

    private String description;

    private String icon;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;
}
