package com.example.multi._role;

import com.example.multi._role.dto.request.CategoryRequest;
import com.example.multi._role.dto.response.CategoryResponse;
import com.example.multi._role.dto.response.UserCategoryResponse;
import com.example.multi._role.entity.Role;
import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.exception.DuplicateCategoryException;
import com.example.multi._role.exception.UnauthorizedTenantAccessException;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.TenantRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.CategoryService;
import com.example.multi._role.service.UserCategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CategoryManagementTests {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserCategoryService userCategoryService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User tenant1Admin;
    private User tenant1User;
    private User tenant2Admin;
    private Tenant tenant1;
    private Tenant tenant2;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByRoleName(RoleType.ADMIN)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName(RoleType.ADMIN);
                    return roleRepository.save(r);
                });

        Role userRole = roleRepository.findByRoleName(RoleType.USER)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName(RoleType.USER);
                    return roleRepository.save(r);
                });

        tenant1 = new Tenant();
        tenant1.setName("Tenant One");
        tenant1.setSubdomain("tenant1");
        tenant1.setTenantCode("T1");
        tenant1 = tenantRepository.save(tenant1);

        tenant2 = new Tenant();
        tenant2.setName("Tenant Two");
        tenant2.setSubdomain("tenant2");
        tenant2.setTenantCode("T2");
        tenant2 = tenantRepository.save(tenant2);

        tenant1Admin = new User();
        tenant1Admin.setFirstName("T1");
        tenant1Admin.setLastName("Admin");
        tenant1Admin.setEmail("admin1@tenant1.com");
        tenant1Admin.setPassword("password");
        tenant1Admin.setRole(adminRole);
        tenant1Admin.setTenant(tenant1);
        tenant1Admin = userRepository.save(tenant1Admin);

        tenant1User = new User();
        tenant1User.setFirstName("T1");
        tenant1User.setLastName("User");
        tenant1User.setEmail("user1@tenant1.com");
        tenant1User.setPassword("password");
        tenant1User.setRole(userRole);
        tenant1User.setTenant(tenant1);
        tenant1User = userRepository.save(tenant1User);

        tenant2Admin = new User();
        tenant2Admin.setFirstName("T2");
        tenant2Admin.setLastName("Admin");
        tenant2Admin.setEmail("admin2@tenant2.com");
        tenant2Admin.setPassword("password");
        tenant2Admin.setRole(adminRole);
        tenant2Admin.setTenant(tenant2);
        tenant2Admin = userRepository.save(tenant2Admin);
    }

    @Test
    void testCreateCategoryAndUniquenessWithinTenant() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Electronics");
        request.setCategoryCode("ELEC");
        request.setDescription("Gadgets and Devices");

        CategoryResponse response = categoryService.createCategory(request, tenant1Admin.getEmail());
        assertNotNull(response.getId());
        assertEquals("Electronics", response.getName());
        assertEquals("ELEC", response.getCategoryCode());

        // Creating again in the same tenant should fail
        assertThrows(DuplicateCategoryException.class, () -> 
            categoryService.createCategory(request, tenant1Admin.getEmail())
        );

        // Creating in different tenant with same name/code should succeed
        CategoryResponse response2 = categoryService.createCategory(request, tenant2Admin.getEmail());
        assertNotNull(response2.getId());
        assertNotEquals(response.getId(), response2.getId());
    }

    @Test
    void testUserCategorySelectionAndIsolation() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Electronics");
        request.setCategoryCode("ELEC");

        CategoryResponse t1Category = categoryService.createCategory(request, tenant1Admin.getEmail());
        CategoryResponse t2Category = categoryService.createCategory(request, tenant2Admin.getEmail());

        // T1 user selects T1 category - should succeed
        UserCategoryResponse selResponse = userCategoryService.selectCategory(t1Category.getId(), tenant1User.getEmail());
        assertNotNull(selResponse.getId());
        assertEquals(t1Category.getId(), selResponse.getCategoryId());

        // T1 user selects T2 category - should fail
        assertThrows(UnauthorizedTenantAccessException.class, () ->
            userCategoryService.selectCategory(t2Category.getId(), tenant1User.getEmail())
        );
    }
}
