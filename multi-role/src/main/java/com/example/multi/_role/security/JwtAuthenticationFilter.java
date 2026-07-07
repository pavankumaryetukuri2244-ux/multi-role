package com.example.multi._role.security;

import com.example.multi._role.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AuthService authService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Skip JWT validation for public endpoints
        String requestUri = request.getRequestURI();
        if (requestUri.startsWith("/api/v1/auth/") || 
            requestUri.startsWith("/api/v1/public/") ||
            requestUri.startsWith("/h2-console/") ||
            requestUri.startsWith("/actuator/") ||
            requestUri.startsWith("/swagger-ui/") ||
            requestUri.startsWith("/v3/api-docs/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // For protected endpoints, Bearer token is REQUIRED
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        
        // Check if token is blacklisted (logged out)
        if (authService.isTokenBlacklisted(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Token expired or invalid - still continue but without authentication
            // Spring Security's @PreAuthorize and .authenticated() will handle rejection
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Handle scenario where user is not found (e.g. database wiped/reset)
            // Let the filter chain continue so Spring Security can reject the request with 401 Unauthorized
        }
        filterChain.doFilter(request, response);
    }
}
