package com.example.multi._role.exception;

public class DuplicateCartItemException extends RuntimeException {
    public DuplicateCartItemException(String message) {
        super(message);
    }
}
