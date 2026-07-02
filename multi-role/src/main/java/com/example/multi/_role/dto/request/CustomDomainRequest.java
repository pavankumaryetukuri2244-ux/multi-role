package com.example.multi._role.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomDomainRequest {

    @NotBlank(message = "Custom domain is required")
    private String customDomain;
}
