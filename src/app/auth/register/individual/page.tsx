"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { registerIndividual } from "@/services/authService";
import { IndividualAdapter } from "@/services/adapters/authAdapter";
import { formatRut } from "@/utils/Util"
import { useFormValidation } from "@/hooks/auth/useFormValidation";
import { validators } from "@/utils/AuthValidatorsUtil";
import { FormField } from "@/components/forms/FormField";
import { PasswordField } from "@/components/forms/PasswordField";
import { NotificationBanner } from "@/components/ui";
import { useNotification } from "@/hooks/common/use-notification";

const PRIMARY_COLOR = "#2C3E90";
const OVERLAY_COLOR = "rgba(44, 114, 175, 0.4)";

//Validaciones del formulario
const individualValidationRules = {
  nombre: (value: string) => validators.name(value, "Nombre"),
  apellido: (value: string) => validators.name(value, "Apellido"),
  email: (value: string) => validators.regularEmail(value, "Email"),
  rut: (value: string) => validators.rut(value, "RUT"),
  telefono: (value: string) => validators.phone(value),
  password: (value: string) => validators.password(value, "Contraseña"),
  confirmPassword: (value: string, formData: any) => 
    validators.confirmPassword(value, formData?.password || ""),
};

export default function RegisterIndividualPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { 
    formData, 
    errors, 
    touched, 
    handleChange: baseHandleChange, 
    handleBlur, 
    validateAll,
  } = useFormValidation(
    {
      nombre: "",
      apellido: "",
      rut: "",
      email: "",
      telefono: "",
      password: "",
      confirmPassword: "",
    },
    individualValidationRules
  );
  const {notification, isVisible, show, close} = useNotification();

  // Format phone number for display (9 1234 5678)
  const formatPhoneDisplay = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
    return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === "rut") {
      const formatted = formatRut(e.target.value);
      e.target.value = formatted;
    }
    baseHandleChange(e);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9); // Only 9 digits
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: "telefono",
        value: digits,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    baseHandleChange(syntheticEvent);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (loading || success) return;

    if (!validateAll()) {
      const firstErrorField = Object.keys(errors)[0];
      document.getElementById(firstErrorField!)?.focus();
      return;
    }

    setLoading(true);

    try {
      const payload = IndividualAdapter.toDTO(formData);
      const response = await registerIndividual(payload);

      show(
        "Registro Exitoso",
        response.message ||"Se ha enviado un correo de verificación a la dirección proporcionada.",
        "success"
      );
      
      setSuccess(true);

      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    }catch (error: any) {
      console.error("Error en el registro:", error);

      const backendError = error?.response?.data;
      let errorMessage = "Error al registrarse. Por favor, inténtalo nuevamente.";

      if (backendError.details) {
          errorMessage += `\n${backendError.details}`;
        }

      if (backendError?.errors) {
        errorMessage = Object.entries(backendError.errors)
          .map(([field, messages]) => {
            const friendlyField = field === "Rut" ? "RUT" : field;
            return `${friendlyField}: ${(messages as string[]).join(", ")}`;
          })
          .join("\n");
      } else if (backendError?.message) {
        errorMessage = backendError.message;
        if (backendError.details) {
          errorMessage += `\n${backendError.details}`;
        }
      }

      show(
        "Error de Registro", 
        errorMessage, 
        "error"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NotificationBanner data={notification} isVisible={isVisible} onClose={close} />
      <main
        className="flex-grow flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/ucnferia.png')" }}
      >
        <div
          className="flex-grow flex items-center justify-center backdrop-blur-sm 
          p-4 w-full h-full"
          style={{ backgroundColor: OVERLAY_COLOR }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <div className="p-8">
              <div className="flex items-center justify-start pb-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-800 transition mr-4"
                  aria-label="Volver"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-medium text-gray-800">
                  Registro persona particular
                </h2>
              </div>
              <hr className="mb-6" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  id="nombre"
                  label="Nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur("nombre")}
                  error={errors.nombre ?? undefined}
                  touched={touched.nombre}
                />
                <FormField
                  id="apellido"
                  label="Apellido"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                  onBlur={() => handleBlur("apellido")}
                  error={errors.apellido ?? undefined}
                  touched={touched.apellido}
                />
                
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
                    Correo Personal *
                  </label>
                  <div
                    className={`flex items-center border ${
                      touched.email && errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md px-2 focus-within:ring-1 focus-within:ring-blue-500`}
                  >
                    <input
                      id="email"
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="juan.perez@ejemplo.com"
                      className="flex-grow p-2 text-sm focus:outline-none"
                    />
                    <span className="text-gray-600 text-sm"></span>
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <FormField
                  id="rut"
                  label="RUT"
                  placeholder="12345678-9"
                  value={formData.rut}
                  onChange={handleChange}
                  onBlur={() => handleBlur("rut")}
                  error={errors.rut ?? undefined}
                  touched={touched.rut}
                  description="Sin puntos, con guión (ej: 12345678-9)"
                />

                {/* Phone Number Field */}
                <div>
                  <label htmlFor="telefono" className="text-sm font-medium text-gray-700 block mb-1">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formatPhoneDisplay(formData.telefono)}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur("telefono")}
                      placeholder="9 1234 5678"
                      maxLength={11}
                      className={`w-full border ${
                        touched.telefono && errors.telefono ? "border-red-500" : "border-gray-300"
                      } rounded-md p-2 pl-20 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 pointer-events-none">
                      <Phone size={14} />
                      <span className="text-sm font-semibold">+56</span>
                    </div>
                  </div>
                  {touched.telefono && errors.telefono && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      {errors.telefono}
                    </p>
                  )}
                  {!errors.telefono && formData.telefono && (
                    <p className="text-gray-500 text-xs mt-1">
                      Tu teléfono completo: <span className="font-medium">+56{formData.telefono}</span>
                    </p>
                  )}
                </div>
                
                <PasswordField
                  id="password"
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  error={errors.password ?? undefined}
                  touched={touched.password}
                  showStrength={true}
                />

                <PasswordField
                  id="confirmPassword"
                  label="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  error={errors.confirmPassword ?? undefined}
                  touched={touched.confirmPassword}
                />

                <button
                  type="submit"
                  disabled={loading || success}
                  className={loading || success 
                    ? "w-full text-white rounded-md py-2 font-medium transition mt-6" 
                    : "cursor-pointer w-full text-white rounded-md py-2 font-medium transition mt-6"}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {success ? "Redirigiendo..." : loading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
              </form>

              <p className="text-center text-sm mt-6 text-gray-600">
                ¿Tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:underline transition"
                >
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
