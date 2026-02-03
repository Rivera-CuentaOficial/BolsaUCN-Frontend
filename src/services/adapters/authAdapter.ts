// src/services/adapters/authAdapter.ts

import { 
  AdminResponseDto,
  AdminRequestDto, 
  CompanyResponseDto, 
  CompanyRequestDto,
  IndividualResponseDto, 
  IndividualRequestDto,
  StudentResponseDto,
  StudentRequestDto,
  LoginResponseDto, 
  ResendVerificationResponseDto, 
  VerifyEmailResponseDto 
} from "../dtos/authDto";

//Interfaces
export interface StudentForm{
    nombre: string;
    apellido: string;
    email: string;
    rut: string;
    telefono: string;
    password: string;
    confirmPassword: string;
    discapacidad: string;
}

export interface CompanyForm {
  nombreEmpresa: string;
  razonSocial: string;
  rut: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

export interface IndividualForm {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

export interface AdminForm {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  superAdmin: boolean;
}

// Login Adapter
export function mapLoginResponse(dto: any) {
  // AHORA SOPORTA:
  // 1. .NET por defecto: { Data: "token", Message: "..." }
  // 2. .NET con camelCase: { data: "token", message: "..." }
  // 3. Formatos anidados: { data: { token: "..." } }
  
  const token = 
    dto?.token ??           // Directo (raro en tu backend)
    dto?.data?.token ??     // Anidado en data
    dto?.Data ??            // .NET PascalCase (¡IMPORTANTE!)
    dto?.data ??            // .NET camelCase
    null;

  const message = 
    dto?.message ??         // camelCase
    (token ? "Login exitoso" : "Credenciales inválidas");

  return { message, token };
}
// Register Adapters
// Admin
export const AdminAdapter = {
  toDTO(formData: AdminForm): AdminRequestDto {
    return {
      FirstName: formData.nombre,
      LastName: formData.apellido,
      Email: formData.email,
      Rut: formData.rut,
      PhoneNumber: formData.telefono,
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
      SuperAdmin: formData.superAdmin,
    };
  },
  fromResponse(dto: AdminResponseDto): { message: string } {
    return { message: dto.message ?? "Registro de administrador exitoso" };
  },
}

// Company
export const CompanyAdapter = {
  toDTO(formData: CompanyForm): CompanyRequestDto {
    return {
      FirstName: formData.nombreEmpresa,
      LegalName: formData.razonSocial,
      Rut: formData.rut,
      Email: formData.email,
      PhoneNumber: formData.telefono,
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
    };
  },
  fromResponse(dto: CompanyResponseDto): { message: string } {
    return { message: dto.message ?? "Registro de empresa exitoso" };
  },
}

// Individual
export const IndividualAdapter = {
  toDTO(formData: IndividualForm): IndividualRequestDto {
    return {
      FirstName: formData.nombre,
      LastName: formData.apellido,
      Email: formData.email,
      Rut: formData.rut,
      PhoneNumber: formData.telefono,
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
    };
  },
  fromResponse(dto: IndividualResponseDto): { message: string } {
    return { message: dto.message ?? "Registro de individuo exitoso" };
  },
}
// Student
export const StudentAdapter = {
  toDTO(formData: StudentForm): StudentRequestDto {
    const emailLocalPart = formData.email.replace(/@.*/g, ""); // elimina cualquier dominio si lo escriben
    const finalEmail = `${emailLocalPart}@alumnos.ucn.cl`;

    return {
      FirstName: formData.nombre,
      LastName: formData.apellido,
      Email: finalEmail,
      Rut: formData.rut,
      PhoneNumber: formData.telefono,
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
      Disability: formData.discapacidad,
    };
  },
  fromResponse(dto: StudentResponseDto): { message: string } {
    return { message: dto.message ?? "Registro de estudiante exitoso" };
  },
};

// Email Verification Adapters
// Verify-Email
export const EmailVerificationAdapter = {
  // Verify
  fromVerifyResponse(dto: VerifyEmailResponseDto): { message: string; info: any | null } {
    return {
      message: dto.message ?? "Email verificado exitosamente",
      info: dto.data ?? null,
    };
  },
  // Resend
  fromResendResponse(dto: ResendVerificationResponseDto): { message: string; info: any | null } {
    return {
      message: dto.message ?? "Email de verificación reenviado exitosamente",
      info: dto.data ?? null,
    };
  },
};

// Reset Password Adapters
export const PasswordResetAdapter = {
  // Reset
  fromResetResponse(dto: VerifyEmailResponseDto): { message: string; info: any | null } {
    return {
      message: dto.message ?? "Contraseña restablecida exitosamente",
      info: dto.data ?? null,
    };
  },
  // Resend
  fromVerificationResponse(dto: ResendVerificationResponseDto): { message: string; info: any | null } {
    return {
      message: dto.message ?? "Código de verificación enviado exitosamente",
      info: dto.data ?? null,
    };
  }
}