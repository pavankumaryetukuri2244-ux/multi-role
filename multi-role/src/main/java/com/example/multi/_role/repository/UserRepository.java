package com.example.multi._role.repository;

import com.example.multi._role.entity.RoleType;
import com.example.multi._role.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.role WHERE u.role.roleName = :roleName")
    List<User> findByRoleRoleName(@Param("roleName") RoleType roleName);

    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.role WHERE u.tenant.id = :tenantId")
    List<User> findByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.role WHERE u.tenant.id = :tenantId AND u.role.roleName = :roleName")
    List<User> findByTenantIdAndRoleRoleName(@Param("tenantId") Long tenantId, @Param("roleName") RoleType roleName);
}
