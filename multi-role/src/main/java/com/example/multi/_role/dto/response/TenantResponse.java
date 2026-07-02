package com.example.multi._role.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {

    private Long id;

    private String name;

    private String companyName;

    private String subdomain;

    private String customDomain;

    private Boolean active;

    private String tenantUrl;

    private String adminName;

    private Set<String> categories;
}
