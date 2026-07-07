package com.example.multi._role;

import com.example.multi._role.dto.request.UpdateProfileRequest;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.entity.Role;
import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserProfileTests {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        Role userRole = roleRepository.findByRoleName(RoleType.USER)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName(RoleType.USER);
                    return roleRepository.save(r);
                });

        testUser = new User();
        testUser.setFirstName("Alice");
        testUser.setLastName("Smith");
        testUser.setEmail("alice.smith@example.com");
        testUser.setPassword("securePassword123");
        testUser.setRole(userRole);
        testUser = userRepository.save(testUser);
    }

    @Test
    void testGetAndUpdateProfile() {
        UserResponse response = userService.getProfile(testUser.getEmail());
        assertEquals("Alice", response.getFirstName());
        assertEquals("Smith", response.getLastName());

        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setFirstName("Alicia");
        updateRequest.setLastName("Smithy");

        UserResponse updated = userService.updateProfile(updateRequest, testUser.getEmail());
        assertEquals("Alicia", updated.getFirstName());
        assertEquals("Smithy", updated.getLastName());
    }

    @Test
    void testUploadProfileImage() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                "some image content".getBytes()
        );

        UserResponse response = userService.uploadProfileImage(file, testUser.getEmail());
        assertNotNull(response.getProfileImage());
        assertTrue(response.getProfileImage().endsWith(".png"));

        // Verify stored in DB
        Optional<User> savedUser = userRepository.findByEmail(testUser.getEmail());
        assertTrue(savedUser.isPresent());
        assertEquals(response.getProfileImage(), savedUser.get().getProfileImage());
    }

    @Test
    void testDeleteAccount() {
        userService.deleteAccount(testUser.getEmail());

        Optional<User> deletedUser = userRepository.findByEmail(testUser.getEmail());
        assertTrue(deletedUser.isPresent());
        assertFalse(deletedUser.get().getActive());
        assertEquals("DELETED", deletedUser.get().getStatus());
    }
}
