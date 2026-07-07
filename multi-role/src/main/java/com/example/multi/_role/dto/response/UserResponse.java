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
public class UserResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String role;

    private Boolean active;

    private Boolean approved;

    private String tenantName;

    private String companyName;

    private String subdomain;

    private String tenantCode;

    private String phone;

    private String profileImage;

    private java.time.LocalDateTime createdAt;

    private Set<String> categories;
}
