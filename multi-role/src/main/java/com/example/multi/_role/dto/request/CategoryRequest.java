package com.example.multi._role.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Category code is required")
    private String categoryCode;

    private String description;

    private String icon;

    private String status = "ACTIVE";
}
