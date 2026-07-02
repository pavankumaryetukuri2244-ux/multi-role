-- ===========================
-- CREATE DATABASE
-- ===========================
CREATE DATABASE IF NOT EXISTS saas_platform;

-- Switch to the database
-- Note: In PostgreSQL, you need to connect separately. 
-- Run this after creating the database:

-- ===========================
-- CREATE TABLES
-- ===========================

-- Create base_entity table (if using joined inheritance)
CREATE TABLE IF NOT EXISTS base_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    role_id UUID REFERENCES roles(id)
);

-- ===========================
-- CREATE INDEXES
-- ===========================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_role_name ON roles(role_name);

-- ===========================
-- INSERT DEFAULT ROLES
-- ===========================
INSERT INTO roles (role_name) 
VALUES 
    ('SUPER_ADMIN'),
    ('ADMIN'),
    ('USER')
ON CONFLICT (role_name) DO NOTHING;

-- ===========================
-- CREATE DEFAULT SUPER ADMIN USER
-- ===========================
-- Password: admin123 (hashed with BCrypt strength 10)
-- Hash generated from: $2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy3C0CG
INSERT INTO users (first_name, last_name, email, password, active, role_id)
SELECT 
    'Super', 
    'Admin', 
    'admin@saas.local',
    '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy3C0CG',
    true,
    (SELECT id FROM roles WHERE role_name = 'SUPER_ADMIN')
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@saas.local'
);

-- ===========================
-- VERIFY DATA
-- ===========================
SELECT 'Roles Created:' as status;
SELECT id, role_name FROM roles;

SELECT 'Users Created:' as status;
SELECT id, first_name, last_name, email, active FROM users;
