package com.example.multi._role.service;

import com.example.multi._role.dto.response.UserCategoryResponse;
import java.util.List;

public interface UserCategoryService {
    UserCategoryResponse selectCategory(Long categoryId, String userEmail);
    List<UserCategoryResponse> getSelectedCategories(String userEmail);
    void deselectCategory(Long categoryId, String userEmail);
}
