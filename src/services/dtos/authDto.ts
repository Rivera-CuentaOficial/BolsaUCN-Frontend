// src/services/dtos/authDto.ts

// Login DTOs
// Request
export interface LoginRequestDto {
    Email: string;
    Password: string;
    RememberMe: boolean;
}
// Response
export interface LoginResponseDto {
    message: string;
    data?: string; // Este es el token.
}

// Register DTOs
// Admin
// Request
export interface AdminRequestDto {
    Email: string;
    Password: string;
    ConfirmPassword: string;
    FirstName: string;
    LastName: string;
    Rut: string;
    PhoneNumber: string;
    SuperAdmin: boolean;
}
// Response
export interface AdminResponseDto{
    message: string;
    data?: any;
}
// Company
// Request
export interface CompanyRequestDto{
    FirstName: string;
    LegalName: string;
    Email: string;
    Rut: string;
    PhoneNumber: string;
    Password: string;
    ConfirmPassword: string;
}
// Response
export interface CompanyResponseDto{
    message: string;
}
// Individual
// Request
export interface IndividualRequestDto{
    FirstName: string;
    LastName: string;
    Email: string;
    Rut: string;
    PhoneNumber: string;
    Password: string;
    ConfirmPassword: string;
}
// Response
export interface IndividualResponseDto{
    message: string;
}
// Student
// Request
export interface StudentRequestDto{
    FirstName: string;
    LastName: string;
    Email: string;
    Rut: string;
    PhoneNumber: string;
    Password: string;
    ConfirmPassword: string;
    Disability: string;
}
// Response
export interface StudentResponseDto{
    message: string;
}

// Email Verification DTOs
// Verify-Email
// Request
export interface VerifyEmailDto{
    Email: string;
    VerificationCode: string;
}
// Response
export interface VerifyEmailResponseDto{
    message: string;
    data?: string;
}
// Resend-Verification
// Request
export interface ResendVerificationDto{
    Email: string;
}
// Response
export interface ResendVerificationResponseDto{
    message: string;
    data?: string;
}

// Reset Password DTOs
// Reset
// Request
export interface ResetPasswordDto{
    Email: string;
}
// Response
export interface ResetPasswordResponseDto{
    message: string;
}
// Verification
// Request
export interface VerifyResetCodeDto{
    Email: string;
    verificationCode: string;
    password: string;
    confirmPassword: string;
}
// Response
export interface VerifyResetCodeResponseDto{
    message: string;
}