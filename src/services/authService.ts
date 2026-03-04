import api from "@/services/Service";
import {
  mapLoginResponse,
  AdminAdapter,
  CompanyAdapter,
  IndividualAdapter,
  StudentAdapter,
  EmailVerificationAdapter,
  PasswordResetAdapter,
} from "@/services/adapters/authAdapter";
import type {
  LoginRequestDto,
  LoginResponseDto,
  AdminRequestDto,
  AdminResponseDto,
  CompanyRequestDto,
  CompanyResponseDto,
  IndividualRequestDto,
  IndividualResponseDto,
  StudentRequestDto,
  StudentResponseDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
  ResendVerificationDto,
  ResendVerificationResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  VerifyResetCodeDto,
  VerifyResetCodeResponseDto,
} from "@/services/dtos/authDto";

// Authentication
export async function login(payload: LoginRequestDto | any) {
  const response = await api.post<LoginResponseDto>("/auth/login", payload);
  return mapLoginResponse(response.data);
}

// Register Services
export async function registerAdmin(payload: AdminRequestDto | any) {
  const response = await api.post<AdminResponseDto>("/auth/register/admin", payload);
  return AdminAdapter.fromResponse(response.data);
}

export async function registerCompany(payload: CompanyRequestDto | any) {
  const response = await api.post<CompanyResponseDto>("/auth/register/company", payload);
  return CompanyAdapter.fromResponse(response.data);
}

export async function registerIndividual(payload: IndividualRequestDto | any) {
  const response = await api.post<IndividualResponseDto>("/auth/register/individual", payload);
  return IndividualAdapter.fromResponse(response.data);
}

export async function registerStudent(payload: StudentRequestDto) {
  const response = await api.post<StudentResponseDto>("/auth/register/student", payload);
  return StudentAdapter.fromResponse(response.data);
}

// Email Verification
export async function verifyEmail(payload: VerifyEmailDto | any) {
  const response = await api.post<VerifyEmailResponseDto>("/auth/verify-email", payload);
  return EmailVerificationAdapter.fromVerifyResponse(response.data);
}

export async function resendVerification(payload: ResendVerificationDto | any) {
  const response = await api.post<ResendVerificationResponseDto>("/auth/resend-verification");
  return EmailVerificationAdapter.fromResendResponse(response.data);
}

// Reset Password
export async function sendCode(payload: ResetPasswordDto) {
  const response = await api.post<ResetPasswordResponseDto>("/auth/reset-password", payload);
  return PasswordResetAdapter.fromResetResponse(response.data);
}

export async function verifyResetCode(payload: VerifyResetCodeDto) {
  const response = await api.post<VerifyResetCodeResponseDto>("/auth/reset-code/verify", payload);
  return PasswordResetAdapter.fromVerificationResponse(response.data);
}

export async function resendCode(payload: ResetPasswordDto) {
  const response = await api.post<ResetPasswordResponseDto>("/auth/reset-password", payload);
  return PasswordResetAdapter.fromResetResponse(response.data);
}