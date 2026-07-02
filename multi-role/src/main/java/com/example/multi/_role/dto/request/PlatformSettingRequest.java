package com.example.multi._role.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlatformSettingRequest {

    @NotBlank(message = "Setting key is required")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    private String settingValue;

    private String description;
}
