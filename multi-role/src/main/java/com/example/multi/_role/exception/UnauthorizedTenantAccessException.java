package com.example.multi._role.exception;

public class UnauthorizedTenantAccessException extends RuntimeException {
    public UnauthorizedTenantAccessException(String message) {
        super(message);
    }
}
