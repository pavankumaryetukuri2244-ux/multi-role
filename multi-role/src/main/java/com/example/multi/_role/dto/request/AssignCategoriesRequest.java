package com.example.multi._role.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.Set;

@Data
public class AssignCategoriesRequest {

    @NotEmpty(message = "Category IDs list cannot be empty")
    private Set<Long> categoryIds;
}
