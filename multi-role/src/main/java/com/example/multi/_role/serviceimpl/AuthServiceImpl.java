package com.example.multi._role.serviceimpl;

import com.example.multi._role.dto.request.LoginRequest;
import com.example.multi._role.dto.request.RegisterAdminRequest;
import com.example.multi._role.dto.request.ForgotPasswordRequest;
import com.example.multi._role.dto.request.ResetPasswordRequest;
import com.example.multi._role.dto.request.UserRegisterRequest;
import com.example.multi._role.dto.request.LogoutRequest;
import com.example.multi._role.dto.response.LoginResponse;
import com.example.multi._role.dto.response.UserResponse;
import com.example.multi._role.dto.response.LogoutResponse;
import com.example.multi._role.entity.Role;
import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.entity.PasswordResetToken;
import com.example.multi._role.entity.TokenBlacklist;
import com.example.multi._role.repository.RoleRepository;
import com.example.multi._role.repository.TenantRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.repository.PasswordResetTokenRepository;
import com.example.multi._role.repository.TokenBlacklistRepository;
import com.example.multi._role.security.JwtService;
import com.example.multi._role.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid email or password"
                        ));

        // Optional: validate provided name matches user's first or last name (skip if not provided)
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String providedName = request.getName().trim();
            boolean matchesName = providedName.equalsIgnoreCase(user.getFirstName()) || 
                                  providedName.equalsIgnoreCase(user.getLastName()) ||
                                  providedName.equalsIgnoreCase(user.getFirstName() + " " + user.getLastName());
            if (!matchesName) {
                throw new BadCredentialsException("Invalid name provided for the given email");
            }
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("User account is disabled. Please contact an administrator.");
        }

        if (!Boolean.TRUE.equals(user.getApproved())) {
            throw new DisabledException("Account pending approval from Super Admin.");
        }

        boolean passwordMatched =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatched) {
            throw new BadCredentialsException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
                        .getRoleName()
                        .name()
        );

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(
                        user.getRole()
                                .getRoleName()
                                .name()
                )
                .message("Login Successful")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse adminLogin(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid email or password"
                        ));

        // Optional: validate provided name matches user's first or last name (skip if not provided)
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String providedName = request.getName().trim();
            boolean matchesName = providedName.equalsIgnoreCase(user.getFirstName()) || 
                                  providedName.equalsIgnoreCase(user.getLastName()) ||
                                  providedName.equalsIgnoreCase(user.getFirstName() + " " + user.getLastName());
            if (!matchesName) {
                throw new BadCredentialsException("Invalid name provided for the given email");
            }
        }

        // Check if user has ADMIN or SUPER_ADMIN role
        RoleType userRole = user.getRole().getRoleName();
        if (userRole != RoleType.ADMIN && userRole != RoleType.SUPER_ADMIN) {
            throw new BadCredentialsException(
                    "Only admin users can access this endpoint"
            );
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("Admin account is disabled. Please contact a Super Admin.");
        }

        if (!Boolean.TRUE.equals(user.getApproved())) {
            throw new DisabledException("Admin account pending approval from Super Admin.");
        }

        boolean passwordMatched =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatched) {
            throw new BadCredentialsException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
                        .getRoleName()
                        .name()
        );

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(
                        user.getRole()
                                .getRoleName()
                                .name()
                )
                .message("Admin Login Successful")
                .build();
    }

    @Override
    @Transactional
    public UserResponse registerAdmin(RegisterAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
            throw new RuntimeException("Subdomain is already taken");
        }

        // Create an Active Tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getCompanyName());
        tenant.setSubdomain(request.getSubdomain());
        tenant.setActive(true);
        tenant = tenantRepository.save(tenant);

        // Fetch ADMIN role
        Role adminRole = roleRepository.findByRoleName(RoleType.ADMIN)
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        // Create Active & Approved Admin User
        User admin = new User();
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setActive(true);
        admin.setApproved(true);
        admin.setRole(adminRole);
        admin.setTenant(tenant);

        User savedAdmin = userRepository.save(admin);

        return UserResponse.builder()
                .id(savedAdmin.getId())
                .firstName(savedAdmin.getFirstName())
                .lastName(savedAdmin.getLastName())
                .email(savedAdmin.getEmail())
                .role(RoleType.ADMIN.name())
                .active(savedAdmin.getActive())
                .approved(savedAdmin.getApproved())
                .tenantName(tenant.getName())
                .categories(Collections.emptySet())
                .build();
    }

    @Override
    @Transactional
    public void generatePasswordResetOtp(ForgotPasswordRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user registered with this email"));

        // Generate 6-digit OTP
        int otpInt = (int) (Math.random() * 900000) + 100000;
        String otp = String.valueOf(otpInt);

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));
        token.setUsed(false);
        passwordResetTokenRepository.save(token);

        // In production, send via email. For now, log to console
        System.out.println("[DEV] Password reset OTP for " + email + " is: " + otp);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();
        String newPassword = request.getNewPassword();

        PasswordResetToken token = passwordResetTokenRepository
                .findTopByEmailAndOtpAndUsedFalseOrderByExpiresAtDesc(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP or email"));

        if (token.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user registered with this email"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    @Override
    @Transactional
    public UserResponse registerUser(UserRegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadCredentialsException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Get USER role
        Role userRole = roleRepository.findByRoleName(RoleType.USER)
                .orElseThrow(() -> new RuntimeException("USER role not found"));

        // Create new user (pending approval by default)
        User newUser = new User();
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(userRole);
        newUser.setActive(true);
        newUser.setApproved(false); // Pending admin approval

        User savedUser = userRepository.save(newUser);

        return UserResponse.builder()
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .role(RoleType.USER.name())
                .active(savedUser.getActive())
                .approved(savedUser.getApproved())
                .categories(Collections.emptySet())
                .build();
    }

    @Override
    @Transactional
    public LogoutResponse logout(LogoutRequest request) {
        String token = request.getToken();

        // Extract email and expiration from token
        String email = jwtService.extractUsername(token);
        
        // Get the expiration date from the token
        Date expirationDate = jwtService.extractClaim(token, claims -> {
            return claims.getExpiration();
        });

        // Add token to blacklist
        TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                .token(token)
                .email(email)
                .expiresAt(expirationDate.toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime())
                .build();

        tokenBlacklistRepository.save(blacklistedToken);

        return LogoutResponse.builder()
                .success(true)
                .message("Logout successful")
                .email(email)
                .build();
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.existsByToken(token);
    }
}
