package com.example.multi._role.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SubscriptionPlanRequest {

    @NotBlank(message = "Plan name is required")
    private String name;

    @NotBlank(message = "Plan code is required")
    private String planCode;

    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal price;

    @NotNull(message = "Monthly price is required")
    private BigDecimal monthlyPrice;

    @NotNull(message = "Yearly price is required")
    private BigDecimal yearlyPrice;

    private Integer durationDays = 30;

    private Boolean active;

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
