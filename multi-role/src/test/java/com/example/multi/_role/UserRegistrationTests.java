package com.example.multi._role;

import com.example.multi._role.dto.request.UserRegisterRequest;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserRegistrationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testUserRegistrationAndPersistence() {
        UserRegisterRequest request = new UserRegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setPhone("1234567890");

        UserResponse response = authService.registerUser(request);
        assertNotNull(response.getId());
        assertEquals("john.doe@example.com", response.getEmail());

        // Verify it is saved in the repository
        Optional<User> savedUserOpt = userRepository.findByEmail("john.doe@example.com");
        assertTrue(savedUserOpt.isPresent());
        User savedUser = savedUserOpt.get();
        assertEquals("John", savedUser.getFirstName());
        assertEquals("Doe", savedUser.getLastName());
        assertTrue(savedUser.getActive());
        assertTrue(savedUser.getApproved());
    }
}
