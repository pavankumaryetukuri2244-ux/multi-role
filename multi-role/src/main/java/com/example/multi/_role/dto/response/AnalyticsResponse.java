package com.example.multi._role.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private long totalTenants;

    private long activeTenants;

    private long totalAdmins;

    private long totalUsers;

    private long totalCategories;

    private long totalSubscriptionPlans;
}
