package com.example.multi._role.repository;

import com.example.multi._role.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByEmailAndOtpAndUsedFalseOrderByExpiresAtDesc(String email, String otp);
}